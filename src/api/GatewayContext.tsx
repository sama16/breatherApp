import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { BACKEND_BASE_URL, USE_FIXTURES } from '../config';
import { fixtureScenario } from '../fixtures/FixtureState';
import { createFixtureGateway, createHttpGateway, type Gateway } from './gateway';

// One fixture gateway for the whole app run, so fixture decisions persist between screens.
const fixtureGateway = createFixtureGateway(() => fixtureScenario.current);

const Ctx = createContext<Gateway | null>(null);

/**
 * Chooses the gateway ONCE from the mode. The HTTP gateway has no fixture fallback,
 * so a backend error can never turn into fake success.
 */
export function GatewayProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const gateway = useMemo<Gateway>(
    () =>
      USE_FIXTURES
        ? fixtureGateway
        : createHttpGateway({ fetchFn: (...a) => fetch(...a), baseUrl: BACKEND_BASE_URL, getToken }),
    [getToken],
  );
  return <Ctx.Provider value={gateway}>{children}</Ctx.Provider>;
}

export function useGateway(): Gateway {
  const g = useContext(Ctx);
  if (!g) throw new Error('useGateway must be used inside <GatewayProvider>');
  return g;
}
