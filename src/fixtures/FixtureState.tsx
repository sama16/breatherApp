import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { FixtureViewState } from './c0';

/** Module-level mirror so the (non-React) fixture gateway can read the chosen scenario. */
export const fixtureScenario: { current: FixtureViewState } = { current: 'ready' };

interface Ctx {
  viewState: FixtureViewState;
  setViewState: (s: FixtureViewState) => void;
}

const FixtureCtx = createContext<Ctx>({ viewState: 'ready', setViewState: () => {} });

/** Lets the Session screen flip every data screen between scenarios (fixture mode only). */
export function FixtureProvider({ children }: { children: React.ReactNode }) {
  const [viewState, setState] = useState<FixtureViewState>('ready');
  const setViewState = useCallback((s: FixtureViewState) => {
    fixtureScenario.current = s;
    setState(s);
  }, []);
  const value = useMemo(() => ({ viewState, setViewState }), [viewState, setViewState]);
  return <FixtureCtx.Provider value={value}>{children}</FixtureCtx.Provider>;
}

export const useFixtureState = () => useContext(FixtureCtx);
