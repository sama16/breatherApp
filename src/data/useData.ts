import { useCallback, useState } from 'react';
import { USE_FIXTURES } from '../config';
import {
  fixtureAssessments,
  fixtureCourses,
  type Assessment,
  type Course,
} from '../fixtures/c0';
import { FAILURE_MESSAGES, type FailureKind } from '../domain/failures';
import type { FixtureViewState } from '../fixtures/c0';
import { useFixtureState } from '../fixtures/FixtureState';

function scenarioFailure(s: FixtureViewState): FailureKind | null {
  switch (s) {
    case 'network':
    case 'expired':
    case 'revoked':
    case 'forbidden':
    case 'unavailable':
    case 'timeout':
      return s;
    case 'error':
      return 'unavailable';
    default:
      return null;
  }
}

export type ViewState = 'ready' | 'loading' | 'empty' | 'error';

export interface DataResult<T> {
  state: ViewState;
  data: T[];
  message?: string;
  retry: () => void;
}

/**
 * M0 data layer. Fixture mode returns labelled fixtures in the chosen state.
 * Real mode deliberately returns an error until the released C0/C1 endpoints are wired:
 * we never show invented data as if it came from the backend.
 */
function useList<T>(fixtures: T[]): DataResult<T> {
  const { viewState } = useFixtureState();
  const [tick, setTick] = useState(0);
  const retry = useCallback(() => setTick((t) => t + 1), []);
  void tick;

  if (!USE_FIXTURES) {
    return {
      state: 'error',
      data: [],
      message: 'Backend data is not wired yet (waiting for the released C0 contract).',
      retry,
    };
  }
  if (viewState === 'loading') return { state: 'loading', data: [], retry };
  if (viewState === 'empty') return { state: 'empty', data: [], retry };
  const failure = scenarioFailure(viewState);
  if (failure) return { state: 'error', data: [], message: FAILURE_MESSAGES[failure], retry };
  // ready / stale / incomplete / suppressed / no_result only change M1 screens; M0 lists stay ready.
  return { state: fixtures.length ? 'ready' : 'empty', data: fixtures, retry };
}

export const useCourses = (): DataResult<Course> => useList(fixtureCourses);
export const useAssessments = (): DataResult<Assessment> =>
  useList([...fixtureAssessments].sort((a, b) => a.officialDate.localeCompare(b.officialDate)));
