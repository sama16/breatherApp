/**
 * PLACEHOLDER C1/C2 types. Shapes are ASSUMED until the contracts are released.
 * Replace with the released types; keep the helpers (they encode the safety rules).
 *
 * Safety rules encoded here:
 *  - "missing" (null) is never shown as "zero"
 *  - aggregates can be suppressed (too few students) and are never replaced by a guess
 *  - same-input comparison refuses to compare results from different inputs
 *  - official dates are verified unchanged after any local approval
 */
import type { CrunchLevel } from '../fixtures/c0';

/** A count that may be unknown. null = missing/unknown. 0 = a real zero. */
export type Count = number | null;

export type Exposure =
  | { status: 'ok'; value: number }
  | { status: 'suppressed' }
  | { status: 'unavailable' };

export type SourceKind = 'canvas_api' | 'syllabus_pdf' | 'manual';
export interface SourceInfo {
  kind: SourceKind;
  importedAt: string | null;
  stale: boolean;
  incomplete: boolean;
}
export interface Coverage {
  found: Count;
  expected: Count;
}
export type ReviewStatus = 'draft' | 'needs_review' | 'reviewed';

export interface TeachingCourse {
  id: string;
  code: string;
  title: string;
  source: SourceInfo;
  coverage: Coverage;
  review: ReviewStatus;
}
export interface PrepItem {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  /** Official date. Read-only in the app. */
  officialDate: string;
  review: ReviewStatus;
}

export interface WorkloadWeek {
  weekStart: string;
  crunch: CrunchLevel;
  assessmentCount: Count;
  affected: Exposure;
}
export interface WorkloadSnapshot {
  inputVersion: string;
  weeks: WorkloadWeek[];
}
export type WorkloadResult =
  | { status: 'ok'; inputVersion: string; computedAt: string; weeks: WorkloadWeek[] }
  | { status: 'no_result'; reason: string }
  | { status: 'suppressed' }
  | { status: 'timeout' };

export type ProposalStatus = 'pending' | 'approved_locally' | 'rejected' | 'locked';
export interface Proposal {
  id: string;
  /** Immutable: a proposal's content never changes under the same id + revision. */
  revision: number;
  assessmentId: string;
  /** Version of the assessment this proposal was made against (optimistic concurrency). */
  assessmentVersion: number;
  courseCode: string;
  title: string;
  currentDate: string;
  proposedDate: string;
  explanation: string;
  status: ProposalStatus;
  before: WorkloadSnapshot;
  after: WorkloadSnapshot;
  overlapReduction: Exposure;
}

export type DecisionAction = 'accept' | 'reject' | 'lock';
export interface DecisionRequest {
  proposalId: string;
  proposalRevision: number;
  expectedVersion: number;
  action: DecisionAction;
  /** For tracing only. The backend, not this id, guarantees atomicity. */
  clientRequestId: string;
}
export interface HistoryEntry {
  id: string;
  at: string;
  action: DecisionAction;
  proposalId: string;
  title: string;
  actorRole: string;
  resultStatus: ProposalStatus;
}
export type DecisionOutcome =
  | { ok: true; proposalStatus: ProposalStatus; newVersion: number; entry: HistoryEntry }
  | { ok: false; kind: import('./failures').FailureKind };

export interface OfficialDate {
  assessmentId: string;
  courseCode: string;
  title: string;
  /** Current official date from the backend (Canvas). */
  officialDate: string;
  /** The date as first imported. */
  importedOfficialDate: string;
  source: SourceInfo;
}

export const LOCAL_APPROVAL_LABEL = 'Approved locally; not published';

export const STATUS_FOR_ACTION: Record<DecisionAction, ProposalStatus> = {
  accept: 'approved_locally',
  reject: 'rejected',
  lock: 'locked',
};

export function proposalStatusLabel(s: ProposalStatus): string {
  switch (s) {
    case 'pending':
      return 'Waiting for your decision';
    case 'approved_locally':
      return LOCAL_APPROVAL_LABEL;
    case 'rejected':
      return 'Rejected';
    case 'locked':
      return 'Date locked';
  }
}

