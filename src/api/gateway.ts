import { ENDPOINTS } from '../config';
import {
  STATUS_FOR_ACTION,
  toCount,
  toExposure,
  type DecisionOutcome,
  type DecisionRequest,
  type HistoryEntry,
  type OfficialDate,
  type PrepItem,
  type Proposal,
  type SourceInfo,
  type TeachingCourse,
  type WorkloadResult,
  type WorkloadSnapshot,
  type WorkloadWeek,
} from '../domain/c1';
import type { FailureKind } from '../domain/failures';
import type { FixtureViewState } from '../fixtures/c0';
import {
  fixtureHistory,
  fixtureOfficialDates,
  fixturePrep,
  fixtureProposals,
  fixtureTeachingCourses,
  fixtureWorkload,
} from '../fixtures/c1';
import { apiRequest, type ApiResult, type ClientDeps } from './client';

export interface Gateway {
  readonly kind: 'fixture' | 'http';
  getTeaching(): Promise<ApiResult<{ courses: TeachingCourse[]; prep: PrepItem[] }>>;
  getWorkload(): Promise<ApiResult<WorkloadResult>>;
  getProposals(): Promise<ApiResult<Proposal[]>>;
  getHistory(): Promise<ApiResult<HistoryEntry[]>>;
  getOfficialDates(): Promise<ApiResult<OfficialDate[]>>;
  submitDecision(req: DecisionRequest): Promise<DecisionOutcome>;
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
const never = <T>(): Promise<T> => new Promise<T>(() => {});
const fail = (kind: FailureKind): { ok: false; kind: FailureKind } => ({ ok: false, kind });

// =====================================================================================
// Fixture gateway: labelled fake data. Used ONLY when EXPO_PUBLIC_USE_FIXTURES=1.
// =====================================================================================

/** Scenario -> the failure every call should report (or null). */
function scenarioFailure(s: FixtureViewState): FailureKind | null {
  switch (s) {
    case 'network':
    case 'expired':
    case 'revoked':
    case 'forbidden':
    case 'unavailable':
    case 'timeout':
      return s;
    case 'error':
      return 'unavailable';
    default:
      return null;
  }
}

export function createFixtureGateway(getScenario: () => FixtureViewState, now: () => Date = () => new Date()): Gateway {
  let proposals: Proposal[] = clone(fixtureProposals);
  let history: HistoryEntry[] = clone(fixtureHistory);
  let nextId = 1;

  const markStale = (s: SourceInfo): SourceInfo => ({ ...s, stale: true });
  const markIncomplete = (s: SourceInfo): SourceInfo => ({ ...s, incomplete: true });

  return {
    kind: 'fixture',

    async getTeaching() {
      const s = getScenario();
      if (s === 'loading') return never();
      const f = scenarioFailure(s);
      if (f) return fail(f);
      if (s === 'empty') return { ok: true, data: { courses: [], prep: [] } };
      let courses = clone(fixtureTeachingCourses);
      if (s === 'stale') courses = courses.map((c) => ({ ...c, source: markStale(c.source) }));
      if (s === 'incomplete') courses = courses.map((c) => ({ ...c, source: markIncomplete(c.source) }));
      return { ok: true, data: { courses, prep: clone(fixturePrep) } };
    },

    async getWorkload() {
      const s = getScenario();
      if (s === 'loading') return never();
      if (s === 'timeout') return { ok: true, data: { status: 'timeout' } };
      const f = scenarioFailure(s);
      if (f) return fail(f);
      if (s === 'suppressed') return { ok: true, data: { status: 'suppressed' } };
      if (s === 'no_result' || s === 'empty') {
        return { ok: true, data: { status: 'no_result', reason: 'The optimizer found no date changes that would reduce crunch.' } };
      }
      return { ok: true, data: clone(fixtureWorkload) };
    },

    async getProposals() {
      const s = getScenario();
      if (s === 'loading') return never();
      const f = scenarioFailure(s);
      if (f) return fail(f);
      if (s === 'empty' || s === 'no_result' || s === 'suppressed') return { ok: true, data: [] };
      return { ok: true, data: clone(proposals) };
    },

    async getHistory() {
      const s = getScenario();
      if (s === 'loading') return never();
      const f = scenarioFailure(s);
      if (f) return fail(f);
      if (s === 'empty') return { ok: true, data: [] };
      return { ok: true, data: clone(history) };
    },

    async getOfficialDates() {
      const s = getScenario();
      if (s === 'loading') return never();
      const f = scenarioFailure(s);
      if (f) return fail(f);
      if (s === 'empty') return { ok: true, data: [] };
      let dates = clone(fixtureOfficialDates);
      if (s === 'stale') dates = dates.map((d) => ({ ...d, source: markStale(d.source) }));
      if (s === 'incomplete') dates = dates.map((d) => ({ ...d, source: markIncomplete(d.source) }));
      return { ok: true, data: dates };
    },

    async submitDecision(req) {
      const s = getScenario();
      if (s === 'loading') return never();
      // 'stale' = someone else decided first (version conflict). Nothing is changed.
      if (s === 'stale') return fail('stale');
      const f = scenarioFailure(s);
      if (f) return fail(f);

      const p = proposals.find((x) => x.id === req.proposalId);
      if (
        !p ||
        p.status !== 'pending' ||
        p.revision !== req.proposalRevision ||
        p.assessmentVersion !== req.expectedVersion
      ) {
        return fail('stale');
      }
      // Local decision only. Official dates are NOT touched anywhere in this gateway.
      p.status = STATUS_FOR_ACTION[req.action];
      p.assessmentVersion += 1;
      const entry: HistoryEntry = {
        id: `h-fixture-${nextId++}`,
        at: now().toISOString(),
        action: req.action,
        proposalId: p.id,
        title: p.title,
        actorRole: 'professor',
        resultStatus: p.status,
      };
      history = [entry, ...history];
      return { ok: true, proposalStatus: p.status, newVersion: p.assessmentVersion, entry: clone(entry) };
    },
  };
}

// =====================================================================================
// HTTP gateway: the real backend. It NEVER falls back to fixtures. Failure stays failure.
// =====================================================================================

const asObj = (x: unknown): Record<string, unknown> | null =>
  x && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : null;

const normSource = (x: unknown): SourceInfo => {
  const o = asObj(x) ?? {};
  const kind = o.kind === 'syllabus_pdf' || o.kind === 'manual' ? o.kind : 'canvas_api';
  return {
    kind,
    importedAt: typeof o.importedAt === 'string' ? o.importedAt : null,
    stale: o.stale === true,
    incomplete: o.incomplete === true,
  };
};

const normWeek = (x: unknown): WorkloadWeek => {
  const o = asObj(x) ?? {};
  const crunch = o.crunch === 'high' || o.crunch === 'medium' ? o.crunch : 'low';
  return {
    weekStart: String(o.weekStart ?? ''),
    crunch,
    assessmentCount: toCount(o.assessmentCount),
    affected: toExposure(o.affected),
  };
};

const normSnapshot = (x: unknown): WorkloadSnapshot => {
  const o = asObj(x) ?? {};
  return {
    inputVersion: typeof o.inputVersion === 'string' ? o.inputVersion : '',
    weeks: Array.isArray(o.weeks) ? o.weeks.map(normWeek) : [],
  };
};

const STATUSES = ['pending', 'approved_locally', 'rejected', 'locked'] as const;
const isStatus = (x: unknown): x is (typeof STATUSES)[number] => STATUSES.includes(x as never);

export function createHttpGateway(deps: ClientDeps): Gateway {
  const get = (path: string) => apiRequest(deps, path);
  const bad = fail('invalid_response');

  return {
    kind: 'http',

    async getTeaching() {
      const r = await get(ENDPOINTS.teaching);
      if (!r.ok) return r;
      const o = asObj(r.data);
      if (!o || !Array.isArray(o.courses)) return bad;
      const courses = o.courses.map((c): TeachingCourse => {
        const x = asObj(c) ?? {};
        const cov = asObj(x.coverage) ?? {};
        return {
          id: String(x.id ?? ''),
          code: String(x.code ?? ''),
          title: String(x.title ?? ''),
          source: normSource(x.source),
          coverage: { found: toCount(cov.found), expected: toCount(cov.expected) },
          review: x.review === 'reviewed' || x.review === 'needs_review' ? x.review : 'draft',
        };
      });
      const prep = (Array.isArray(o.prep) ? o.prep : []).map((p): PrepItem => {
        const x = asObj(p) ?? {};
        return {
          id: String(x.id ?? ''),
          courseId: String(x.courseId ?? ''),
          courseCode: String(x.courseCode ?? ''),
          title: String(x.title ?? ''),
          officialDate: String(x.officialDate ?? ''),
          review: x.review === 'reviewed' || x.review === 'needs_review' ? x.review : 'draft',
        };
      });
      return { ok: true, data: { courses, prep } };
    },

    async getWorkload() {
      const r = await get(ENDPOINTS.workload);
      if (!r.ok) return r;
      const o = asObj(r.data);
      if (!o) return bad;
      switch (o.status) {
        case 'ok':
          if (!Array.isArray(o.weeks)) return bad;
          return {
            ok: true,
            data: {
              status: 'ok',
              inputVersion: String(o.inputVersion ?? ''),
              computedAt: String(o.computedAt ?? ''),
              weeks: o.weeks.map(normWeek),
            },
          };
        case 'no_result':
          return { ok: true, data: { status: 'no_result', reason: String(o.reason ?? 'No result.') } };
        case 'suppressed':
          return { ok: true, data: { status: 'suppressed' } };
        case 'timeout':
          return { ok: true, data: { status: 'timeout' } };
        default:
          return bad;
      }
    },

    async getProposals() {
      const r = await get(ENDPOINTS.proposals);
      if (!r.ok) return r;
      if (!Array.isArray(r.data)) return bad;
      const data = r.data.map((p): Proposal => {
        const x = asObj(p) ?? {};
        return {
          id: String(x.id ?? ''),
          revision: typeof x.revision === 'number' ? x.revision : -1,
          assessmentId: String(x.assessmentId ?? ''),
          assessmentVersion: typeof x.assessmentVersion === 'number' ? x.assessmentVersion : -1,
          courseCode: String(x.courseCode ?? ''),
          title: String(x.title ?? ''),
          currentDate: String(x.currentDate ?? ''),
          proposedDate: String(x.proposedDate ?? ''),
          explanation: String(x.explanation ?? ''),
          status: isStatus(x.status) ? x.status : 'pending',
          before: normSnapshot(x.before),
          after: normSnapshot(x.after),
          overlapReduction: toExposure(x.overlapReduction),
        };
      });
      return { ok: true, data };
    },

    async getHistory() {
      const r = await get(ENDPOINTS.history);
      if (!r.ok) return r;
      if (!Array.isArray(r.data)) return bad;
      const data = r.data.map((h): HistoryEntry => {
        const x = asObj(h) ?? {};
        return {
          id: String(x.id ?? ''),
          at: String(x.at ?? ''),
          action: x.action === 'accept' || x.action === 'lock' ? x.action : 'reject',
          proposalId: String(x.proposalId ?? ''),
          title: String(x.title ?? ''),
          actorRole: String(x.actorRole ?? ''),
          resultStatus: isStatus(x.resultStatus) ? x.resultStatus : 'pending',
        };
      });
      return { ok: true, data };
    },

    async getOfficialDates() {
      const r = await get(ENDPOINTS.officialDates);
      if (!r.ok) return r;
      if (!Array.isArray(r.data)) return bad;
      const data = r.data.map((d): OfficialDate => {
        const x = asObj(d) ?? {};
        return {
          assessmentId: String(x.assessmentId ?? ''),
          courseCode: String(x.courseCode ?? ''),
          title: String(x.title ?? ''),
          officialDate: String(x.officialDate ?? ''),
          importedOfficialDate: String(x.importedOfficialDate ?? x.officialDate ?? ''),
          source: normSource(x.source),
        };
      });
      return { ok: true, data };
    },

    async submitDecision(req) {
      const r = await apiRequest(deps, ENDPOINTS.decisions, {
        method: 'POST',
        body: req,
        headers: { 'X-Client-Request-Id': req.clientRequestId },
      });
      // Anything but a clearly valid success from the backend is a failure. No success is invented.
      if (!r.ok) return r;
      const o = asObj(r.data);
      const e = asObj(o?.entry);
      if (!o || !e || !isStatus(o.proposalStatus) || typeof o.newVersion !== 'number') return bad;
      return {
        ok: true,
        proposalStatus: o.proposalStatus,
        newVersion: o.newVersion,
        entry: {
          id: String(e.id ?? ''),
          at: String(e.at ?? ''),
          action: req.action,
          proposalId: req.proposalId,
          title: String(e.title ?? ''),
          actorRole: String(e.actorRole ?? ''),
          resultStatus: o.proposalStatus,
        },
      };
    },
  };
}
