import {
  exchangeCode,
  fetchProfile,
  isSessionExpired,
  parseStoredSession,
  revokeSession,
  SessionError,
  type ApiDeps,
} from '../auth/session';

const json = (status: number, body: unknown) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as unknown as Response;

function deps(fetchFn: jest.Mock): ApiDeps {
  return { fetchFn: fetchFn as unknown as typeof fetch, baseUrl: 'http://10.0.2.2:8080', now: () => 1_000 };
}

describe('isSessionExpired', () => {
  it('uses a safety skew', () => {
    const s = { accessToken: 't', expiresAt: 100_000 };
    expect(isSessionExpired(s, 10_000, 30_000)).toBe(false);
    expect(isSessionExpired(s, 70_000, 30_000)).toBe(true);
    expect(isSessionExpired(s, 200_000, 30_000)).toBe(true);
  });
});

describe('parseStoredSession', () => {
  it('accepts only well-formed sessions', () => {
    expect(parseStoredSession(JSON.stringify({ accessToken: 't', expiresAt: 5 }))).toEqual({ accessToken: 't', expiresAt: 5 });
    expect(parseStoredSession(null)).toBeNull();
    expect(parseStoredSession('garbage')).toBeNull();
    expect(parseStoredSession(JSON.stringify({ accessToken: '', expiresAt: 5 }))).toBeNull();
    expect(parseStoredSession(JSON.stringify({ accessToken: 't' }))).toBeNull();
  });
  it('drops any extra fields (e.g. a cached role) instead of keeping them', () => {
    const s = parseStoredSession(JSON.stringify({ accessToken: 't', expiresAt: 5, role: 'admin', canvasToken: 'x' }));
    expect(s).toEqual({ accessToken: 't', expiresAt: 5 });
  });
});

describe('exchangeCode', () => {
  it('returns a session with absolute expiry', async () => {
    const f = jest.fn().mockResolvedValue(json(200, { accessToken: 'tok', expiresInSeconds: 60 }));
    expect(await exchangeCode('c', deps(f), '/auth/mobile/exchange')).toEqual({ accessToken: 'tok', expiresAt: 61_000 });
    expect(f.mock.calls[0][0]).toBe('http://10.0.2.2:8080/auth/mobile/exchange');
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ code: 'c' });
  });
  it('rejected code -> rejected', async () => {
    const f = jest.fn().mockResolvedValue(json(400, {}));
    await expect(exchangeCode('c', deps(f), '/x')).rejects.toMatchObject({ kind: 'rejected' });
  });
  it('bad payload -> invalid_response', async () => {
    const f = jest.fn().mockResolvedValue(json(200, { accessToken: 'tok', expiresInSeconds: 'soon' }));
    await expect(exchangeCode('c', deps(f), '/x')).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  it('network failure -> network', async () => {
    const f = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    await expect(exchangeCode('c', deps(f), '/x')).rejects.toMatchObject({ kind: 'network' });
  });
});

describe('fetchProfile', () => {
  it('sends the bearer token and returns the server role', async () => {
    const f = jest.fn().mockResolvedValue(json(200, { displayName: 'Sama', role: 'student' }));
    expect(await fetchProfile('tok', deps(f), '/me')).toEqual({ displayName: 'Sama', role: 'student' });
    expect(f.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
  });
  it('401 / 403 -> unauthorized (expired or revoked)', async () => {
    for (const status of [401, 403]) {
      const f = jest.fn().mockResolvedValue(json(status, {}));
      await expect(fetchProfile('tok', deps(f), '/me')).rejects.toMatchObject({ kind: 'unauthorized' });
    }
  });
  it('malformed profile -> invalid_response', async () => {
    const f = jest.fn().mockResolvedValue(json(200, { displayName: 5 }));
    await expect(fetchProfile('tok', deps(f), '/me')).rejects.toBeInstanceOf(SessionError);
  });
});

describe('revokeSession', () => {
  it('never throws even if the backend is unreachable', async () => {
    const f = jest.fn().mockRejectedValue(new Error('offline'));
    await expect(revokeSession('tok', deps(f), '/auth/mobile/logout')).resolves.toBeUndefined();
  });
});
