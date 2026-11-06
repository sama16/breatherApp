import { Platform } from 'react-native';

/**
 * Fixture mode (default ON for M0): screens use clearly labelled fixture data
 * and the sign-in button creates an in-memory-only local session.
 * Set EXPO_PUBLIC_USE_FIXTURES=0 to use the real backend handoff.
 */
export const USE_FIXTURES = process.env.EXPO_PUBLIC_USE_FIXTURES !== '0';

/**
 * Host-to-emulator addressing:
 *  - Android emulator: the host machine is 10.0.2.2
 *  - Physical phone: `adb reverse tcp:8080 tcp:8080` then use http://localhost:8080,
 *    or put your PC's LAN IP in EXPO_PUBLIC_BACKEND_URL.
 */
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const BACKEND_BASE_URL: string =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? `http://${DEFAULT_HOST}:8080`;

/** Local-only callback the backend redirects to after login (matches "scheme" in app.json). */
export const AUTH_CALLBACK_URL = 'breather://auth/callback';

/** Treat a session as expired this long before its real expiry. */
export const SESSION_EXPIRY_SKEW_MS = 30_000;

/**
 * PLACEHOLDER endpoints. Replace with the released C0 contract paths.
 * Nothing here is a Canvas URL: the app only ever talks to the Breather backend.
 */
export const ENDPOINTS = {
  login: '/auth/mobile/login',
  exchange: '/auth/mobile/exchange',
  logout: '/auth/mobile/logout',
  me: '/me',
  // PLACEHOLDER M1 endpoints (replace with released C1/C2 paths)
  teaching: '/professor/teaching',
  workload: '/professor/workload',
  proposals: '/professor/proposals',
  decisions: '/professor/decisions',
  history: '/professor/decisions/history',
  officialDates: '/me/official-dates',
} as const;
