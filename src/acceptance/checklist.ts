/**
 * The M2 device acceptance checklist. Results are entered by a HUMAN testing on a device.
 * Nothing here is ever auto-passed: the default for every item is "not run".
 */
export type Result = 'not_run' | 'pass' | 'fail' | 'limitation';

export interface CheckItem {
  id: string;
  group: 'Journey' | 'Navigation' | 'Accessibility' | 'Failures' | 'Authority' | 'Install';
  text: string;
  roles: ('student' | 'professor' | 'both')[];
}

export const CHECKLIST: CheckItem[] = [
  { id: 'J1', group: 'Journey', roles: ['professor'], text: 'Log in as professor, open Teaching, Workload, History without errors' },
  { id: 'J2', group: 'Journey', roles: ['professor'], text: 'Compare before/after on a suggestion with the same input version' },
  { id: 'J3', group: 'Journey', roles: ['professor'], text: 'Accept a suggestion: shows "Approved locally; not published"' },
  { id: 'J4', group: 'Journey', roles: ['student'], text: 'Log in as student, see own official dates only' },
  { id: 'N1', group: 'Navigation', roles: ['both'], text: 'Back button on every screen behaves sensibly (no crash, no blank screen)' },
  { id: 'N2', group: 'Navigation', roles: ['both'], text: 'Rotating or backgrounding the app keeps the session and screen' },
  { id: 'A1', group: 'Accessibility', roles: ['both'], text: 'Every button is at least 48dp and easy to tap' },
  { id: 'A2', group: 'Accessibility', roles: ['both'], text: 'TalkBack reads a meaningful label for each control and card' },
  { id: 'A3', group: 'Accessibility', roles: ['both'], text: 'Largest system font size: nothing cut off or overlapping' },
  { id: 'A4', group: 'Accessibility', roles: ['professor'], text: 'Workload chart has an "In words" text and a table' },
  { id: 'F1', group: 'Failures', roles: ['both'], text: 'Airplane mode: clear network message and Try again works after reconnect' },
  { id: 'F2', group: 'Failures', roles: ['both'], text: 'Expired session signs out with a message' },
  { id: 'F3', group: 'Failures', roles: ['both'], text: 'Revoked session signs out with a message' },
  { id: 'F4', group: 'Failures', roles: ['both'], text: 'Stale or incomplete import shows a warning banner' },
  { id: 'F5', group: 'Failures', roles: ['professor'], text: 'A failed decision says "Not saved" and never looks like success' },
  { id: 'D1', group: 'Authority', roles: ['professor'], text: 'Same proposal decided on web and Android: second one gets "changed" (stale), not success' },
  { id: 'D2', group: 'Authority', roles: ['both'], text: 'After a local approval, the student official date is unchanged' },
  { id: 'D3', group: 'Authority', roles: ['both'], text: 'Sedra and I see the same status for the same proposal on two devices' },
  { id: 'I1', group: 'Install', roles: ['both'], text: 'Installable APK built, SHA-256 recorded, installs on a clean device' },
];

export const RESULT_LABEL: Record<Result, string> = {
  not_run: 'Not run',
  pass: 'Pass',
  fail: 'Fail',
  limitation: 'Limitation',
};

export const NEXT_RESULT: Record<Result, Result> = {
  not_run: 'pass',
  pass: 'fail',
  fail: 'limitation',
  limitation: 'not_run',
};

export interface EvidenceContext {
  mode: string;
  backendUrl: string;
  appVersion: string;
  androidApi: string;
  device: string;
  role: string;
  when: string;
}

/** Plain-text evidence block to paste into docs/EVIDENCE-M2.md. Unset items are reported as NOT RUN. */
export function buildEvidenceText(ctx: EvidenceContext, results: Record<string, Result>): string {
  const head = [
    'Breather M2 device acceptance (entered by tester)',
    `When: ${ctx.when}`,
    `Mode: ${ctx.mode}${ctx.mode === 'fixture' ? ' (FIXTURE DATA, not real backend)' : ''}`,
    `Backend: ${ctx.backendUrl}`,
    `App version: ${ctx.appVersion}`,
    `Android API: ${ctx.androidApi}`,
    `Device: ${ctx.device}`,
    `Role under test: ${ctx.role}`,
    '',
  ];
  const lines = CHECKLIST.map((c) => `${c.id} [${RESULT_LABEL[results[c.id] ?? 'not_run'].toUpperCase()}] ${c.text}`);
  const counts = (r: Result) => CHECKLIST.filter((c) => (results[c.id] ?? 'not_run') === r).length;
  const foot = ['', `Totals: pass ${counts('pass')}, fail ${counts('fail')}, limitation ${counts('limitation')}, not run ${counts('not_run')}`];
  return [...head, ...lines, ...foot].join('\n');
}
