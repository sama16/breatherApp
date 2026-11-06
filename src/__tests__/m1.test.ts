import { apiRequest } from '../api/client';
import { createFixtureGateway, createHttpGateway } from '../api/gateway';
import { createSubmitGuard } from '../decisions/submitGuard';
import {
  compareWorkload,
  formatCount,
  LOCAL_APPROVAL_LABEL,
  toCount,
  toExposure,
  verifyOfficialDatesUnchanged,
  type DecisionRequest,
} from '../domain/c1';
import { isAuthFailure, isRetryable, kindFromStatus } from '../domain/failures';
import { fixtureOfficialDates, fixtureProposals } from '../fixtures/c1';
import type { FixtureViewState } from '../fixtures/c0';

const req = (over: Partial<DecisionRequest> = {}): DecisionRequest => {
  const p = fixtureProposals[0];
  return { proposalId: p.id, proposalRevision: p.revision, expectedVersion: p.assessmentVersion, action: 'accept', clientRequestId: 't', ...over };
};
const gw = (s: FixtureViewState = 'ready') => createFixtureGateway(() => s);

describe('missing is not zero', () => {
  it('null stays "Not available", real zero stays 0', () => {
    expect(formatCount(null)).toBe('Not available');
    expect(formatCount(0)).toBe('0');
    expect(toCount(undefined)).toBeNull();
    expect(toCount('3')).toBeNull();
    expect(toCount(0)).toBe(0);
    expect(toExposure(undefined).status).not.toBe('ok');
  });
  it('fixtures include a real-zero and a missing coverage course', async () => {
    const r = await gw().getTeaching();
    if (!r.ok) throw new Error('x');
    const cov = r.data.courses.map((c) => c.coverage);
    expect(JSON.stringify(cov)).toContain('null');
    expect(JSON.stringify(cov)).toMatch(/:0/);
  });
});

describe('same-input comparison', () => {
  it('compares matching input versions', () => {
    const p = fixtureProposals[0];
    expect(compareWorkload(p.before, p.after).comparable).toBe(true);
  });
  it('refuses different input versions', () => {
    const p = fixtureProposals[1];
    expect(compareWorkload(p.before, p.after).comparable).toBe(false);
  });
  it('refuses empty input version', () => {
    const p = fixtureProposals[0];
    expect(compareWorkload({ ...p.before, inputVersion: '' }, { ...p.after, inputVersion: '' }).comparable).toBe(false);
  });
});

describe('failure mapping', () => {
  it('maps statuses', () => {
    expect(kindFromStatus(401)).toBe('expired');
    expect(kindFromStatus(401, { code: 'session_revoked' })).toBe('revoked');
    expect(kindFromStatus(403)).toBe('forbidden');
    expect(kindFromStatus(409)).toBe('stale');
    expect(kindFromStatus(504)).toBe('timeout');
    expect(kindFromStatus(500)).toBe('unavailable');
  });
  it('auth failures sign out; forbidden is not retryable', () => {
    expect(isAuthFailure('expired')).toBe(true);
    expect(isAuthFailure('revoked')).toBe(true);
    expect(isRetryable('forbidden')).toBe(false);
    expect(isRetryable('network')).toBe(true);
  });
});

describe('submit guard', () => {
  it('ignores a second run while one is in flight', async () => {
    const g = createSubmitGuard();
    let release!: () => void;
    const first = g.run(() => new Promise<string>((r) => { release = () => r('a'); }));
    const second = await g.run(async () => 'b');
    expect(second.ran).toBe(false);
    release();
    expect((await first).ran).toBe(true);
    expect(g.inFlight).toBe(false);
    expect((await g.run(async () => 'c')).ran).toBe(true);
  });
  it('releases after a throw', async () => {
    const g = createSubmitGuard();
    await expect(g.run(async () => { throw new Error('x'); })).rejects.toThrow();
    expect(g.inFlight).toBe(false);
  });
});

describe('fixture gateway decisions', () => {
  it('accept is local only, labelled, and official dates are unchanged', async () => {
    const g = gw();
    const before = await g.getOfficialDates();
    const out = await g.submitDecision(req());
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.proposalStatus).toBe('approved_locally');
    expect(LOCAL_APPROVAL_LABEL).toBe('Approved locally; not published');
    const after = await g.getOfficialDates();
    if (!before.ok || !after.ok) throw new Error('x');
    expect(verifyOfficialDatesUnchanged(before.data, after.data).unchanged).toBe(true);
    expect(verifyOfficialDatesUnchanged(fixtureOfficialDates, after.data).unchanged).toBe(true);
  });
  it('a second decision on the same proposal is stale, not success', async () => {
    const g = gw();
    expect((await g.submitDecision(req())).ok).toBe(true);
    const again = await g.submitDecision(req({ action: 'reject' }));
    expect(again).toEqual({ ok: false, kind: 'stale' });
  });
  it('wrong revision or version is stale', async () => {
    expect(await gw().submitDecision(req({ proposalRevision: 99 }))).toEqual({ ok: false, kind: 'stale' });
    expect(await gw().submitDecision(req({ expectedVersion: 999 }))).toEqual({ ok: false, kind: 'stale' });
  });
  it('failure scenarios never return success', async () => {
    for (const s of ['network', 'expired', 'revoked', 'forbidden', 'unavailable', 'timeout', 'stale'] as FixtureViewState[]) {
      const out = await gw(s).submitDecision(req());
      expect(out.ok).toBe(false);
    }
  });
  it('history records the decision', async () => {
    const g = gw();
    await g.submitDecision(req({ action: 'lock' }));
    const h = await g.getHistory();
    if (!h.ok) throw new Error('x');
    expect(h.data.some((e) => e.action === 'lock')).toBe(true);
  });
});

describe('http client has no fixture fallback', () => {
  const mk = (fetchFn: unknown, token: string | null = 't') => ({ fetchFn: fetchFn as typeof fetch, baseUrl: 'http://x', getToken: () => token, timeoutMs: 50 });
  it('no token -> expired, no request made', async () => {
    const f = jest.fn();
    expect(await apiRequest(mk(f, null), '/a')).toEqual({ ok: false, kind: 'expired' });
    expect(f).not.toHaveBeenCalled();
  });
  it('network error -> network', async () => {
    const r = await apiRequest(mk(async () => { throw new Error('down'); }), '/a');
    expect(r).toEqual({ ok: false, kind: 'network' });
  });
  it('500 -> unavailable; 409 -> stale', async () => {
    const resp = (status: number) => async () => ({ ok: false, status, json: async () => ({}) });
    expect(await apiRequest(mk(resp(500)), '/a')).toEqual({ ok: false, kind: 'unavailable' });
    expect(await apiRequest(mk(resp(409)), '/a')).toEqual({ ok: false, kind: 'stale' });
  });
  it('bad shape from backend -> invalid_response, never fixture data', async () => {
    const f = async () => ({ ok: true, status: 200, json: async () => ({ nonsense: true }) });
    const r = await createHttpGateway(mk(f)).getProposals();
    expect(r.ok).toBe(false);
  });
  it('failed decision is not success', async () => {
    const f = async () => ({ ok: false, status: 409, json: async () => ({}) });
    expect(await createHttpGateway(mk(f)).submitDecision(req())).toEqual({ ok: false, kind: 'stale' });
  });
});
