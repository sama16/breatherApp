import {
  beginHandoff,
  cancelHandoff,
  completeHandoff,
  HANDOFF_TTL_MS,
  parseQuery,
  PENDING_KEY,
  type HandoffDeps,
  type KeyValueStore,
} from '../auth/handoff';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: async (k) => data.get(k) ?? null,
    setItem: async (k, v) => void data.set(k, v),
    removeItem: async (k) => void data.delete(k),
  };
}

function setup(start = 1_000_000) {
  const store = memoryStore();
  let t = start;
  let n = 0;
  const deps: HandoffDeps = {
    store,
    now: () => t,
    randomState: () => `state${++n}`,
    backendBaseUrl: 'http://10.0.2.2:8080',
    callbackUrl: 'breather://auth/callback',
    loginPath: '/auth/mobile/login',
  };
  return { deps, store, advance: (ms: number) => void (t += ms) };
}

const cb = (q: string) => `breather://auth/callback?${q}`;

describe('parseQuery', () => {
  it('parses and decodes', () => {
    expect(parseQuery('breather://x?code=a%20b&state=s1#frag')).toEqual({ code: 'a b', state: 's1' });
  });
  it('throws on malformed encoding', () => {
    expect(() => parseQuery('x?code=%E0%A4%A')).toThrow();
  });
});

describe('beginHandoff', () => {
  it('points at the BACKEND login url (never Canvas) and saves pending state', async () => {
    const { deps, store } = setup();
    const { state, loginUrl } = await beginHandoff(deps);
    expect(state).toBe('state1');
    expect(loginUrl.startsWith('http://10.0.2.2:8080/auth/mobile/login?')).toBe(true);
    expect(loginUrl).toContain('state=state1');
    expect(loginUrl).toContain(encodeURIComponent('breather://auth/callback'));
    expect(loginUrl.toLowerCase()).not.toContain('canvas');
    expect(store.data.has(PENDING_KEY)).toBe(true);
  });
});

describe('completeHandoff', () => {
  it('accepts a valid callback once', async () => {
    const { deps } = setup();
    const { state } = await beginHandoff(deps);
    expect(await completeHandoff(cb(`code=abc&state=${state}`), deps)).toEqual({ ok: true, code: 'abc' });
  });

  it('rejects a replayed callback', async () => {
    const { deps } = setup();
    const { state } = await beginHandoff(deps);
    await completeHandoff(cb(`code=abc&state=${state}`), deps);
    expect(await completeHandoff(cb(`code=abc&state=${state}`), deps)).toEqual({ ok: false, error: 'replayed' });
  });

  it('rejects a wrong state as invalid', async () => {
    const { deps } = setup();
    await beginHandoff(deps);
    expect(await completeHandoff(cb('code=abc&state=attacker'), deps)).toEqual({ ok: false, error: 'invalid' });
  });

  it('rejects a callback when no sign-in was started', async () => {
    const { deps } = setup();
    expect(await completeHandoff(cb('code=abc&state=state1'), deps)).toEqual({ ok: false, error: 'invalid' });
  });

  it('rejects missing code or state', async () => {
    const { deps } = setup();
    const { state } = await beginHandoff(deps);
    expect(await completeHandoff(cb(`state=${state}`), deps)).toEqual({ ok: false, error: 'invalid' });
    expect(await completeHandoff(cb('code=abc'), deps)).toEqual({ ok: false, error: 'invalid' });
  });

  it('rejects malformed urls', async () => {
    const { deps } = setup();
    await beginHandoff(deps);
    expect(await completeHandoff(cb('code=%E0%A4%A&state=state1'), deps)).toEqual({ ok: false, error: 'invalid' });
  });

  it('expires after the TTL', async () => {
    const { deps, advance } = setup();
    const { state } = await beginHandoff(deps);
    advance(HANDOFF_TTL_MS + 1);
    expect(await completeHandoff(cb(`code=abc&state=${state}`), deps)).toEqual({ ok: false, error: 'expired' });
  });

  it('still works right at the TTL boundary', async () => {
    const { deps, advance } = setup();
    const { state } = await beginHandoff(deps);
    advance(HANDOFF_TTL_MS);
    expect((await completeHandoff(cb(`code=abc&state=${state}`), deps)).ok).toBe(true);
  });

  it('maps backend error codes: cancel / expired / other', async () => {
    const { deps } = setup();
    await beginHandoff(deps);
    expect(await completeHandoff(cb('error=access_denied'), deps)).toEqual({ ok: false, error: 'cancelled' });
    await beginHandoff(deps);
    expect(await completeHandoff(cb('error=expired'), deps)).toEqual({ ok: false, error: 'expired' });
    await beginHandoff(deps);
    expect(await completeHandoff(cb('error=server_error'), deps)).toEqual({ ok: false, error: 'invalid' });
  });

  it('cancelHandoff clears pending so a late callback is invalid', async () => {
    const { deps } = setup();
    const { state } = await beginHandoff(deps);
    await cancelHandoff(deps);
    expect(await completeHandoff(cb(`code=abc&state=${state}`), deps)).toEqual({ ok: false, error: 'invalid' });
  });

  it('ignores a corrupted pending entry', async () => {
    const { deps, store } = setup();
    store.data.set(PENDING_KEY, '{not json');
    expect(await completeHandoff(cb('code=abc&state=state1'), deps)).toEqual({ ok: false, error: 'invalid' });
  });
});
