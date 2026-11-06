/**
 * FIXTURE DATA: NOT FROM THE BACKEND. Shapes are ASSUMED C1/C2 (see src/domain/c1.ts).
 * Includes deliberate edge cases: a course whose count is MISSING (null) next to one that is a real ZERO.
 */
import type {
  HistoryEntry,
  OfficialDate,
  PrepItem,
  Proposal,
  TeachingCourse,
  WorkloadResult,
} from '../domain/c1';
import { fixtureAssessments, fixtureCourses } from './c0';

const imported = '2026-11-03T09:00:00Z';

export const fixtureTeachingCourses: TeachingCourse[] = [
  {
    id: 'c1',
    code: 'CSCE 3301',
    title: 'Computer Architecture',
    source: { kind: 'canvas_api', importedAt: imported, stale: false, incomplete: false },
    coverage: { found: 3, expected: 3 },
    review: 'reviewed',
  },
  {
    id: 'c2',
    code: 'CSCE 2303',
    title: 'Assembly and Digital Logic',
    source: { kind: 'syllabus_pdf', importedAt: imported, stale: false, incomplete: true },
    coverage: { found: 2, expected: 4 },
    review: 'needs_review',
  },
  {
    id: 'c3',
    code: 'RHET 1020',
    title: 'Academic Writing',
    source: { kind: 'manual', importedAt: null, stale: false, incomplete: false },
    coverage: { found: 0, expected: 0 }, // a REAL zero
    review: 'draft',
  },
  {
    id: 'c4',
    code: 'CSCE 2201',
    title: 'Software Engineering',
    source: { kind: 'canvas_api', importedAt: imported, stale: false, incomplete: false },
    coverage: { found: null, expected: null }, // MISSING, not zero
    review: 'needs_review',
  },
];

export const fixturePrep: PrepItem[] = fixtureAssessments.slice(0, 5).map((a, i) => ({
  id: a.id,
  courseId: a.courseId,
  courseCode: fixtureCourses.find((c) => c.id === a.courseId)?.code ?? a.courseId,
  title: a.title,
  officialDate: a.officialDate,
  review: i % 3 === 0 ? 'reviewed' : i % 3 === 1 ? 'needs_review' : 'draft',
}));

export const fixtureWorkload: WorkloadResult = {
  status: 'ok',
  inputVersion: 'input-v7',
  computedAt: '2026-11-05T08:30:00Z',
  weeks: [
    { weekStart: '2026-11-09', crunch: 'low', assessmentCount: 1, affected: { status: 'ok', value: 22 } },
    { weekStart: '2026-11-16', crunch: 'high', assessmentCount: 3, affected: { status: 'ok', value: 41 } },
    { weekStart: '2026-11-23', crunch: 'medium', assessmentCount: 2, affected: { status: 'suppressed' } },
    { weekStart: '2026-11-30', crunch: 'low', assessmentCount: null, affected: { status: 'unavailable' } },
  ],
};

export const fixtureProposals: Proposal[] = [
  {
    id: 'p1',
    revision: 1,
    assessmentId: 'a2',
    assessmentVersion: 4,
    courseCode: 'CSCE 3301',
    title: 'Midterm',
    currentDate: '2026-11-17',
    proposedDate: '2026-11-19',
    explanation: 'Moving the midterm by two days spreads three assessments out and removes the same-day overlap.',
    status: 'pending',
    before: {
      inputVersion: 'input-v7',
      weeks: [
        { weekStart: '2026-11-16', crunch: 'high', assessmentCount: 3, affected: { status: 'ok', value: 41 } },
        { weekStart: '2026-11-23', crunch: 'medium', assessmentCount: 2, affected: { status: 'suppressed' } },
      ],
    },
    after: {
      inputVersion: 'input-v7',
      weeks: [
        { weekStart: '2026-11-16', crunch: 'medium', assessmentCount: 2, affected: { status: 'ok', value: 18 } },
        { weekStart: '2026-11-23', crunch: 'medium', assessmentCount: 3, affected: { status: 'suppressed' } },
      ],
    },
    overlapReduction: { status: 'ok', value: 23 },
  },
  {
    id: 'p2',
    revision: 2,
    assessmentId: 'a3',
    assessmentVersion: 2,
    courseCode: 'CSCE 2303',
    title: 'Lab 4 report',
    currentDate: '2026-11-17',
    proposedDate: '2026-11-20',
    explanation: 'A short move clears the Tuesday pile-up. The two results below use different data, so they are not compared.',
    status: 'pending',
    before: {
      inputVersion: 'input-v7',
      weeks: [{ weekStart: '2026-11-16', crunch: 'high', assessmentCount: 3, affected: { status: 'ok', value: 41 } }],
    },
    after: {
      inputVersion: 'input-v8',
      weeks: [{ weekStart: '2026-11-16', crunch: 'medium', assessmentCount: 2, affected: { status: 'ok', value: 18 } }],
    },
    overlapReduction: { status: 'unavailable' },
  },
];

export const fixtureHistory: HistoryEntry[] = [
  {
    id: 'h0',
    at: '2026-11-04T14:10:00Z',
    action: 'reject',
    proposalId: 'p0',
    title: 'Quiz 3',
    actorRole: 'professor',
    resultStatus: 'rejected',
  },
];

/** The signed-in student's OWN official dates (owner-authorized view). */
export const fixtureOfficialDates: OfficialDate[] = fixtureAssessments.map((a) => ({
  assessmentId: a.id,
  courseCode: fixtureCourses.find((c) => c.id === a.courseId)?.code ?? a.courseId,
  title: a.title,
  officialDate: a.officialDate,
  importedOfficialDate: a.officialDate,
  source: { kind: 'canvas_api', importedAt: imported, stale: false, incomplete: false },
}));
