import { kindFromStatus, type FailureKind } from '../domain/failures';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; kind: FailureKind };

export interface ClientDeps {
  fetchFn: typeof fetch;
  baseUrl: string;
  getToken: () => string | null;
  timeoutMs?: number;
}

/**
 * One place that talks HTTP to the Breather backend (never Canvas).
 * Every failure becomes a FailureKind. There is no code path that turns a failure into data.
 */
export async function apiRequest(
  deps: ClientDeps,
  path: string,
  init: { method?: 'GET' | 'POST'; body?: unknown; headers?: Record<string, string> } = {},
): Promise<ApiResult<unknown>> {
  const token = deps.getToken();
  if (!token) return { ok: false, kind: 'expired' };

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), deps.timeoutMs ?? 10_000) : null;

  try {
    const res = await deps.fetchFn(`${deps.baseUrl}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: controller?.signal,
    });

    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (!res.ok) return { ok: false, kind: kindFromStatus(res.status, json as { code?: string } | null) };
    if (json === null || json === undefined) return { ok: false, kind: 'invalid_response' };
    return { ok: true, data: json };
  } catch (e) {
    const name = (e as { name?: string } | null)?.name;
    return { ok: false, kind: name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
