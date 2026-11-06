import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FAILURE_MESSAGES, isAuthFailure, type FailureKind } from '../domain/failures';
import { useFixtureState } from '../fixtures/FixtureState';
import type { ApiResult } from './client';
import { useGateway } from './GatewayContext';
import type { Gateway } from './gateway';

export type Remote<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'failed'; kind: FailureKind };

/**
 * Loads data through the gateway. An expired or revoked session signs the user out with a clear notice.
 * Reloads when the fixture scenario changes (fixture mode) or when reload() is called.
 */
export function useRemote<T>(loader: (g: Gateway) => Promise<ApiResult<T>>) {
  const gateway = useGateway();
  const { signOut } = useAuth();
  const { viewState } = useFixtureState();
  const [state, setState] = useState<Remote<T>>({ status: 'loading' });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    loaderRef
      .current(gateway)
      .then((r) => {
        if (cancelled) return;
        if (r.ok) {
          setState({ status: 'ready', data: r.data });
        } else if (isAuthFailure(r.kind)) {
          void signOut(FAILURE_MESSAGES[r.kind]);
        } else {
          setState({ status: 'failed', kind: r.kind });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'failed', kind: 'unavailable' });
      });
    return () => {
      cancelled = true;
    };
  }, [gateway, viewState, tick, signOut]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { state, reload };
}