// ---------- formatting (missing vs zero) ----------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-11-16" -> "16 Nov". Returns the input unchanged if it is not a plain date. */
export function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month}` : iso;
}

export const formatCount = (c: Count): string => (c === null ? 'Not available' : String(c));

export function formatExposure(e: Exposure): string {
  switch (e.status) {
    case 'ok':
      return `${e.value} ${e.value === 1 ? 'student' : 'students'}`;
    case 'suppressed':
      return 'Hidden (too few students)';
    case 'unavailable':
      return 'Not available';
  }
}

export function coverageText(c: Coverage): string {
  if (c.found === null) return 'Not available (the import has not reported a count)';
  const noun = (n: number) => (n === 1 ? 'assessment' : 'assessments');
  if (c.expected === null) return `${c.found} ${noun(c.found)} found (expected count unknown)`;
  return `${c.found} of ${c.expected} ${noun(c.expected)} found`;
}

const CRUNCH_WORD: Record<CrunchLevel, string> = { low: 'Low', medium: 'Medium', high: 'High' };
export const crunchWord = (l: CrunchLevel): string => CRUNCH_WORD[l];

/** Text equivalent of the workload display, for screen readers and the "table/text" requirement. */
export function workloadToText(weeks: WorkloadWeek[]): string {
  if (weeks.length === 0) return 'No weeks to show.';
  return weeks
    .map((w) => {
      const count =
        w.assessmentCount === null
          ? 'assessment count not available'
          : `${w.assessmentCount} ${w.assessmentCount === 1 ? 'assessment' : 'assessments'}`;
      return `Week of ${fmtDate(w.weekStart)}: ${crunchWord(w.crunch)} crunch, ${count}, ${formatExposure(w.affected)}.`;
    })
    .join(' ');
}

// ---------- same-input comparison ----------
export type Change = 'better' | 'worse' | 'same' | 'unknown';
export interface ComparisonRow {
  weekStart: string;
  before: WorkloadWeek | null;
  after: WorkloadWeek | null;
  change: Change;
}
export type Comparison =
  | { comparable: true; inputVersion: string; rows: ComparisonRow[] }
  | { comparable: false; reason: string };

const RANK: Record<CrunchLevel, number> = { low: 0, medium: 1, high: 2 };

/** Only compares two results computed from the SAME input version. Anything else is refused, not guessed. */
export function compareWorkload(before: WorkloadSnapshot, after: WorkloadSnapshot): Comparison {
  if (!before.inputVersion || before.inputVersion !== after.inputVersion) {
    return {
      comparable: false,
      reason: 'These two results were computed from different data, so they cannot be compared fairly.',
    };
  }
  const starts = Array.from(new Set([...before.weeks, ...after.weeks].map((w) => w.weekStart))).sort();
  const rows = starts.map<ComparisonRow>((weekStart) => {
    const b = before.weeks.find((w) => w.weekStart === weekStart) ?? null;
    const a = after.weeks.find((w) => w.weekStart === weekStart) ?? null;
    let change: Change = 'unknown';
    if (b && a) {
      const d = RANK[a.crunch] - RANK[b.crunch];
      change = d < 0 ? 'better' : d > 0 ? 'worse' : 'same';
    }
    return { weekStart, before: b, after: a, change };
  });
  return { comparable: true, inputVersion: before.inputVersion, rows };
}

export const CHANGE_WORD: Record<Change, string> = {
  better: 'Better',
  worse: 'Worse',
  same: 'Same',
  unknown: 'Unknown',
};

// ---------- official dates ----------
/** Used after a local approval: official dates must be exactly as before. A missing item counts as changed. */
export function verifyOfficialDatesUnchanged(
  before: OfficialDate[],
  after: OfficialDate[],
): { unchanged: boolean; changed: string[] } {
  const changed: string[] = [];
  for (const b of before) {
    const a = after.find((x) => x.assessmentId === b.assessmentId);
    if (!a || a.officialDate !== b.officialDate) changed.push(b.assessmentId);
  }
  return { unchanged: changed.length === 0, changed };
}

// ---------- safe parsing helpers (never turn "missing" into 0) ----------
export const toCount = (x: unknown): Count => (typeof x === 'number' && Number.isFinite(x) ? x : null);

export function toExposure(x: unknown): Exposure {
  const e = x as { status?: string; value?: unknown } | null;
  if (e?.status === 'ok' && typeof e.value === 'number' && Number.isFinite(e.value)) {
    return { status: 'ok', value: e.value };
  }
  if (e?.status === 'suppressed') return { status: 'suppressed' };
  return { status: 'unavailable' };
}
