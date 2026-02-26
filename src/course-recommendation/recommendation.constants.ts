/**
 * Local enum constants for course recommendations.
 * Mirrors Prisma enums so the module compiles when Prisma client
 * is generated from a schema that includes CourseRecommendation.
 */
export const RecommendationType = {
  GRADUATION_REQUIREMENT: 'GRADUATION_REQUIREMENT',
  PREREQUISITE: 'PREREQUISITE',
  INTEREST: 'INTEREST',
  GAP_FILLER: 'GAP_FILLER',
  CREDIT_RECOVERY: 'CREDIT_RECOVERY',
  ADVANCEMENT: 'ADVANCEMENT',
  ELECTIVE: 'ELECTIVE',
} as const;

export const RecommendationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  ENROLLED: 'ENROLLED',
  EXPIRED: 'EXPIRED',
} as const;

export const StudentAction = {
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  ADDED_TO_PREFERENCES: 'ADDED_TO_PREFERENCES',
  ENROLLED: 'ENROLLED',
  IGNORED: 'IGNORED',
} as const;

export const CourseAvailabilityStatus = {
  AVAILABLE: 'AVAILABLE',
  NOT_OFFERED: 'NOT_OFFERED',
  DISTRICT_WIDE: 'DISTRICT_WIDE',
  ONLINE: 'ONLINE',
  DUAL_ENROLLMENT: 'DUAL_ENROLLMENT',
} as const;

export type RecommendationStatusValue =
  (typeof RecommendationStatus)[keyof typeof RecommendationStatus];
