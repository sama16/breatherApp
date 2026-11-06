/**
 * Session helpers (pure logic + backend calls with injectable fetch).
 *
 * Stored on the phone: ONLY the opaque backend session token and its expiry.
 * Never stored: Canvas secrets/credentials, or a role used as authority.
 * The role/profile is fetched from the backend each session and kept in memory only.
 */
import { SESSION_EXPIRY_SKEW_MS } from '../config';

export interface Session {
  accessToken: string;
  /** epoch ms */
  expiresAt: number;
}

/** PLACEHOLDER: replace with the released C0 profile type. */
export interface Profile {
  displayName: string;
  role: string;
}

export type SessionErrorKind = 'network' | 'rejected' | 'unauthorized' | 'invalid_response';

export class SessionError extends Error {
  kind: SessionErrorKind;
  constructor(kind: SessionErrorKind, message?: string) {
    super(message ?? kind);
    this.kind = kind;
  }
}

export interface ApiDeps {
  fetchFn: typeof fetch;
  baseUrl: string;
  now: () => number;
}

export function isSessionExpired(s: Session, now: number, skew = SESSION_EXPIRY_SKEW_MS): boolean {
  return now >= s.expiresAt - skew;
}

/** Validates whatever came out of secure storage; returns null if it is not a well-formed session. */
export function parseStoredSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (typeof s?.accessToken === 'string' && s.accessToken.length > 0 && Number.isFinite(s?.expiresAt)) {
      return { accessToken: s.accessToken, expiresAt: s.expiresAt };
    }
  } catch {
    /* fall through */
  }
  return null;
}

async function call(deps: ApiDeps, path: string, init: RequestInit): Promise<Response> {
  try {
    return await deps.fetchFn(`${deps.baseUrl}${path}`, init);
  } catch {
    throw new SessionError('network');
  }
}

/** Trade the one-time handoff code for a backend session token. */
export async function exchangeCode(code: string, deps: ApiDeps, path: string): Promise<Session> {
  const res = await call(deps, path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new SessionError('rejected', `HTTP ${res.status}`);
  let body: any;
  try {
    body = await res.json();
  } catch {
    throw new SessionError('invalid_response');
  }
  const token = body?.accessToken;
  const secs = body?.expiresInSeconds;
  if (typeof token !== 'string' || !token || typeof secs !== 'number' || !(secs > 0)) {
    throw new SessionError('invalid_response');
  }
  return { accessToken: token, expiresAt: deps.now() + secs * 1000 };
}

/** Role/profile always comes from the backend. 401/403 means the session is no longer valid. */
export async function fetchProfile(token: string, deps: ApiDeps, path: string): Promise<Profile> {
  const res = await call(deps, path, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401 || res.status === 403) throw new SessionError('unauthorized');
  if (!res.ok) throw new SessionError('rejected', `HTTP ${res.status}`);
  let body: any;
  try {
    body = await res.json();
  } catch {
    throw new SessionError('invalid_response');
  }
  if (typeof body?.displayName !== 'string' || typeof body?.role !== 'string') {
    throw new SessionError('invalid_response');
  }
  return { displayName: body.displayName, role: body.role };
}

/** Best effort: tell the backend to revoke. Local logout never waits on this. */
export async function revokeSession(token: string, deps: ApiDeps, path: string): Promise<void> {
  try {
    await deps.fetchFn(`${deps.baseUrl}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    /* ignore */
  }
}
