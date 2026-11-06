/**
 * FIXTURE DATA: NOT FROM THE BACKEND.
 * Shapes are ASSUMED to match C0 (Courses / Assessments). When the released C0 types arrive,
 * replace these interfaces with the real ones and keep the fixtures as typed test data.
 */
export const FIXTURE_LABEL = 'FIXTURE DATA - not from the backend';

export type CrunchLevel = 'low' | 'medium' | 'high';

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  crunch: CrunchLevel;
  assessmentCount: number;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  /** Official due date, ISO 8601. The app shows it read-only and never changes it. */
  officialDate: string;
  weightPercent: number;
  crunch: CrunchLevel;
}

export const fixtureCourses: Course[] = [
  { id: 'c1', code: 'CSCE 3301', title: 'Computer Architecture', department: 'Computer Science', crunch: 'high', assessmentCount: 3 },
  { id: 'c2', code: 'CSCE 2303', title: 'Assembly and Digital Logic', department: 'Computer Science', crunch: 'medium', assessmentCount: 2 },
  { id: 'c3', code: 'RHET 1020', title: 'Academic Writing', department: 'Rhetoric', crunch: 'low', assessmentCount: 1 },
  { id: 'c4', code: 'CSCE 2201', title: 'Software Engineering', department: 'Computer Science', crunch: 'medium', assessmentCount: 2 },
];

export const fixtureAssessments: Assessment[] = [
  { id: 'a1', courseId: 'c1', title: 'Project milestone 3', officialDate: '2026-11-16', weightPercent: 15, crunch: 'high' },
  { id: 'a2', courseId: 'c1', title: 'Midterm', officialDate: '2026-11-17', weightPercent: 25, crunch: 'high' },
  { id: 'a3', courseId: 'c2', title: 'Lab 4 report', officialDate: '2026-11-17', weightPercent: 10, crunch: 'high' },
  { id: 'a4', courseId: 'c4', title: 'Sprint review deliverable', officialDate: '2026-11-19', weightPercent: 10, crunch: 'medium' },
  { id: 'a5', courseId: 'c3', title: 'Essay draft', officialDate: '2026-11-23', weightPercent: 20, crunch: 'low' },
  { id: 'a6', courseId: 'c2', title: 'Quiz 3', officialDate: '2026-11-25', weightPercent: 5, crunch: 'medium' },
  { id: 'a7', courseId: 'c1', title: 'Final exam', officialDate: '2026-12-10', weightPercent: 30, crunch: 'low' },
];

export type FixtureRole = 'student' | 'professor';
export const fixtureProfileFor = (role: FixtureRole) => ({
  displayName: role === 'professor' ? 'Fixture Professor' : 'Fixture Student',
  role,
});
export const fixtureProfile = fixtureProfileFor('student');

/**
 * Fixture scenarios (the Session screen switches between them in fixture mode).
 * Failure scenarios make EVERY call fail honestly. They never return fake success.
 */
export type FixtureViewState =
  | 'ready'
  | 'loading'
  | 'empty'
  | 'error'
  | 'network'
  | 'expired'
  | 'revoked'
  | 'forbidden'
  | 'unavailable'
  | 'timeout'
  | 'stale'
  | 'incomplete'
  | 'suppressed'
  | 'no_result';
export const FIXTURE_VIEW_STATES: FixtureViewState[] = [
  'ready',
  'loading',
  'empty',
  'error',
  'network',
  'expired',
  'revoked',
  'forbidden',
  'unavailable',
  'timeout',
  'stale',
  'incomplete',
  'suppressed',
  'no_result',
];
