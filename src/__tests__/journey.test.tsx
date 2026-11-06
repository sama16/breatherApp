import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { act, create } from 'react-test-renderer';
import { GatewayProvider } from '../api/GatewayContext';
import { AuthProvider, useAuth } from '../auth/AuthContext';
import { buildEvidenceText, CHECKLIST } from '../acceptance/checklist';
import { FixtureProvider } from '../fixtures/FixtureState';
import { RootNavigator } from '../navigation/RootNavigator';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn(), maybeCompleteAuthSession: jest.fn() }));

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });

function text(r: ReturnType<typeof create>): string {
  return JSON.stringify(r.toJSON());
}

let signIn!: ReturnType<typeof useAuth>['signIn'];
function Grab() {
  signIn = useAuth().signIn;
  return null;
}

const mounted: ReturnType<typeof create>[] = [];
afterEach(async () => {
  await act(async () => { mounted.splice(0).forEach((m) => m.unmount()); });
  await new Promise((r) => setTimeout(r, 250)); // let the tab bar's own timers finish
});

async function mount() {
  let r!: ReturnType<typeof create>;
  await act(async () => {
    r = create(
      <AuthProvider>
        <FixtureProvider>
          <GatewayProvider>
            <Grab />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </GatewayProvider>
        </FixtureProvider>
      </AuthProvider>,
    );
  });
  mounted.push(r);
  await flush();
  return r;
}

describe('fixture journeys (mock-ready, not device evidence)', () => {
  it('signed out shows the login screen with both fixture roles', async () => {
    const r = await mount();
    expect(text(r)).toContain('Continue as professor (fixture)');
    expect(text(r)).toContain('Continue as student (fixture)');
  });

  it('professor gets Home, Teaching, Workload, History, Settings', async () => {
    const r = await mount();
    await act(async () => { await signIn({ fixtureRole: 'professor' }); });
    await flush();
    const t = text(r);
    for (const tab of ['Home', 'Teaching', 'Workload', 'History', 'Settings']) expect(t).toContain(tab);
    expect(t).not.toContain('Official dates');
  });

  it('student gets Home, Courses, Register, Official dates, Settings', async () => {
    const r = await mount();
    await act(async () => { await signIn({ fixtureRole: 'student' }); });
    await flush();
    const t = text(r);
    for (const tab of ['Home', 'Courses', 'Register', 'Official dates', 'Settings']) expect(t).toContain(tab);
    expect(t).not.toContain('Workload');
  });
});

describe('evidence text', () => {
  const ctx = { mode: 'fixture', backendUrl: 'x', appVersion: '1', androidApi: '34', device: 'd', role: 'student', when: 'now' };
  it('defaults every item to NOT RUN and labels fixture mode', () => {
    const t = buildEvidenceText(ctx, {});
    expect(t).toContain('FIXTURE DATA');
    expect(t).toContain(`not run ${CHECKLIST.length}`);
    expect(t).not.toContain('[PASS]');
  });
  it('reports what the tester entered', () => {
    expect(buildEvidenceText(ctx, { J1: 'pass', F1: 'fail' })).toMatch(/J1 \[PASS\]/);
  });
});
