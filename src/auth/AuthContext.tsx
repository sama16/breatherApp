import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AUTH_CALLBACK_URL, BACKEND_BASE_URL, ENDPOINTS, USE_FIXTURES } from '../config';
import { fixtureProfileFor, type FixtureRole } from '../fixtures/c0';
import {
  beginHandoff,
  cancelHandoff,
  completeHandoff,
  HANDOFF_MESSAGES,
  type HandoffDeps,
} from './handoff';
import { secureKeyValueStore, sessionStorage } from './secureStorage';
import {
  exchangeCode,
  fetchProfile,
  isSessionExpired,
  revokeSession,
  SessionError,
  type ApiDeps,
  type Profile,
  type Session,
} from './session';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthValue {
  status: AuthStatus;
  busy: boolean;
  /** Message to show on the login screen (cancel / invalid / expired / replayed / network). */
  notice: string | null;
  /** Held in memory only. Never persisted, never used as authority. */
  profile: Profile | null;
  expiresAt: number | null;
  mode: 'real' | 'fixture';
  signIn: (opts?: { fixtureRole?: FixtureRole }) => Promise<void>;
  /** Current backend session token (null when signed out). Used by the API client only. */
  getToken: () => string | null;
  signOut: (notice?: string) => Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);

const apiDeps: ApiDeps = { fetchFn: (...a) => fetch(...a), baseUrl: BACKEND_BASE_URL, now: () => Date.now() };

function randomState(): string {
  return Array.from(Crypto.getRandomBytes(16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const handoffDeps: HandoffDeps = {
  store: secureKeyValueStore,
  now: () => Date.now(),
  randomState,
  backendBaseUrl: BACKEND_BASE_URL,
  callbackUrl: AUTH_CALLBACK_URL,
  loginPath: ENDPOINTS.login,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const tokenRef = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const signOut = useCallback(async (msg?: string) => {
    clearTimer();
    const token = tokenRef.current;
    tokenRef.current = null;
    setProfile(null);
    setExpiresAt(null);
    setNotice(msg ?? null);
    setStatus('signedOut');
    if (!USE_FIXTURES) {
      await sessionStorage.clear().catch(() => {});
      if (token) void revokeSession(token, apiDeps, ENDPOINTS.logout);
    }
  }, []);

  const startSession = useCallback(
    (s: Session, p: Profile) => {
      tokenRef.current = s.accessToken;
      setProfile(p);
      setExpiresAt(s.expiresAt);
      setNotice(null);
      setStatus('signedIn');
      clearTimer();
      const ms = Math.min(Math.max(s.expiresAt - Date.now(), 0), 2_000_000_000);
      timer.current = setTimeout(() => void signOut('Your session expired. Please sign in again.'), ms);
    },
    [signOut],
  );

  // On launch: restore a stored session if it is still valid; the role always comes from the backend.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (USE_FIXTURES) {
        setStatus('signedOut');
        return;
      }
      const stored = await sessionStorage.load();
      if (!stored) {
        if (!cancelled) setStatus('signedOut');
        return;
      }
      if (isSessionExpired(stored, Date.now())) {
        await sessionStorage.clear().catch(() => {});
        if (!cancelled) {
          setNotice('Your session expired. Please sign in again.');
          setStatus('signedOut');
        }
        return;
      }
      try {
        const p = await fetchProfile(stored.accessToken, apiDeps, ENDPOINTS.me);
        if (!cancelled) startSession(stored, p);
      } catch (e) {
        await sessionStorage.clear().catch(() => {});
        if (!cancelled) {
          setNotice(
            e instanceof SessionError && e.kind === 'network'
              ? HANDOFF_MESSAGES.network
              : 'Your session is no longer valid. Please sign in again.',
          );
          setStatus('signedOut');
        }
      }
    })();
    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [startSession]);

  const getToken = useCallback(() => tokenRef.current, []);

  const signIn = useCallback(async (opts?: { fixtureRole?: FixtureRole }) => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      if (USE_FIXTURES) {
        // Local-only fake session, held in memory, never stored. The UI shows a FIXTURE banner.
        startSession({ accessToken: 'fixture', expiresAt: Date.now() + 60 * 60 * 1000 }, fixtureProfileFor(opts?.fixtureRole ?? 'student'));
        return;
      }
      const { loginUrl } = await beginHandoff(handoffDeps);
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, AUTH_CALLBACK_URL);
      if (result.type !== 'success') {
        await cancelHandoff(handoffDeps);
        setNotice(HANDOFF_MESSAGES.cancelled);
        return;
      }
      const done = await completeHandoff(result.url, handoffDeps);
      if (!done.ok) {
        setNotice(HANDOFF_MESSAGES[done.error]);
        return;
      }
      const session = await exchangeCode(done.code, apiDeps, ENDPOINTS.exchange);
      const p = await fetchProfile(session.accessToken, apiDeps, ENDPOINTS.me);
      await sessionStorage.save(session);
      startSession(session, p);
    } catch (e) {
      setNotice(
        e instanceof SessionError && e.kind === 'network'
          ? HANDOFF_MESSAGES.network
          : HANDOFF_MESSAGES.invalid,
      );
    } finally {
      setBusy(false);
    }
  }, [busy, startSession]);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      busy,
      notice,
      profile,
      expiresAt,
      mode: USE_FIXTURES ? 'fixture' : 'real',
      signIn,
      signOut,
      getToken,
    }),
    [status, busy, notice, profile, expiresAt, signIn, signOut, getToken],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}
