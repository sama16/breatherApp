/** Every way a backend call can fail, with honest user-facing text. None of these ever shows "success". */
export type FailureKind =
  | 'network'
  | 'expired'
  | 'revoked'
  | 'forbidden'
  | 'stale'
  | 'timeout'
  | 'unavailable'
  | 'invalid_response';

export const FAILURE_MESSAGES: Record<FailureKind, string> = {
  network: "Can't reach the server. Nothing was saved. Check your connection and try again.",
  expired: 'Your session expired. Please sign in again.',
  revoked: 'Your access was revoked. Please sign in again or contact your administrator.',
  forbidden: "You don't have permission to see or do this.",
  stale: 'This changed since you loaded it, so nothing was saved. Refresh to see the latest.',
  timeout: 'The server took too long to answer. Nothing was changed.',
  unavailable: 'The service is unavailable right now. Nothing was changed.',
  invalid_response: 'The server sent something the app could not understand. Nothing was changed.',
};

export const isAuthFailure = (k: FailureKind): boolean => k === 'expired' || k === 'revoked';

/** Retrying cannot fix a permission problem or a dead session. */
export const isRetryable = (k: FailureKind): boolean => !(k === 'forbidden' || isAuthFailure(k));

/** HTTP status -> failure kind. 401 is "revoked" only if the backend says so; otherwise "expired". */
export function kindFromStatus(status: number, body?: { code?: string } | null): FailureKind {
  if (status === 401) return body?.code === 'session_revoked' ? 'revoked' : 'expired';
  if (status === 403) return 'forbidden';
  if (status === 409 || status === 412) return 'stale';
  if (status === 408 || status === 504) return 'timeout';
  return 'unavailable';
}
