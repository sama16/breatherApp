/**
 * Backend-bound authentication handoff (pure logic, fully unit-tested).
 *
 * Flow:
 *  1. App makes a random single-use `state` and opens the BACKEND login URL in the system browser.
 *  2. Backend authenticates the user (Canvas OAuth happens only on the backend) and redirects to
 *     breather://auth/callback?code=...&state=...
 *  3. App checks the state, then exchanges the one-time `code` with the backend for a session token.
 *
 * The app never sees or stores a Canvas secret or credential.
 */

export type HandoffError = 'cancelled' | 'invalid' | 'expired' | 'replayed';
export type HandoffResult = { ok: true; code: string } | { ok: false; error: HandoffError };

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface HandoffDeps {
  store: KeyValueStore;
  now: () => number;
  randomState: () => string;
  backendBaseUrl: string;
  callbackUrl: string;
  loginPath: string;
}

export const HANDOFF_TTL_MS = 5 * 60 * 1000;
export const PENDING_KEY = 'breather.handoff.pending.v1';
export const CONSUMED_KEY = 'breather.handoff.consumed.v1';
const MAX_CONSUMED = 20;

interface Pending {
  state: string;
  createdAt: number;
}

const CANCEL_CODES = ['access_denied', 'cancelled', 'canceled', 'user_cancelled'];

/** Tiny query parser so we do not depend on URL polyfills. Throws on malformed encoding. */
export function parseQuery(url: string): Record<string, string> {
  const q = url.split('#')[0].split('?')[1] ?? '';
  const out: Record<string, string> = {};
  for (const part of q.split('&')) {
    if (!part) continue;
    const i = part.indexOf('=');
    const k = decodeURIComponent((i < 0 ? part : part.slice(0, i)).replace(/\+/g, ' '));
    const v = i < 0 ? '' : decodeURIComponent(part.slice(i + 1).replace(/\+/g, ' '));
    out[k] = v;
  }
  return out;
}

async function readPending(store: KeyValueStore): Promise<Pending | null> {
  try {
    const raw = await store.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.state === 'string' && typeof p?.createdAt === 'number') return p;
  } catch {
    /* corrupted entry: treat as none */
  }
  return null;
}

async function readConsumed(store: KeyValueStore): Promise<string[]> {
  try {
    const raw = await store.getItem(CONSUMED_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function beginHandoff(deps: HandoffDeps): Promise<{ state: string; loginUrl: string }> {
  const state = deps.randomState();
  const pending: Pending = { state, createdAt: deps.now() };
  await deps.store.setItem(PENDING_KEY, JSON.stringify(pending));
  const loginUrl =
    `${deps.backendBaseUrl}${deps.loginPath}` +
    `?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(deps.callbackUrl)}`;
  return { state, loginUrl };
}

/** User closed the browser / pressed back before finishing. */
export async function cancelHandoff(deps: Pick<HandoffDeps, 'store'>): Promise<void> {
  await deps.store.removeItem(PENDING_KEY);
}

export async function completeHandoff(
  callbackUrl: string,
  deps: Pick<HandoffDeps, 'store' | 'now'>,
): Promise<HandoffResult> {
  const { store, now } = deps;

  let q: Record<string, string>;
  try {
    q = parseQuery(callbackUrl);
  } catch {
    await store.removeItem(PENDING_KEY);
    return { ok: false, error: 'invalid' };
  }

  if (q.error) {
    await store.removeItem(PENDING_KEY);
    if (CANCEL_CODES.includes(q.error)) return { ok: false, error: 'cancelled' };
    if (q.error === 'expired') return { ok: false, error: 'expired' };
    return { ok: false, error: 'invalid' };
  }

  if (!q.state || !q.code) {
    await store.removeItem(PENDING_KEY);
    return { ok: false, error: 'invalid' };
  }

  // Replay: this exact state already completed once.
  const consumed = await readConsumed(store);
  if (consumed.includes(q.state)) return { ok: false, error: 'replayed' };

  const pending = await readPending(store);
  if (!pending || pending.state !== q.state) return { ok: false, error: 'invalid' };

  if (now() - pending.createdAt > HANDOFF_TTL_MS) {
    await store.removeItem(PENDING_KEY);
    return { ok: false, error: 'expired' };
  }

  // Single use: burn the state before returning the code.
  await store.setItem(CONSUMED_KEY, JSON.stringify([...consumed, q.state].slice(-MAX_CONSUMED)));
  await store.removeItem(PENDING_KEY);
  return { ok: true, code: q.code };
}

export const HANDOFF_MESSAGES: Record<HandoffError | 'network', string> = {
  cancelled: 'Sign-in cancelled.',
  invalid: "That sign-in link wasn't valid. Please try again.",
  expired: 'Sign-in took too long. Please try again.',
  replayed: 'That sign-in link was already used. Please start again.',
  network: "Can't reach the server. Check your connection and try again.",
};
