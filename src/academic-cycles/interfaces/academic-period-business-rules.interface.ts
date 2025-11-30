/**
 * Academic Period Business Rules Interfaces
 * Comprehensive rule configuration for controlling system behavior based on academic periods
 */

import { AcademicPeriodType } from '@prisma/client';
import { RequestType } from '../../schedule-change-requests/interfaces/schedule-change-config.interface';
import { ErrorCode } from '../../common/error-codes';

/**
 * Base interface for all business rule configurations
 */
export interface BusinessRuleConfig {
  isActive: boolean;
  description?: string;
}

/**
 * Enrollment Rules Configuration
 */
export interface EnrollmentRuleConfig extends BusinessRuleConfig {
  periodBasedEnrollment: {
    requireActivePeriod: boolean;
    allowedPeriodTypes: AcademicPeriodType[];
    enrollmentWindow?: {
      startDaysBeforeCycle?: number;
      endDaysAfterCycleStart?: number;
      gracePeriodDays?: number;
    };
  };
  capacity: {
    checkCapacity: boolean;
    allowOverEnrollment: boolean;
    overEnrollmentLimit?: number; // Percentage (0-100)
  };
  deadlines: {
    deadlineType: 'PERIOD_END' | 'DAYS_AFTER_START' | 'FIXED_DATE';
    deadlineDays?: number;
    lateEnrollmentAllowed: boolean;
    lateEnrollmentRequiresApproval: boolean;
  };
  addDrop: {
    addWindowDays?: number; // Days after period start when adds allowed
    dropWindowDays?: number; // Days after period start when drops allowed
    addRequiresApproval: boolean;
    dropRequiresApproval: boolean;
    noDropAfterDays?: number; // Days after which drops not allowed
  };
}

/**
 * Schedule Change Rules Configuration
 */
export interface ScheduleChangeRuleConfig extends BusinessRuleConfig {
  periodBasedChanges: {
    requireActivePeriod: boolean;
    allowedPeriodTypes: AcademicPeriodType[];
    changeWindowDays?: number; // Days after instruction starts
    deadlineDaysBeforeEnd?: number; // Days before period end
  };
  requestLimits: {
    maxRequestsPerCycle: number;
    maxRequestsPerPeriod?: number;
    maxConcurrentRequests: number;
    allowConcurrentRequests: boolean;
  };
  requestTypes: {
    allowedRequestTypes: RequestType[];
    restrictionsByPeriodType?: Partial<Record<AcademicPeriodType, RequestType[]>>;
  };
  autoApproval: {
    autoApproveWithinDeadline: boolean;
    autoApproveSameTeacher: boolean;
    autoApproveLowEnrollment: boolean;
    autoApproveConditions?: Record<string, any>;
  };
}

/**
 * Grading Rules Configuration
 */
export interface GradingRuleConfig extends BusinessRuleConfig {
  periodBasedGrading: {
    requireActivePeriod: boolean;
    allowedPeriodTypes: AcademicPeriodType[];
    earlyGradingAllowed: boolean;
    lateGradingAllowed: boolean;
  };
  deadlines: {
    deadlineType: 'PERIOD_END' | 'DAYS_AFTER_PERIOD_END' | 'FIXED_DATE';
    deadlineDays?: number;
    gracePeriodDays?: number;
    hardDeadline: boolean; // No grading after hard deadline
  };
  validation: {
    requireAllAssignments: boolean;
    requireMinimumGradeCount?: number;
    allowIncomplete: boolean;
    requireCommentsForLowGrades: boolean;
    lowGradeThreshold?: number; // Grade below which comments required
  };
  locking: {
    lockAfterSubmission: boolean;
    allowCorrections: boolean;
    correctionRequiresApproval: boolean;
    finalGradeLock: boolean;
  };
}

/**
 * Instruction Rules Configuration
 */
export interface InstructionRuleConfig extends BusinessRuleConfig {
  activeInstruction: {
    requireInstructionalPeriod: boolean;
    allowedPeriodTypes: AcademicPeriodType[];
    allowInstructionDuringBreaks: boolean;
    instructionDuringExams: boolean;
  };
  attendance: {
    trackAttendance: boolean;
    requiredPeriodTypes: AcademicPeriodType[];
    attendanceDuringBreaks: boolean;
    minimumAttendancePercentage?: number;
  };
  classActivities: {
    allowAssignments: boolean;
    allowQuizzes: boolean;
    allowNewEnrollments: boolean;
    restrictionsByPeriodType?: Partial<Record<AcademicPeriodType, string[]>>;
  };
}

/**
 * Break Period Rules Configuration
 */
export interface BreakPeriodRuleConfig extends BusinessRuleConfig {
  systemBehavior: {
    disableEnrollment: boolean;
    disableScheduleChanges: boolean;
    disableGrading: boolean;
    allowViewing: boolean; // Read-only access
    allowPlanning: boolean; // Allow planning for next period
  };
  exceptions: {
    allowEmergencyEnrollment: boolean;
    allowAdminOverrides: boolean;
    exceptionsByBreakType?: Record<string, any>;
  };
}

/**
 * Complete Business Rules Configuration
 */
export interface AcademicPeriodBusinessRules {
  enrollment?: EnrollmentRuleConfig;
  scheduleChange?: ScheduleChangeRuleConfig;
  grading?: GradingRuleConfig;
  instruction?: InstructionRuleConfig;
  breakPeriod?: BreakPeriodRuleConfig;
}

/**
 * Validation Context for checking rules
 */
export interface ValidationContext {
  studentId?: string;
  teacherId?: string;
  cycleId: string;
  periodId?: string;
  currentDate: Date;
  actionType: 'ENROLLMENT' | 'SCHEDULE_CHANGE' | 'GRADING' | 'INSTRUCTION';
  actionData?: any;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  errorCode?: ErrorCode;
  restrictions?: string[];
  metadata?: Record<string, any>;
  nextAllowedDate?: Date;
  requiresApproval?: boolean;
}

/**
 * Enrollment Validation Result
 */
export interface EnrollmentValidationResult extends ValidationResult {
  currentPeriod?: {
    id: string;
    name: string;
    periodType: AcademicPeriodType;
    allowsEnrollment: boolean;
  };
  deadline?: Date;
  canAdd?: boolean;
  canDrop?: boolean;
  requiresApproval?: boolean;
}

/**
 * Schedule Change Validation Result
 */
export interface ScheduleChangeValidationResult extends ValidationResult {
  currentPeriod?: {
    id: string;
    name: string;
    periodType: AcademicPeriodType;
    allowsScheduleChanges: boolean;
  };
  remainingRequests?: number;
  deadline?: Date;
  allowedRequestTypes?: RequestType[];
}

/**
 * Grading Validation Result
 */
export interface GradingValidationResult extends ValidationResult {
  currentPeriod?: {
    id: string;
    name: string;
    periodType: AcademicPeriodType;
    allowsGrading: boolean;
  };
  deadline?: Date;
  canSubmitEarly?: boolean;
  canSubmitLate?: boolean;
  requiresApproval?: boolean;
}

/**
 * Default Business Rules Configuration
 */
export const DEFAULT_ENROLLMENT_RULES: EnrollmentRuleConfig = {
  isActive: true,
  description: 'Default enrollment rules',
  periodBasedEnrollment: {
    requireActivePeriod: true,
    allowedPeriodTypes: [AcademicPeriodType.REGISTRATION],
  },
  capacity: {
    checkCapacity: true,
    allowOverEnrollment: false,
  },
  deadlines: {
    deadlineType: 'PERIOD_END',
    lateEnrollmentAllowed: false,
    lateEnrollmentRequiresApproval: true,
  },
  addDrop: {
    addRequiresApproval: false,
    dropRequiresApproval: false,
  },
};

export const DEFAULT_SCHEDULE_CHANGE_RULES: ScheduleChangeRuleConfig = {
  isActive: true,
  description: 'Default schedule change rules',
  periodBasedChanges: {
    requireActivePeriod: true,
    allowedPeriodTypes: [AcademicPeriodType.REGISTRATION],
    changeWindowDays: 14, // 2 weeks after instruction starts
  },
  requestLimits: {
    maxRequestsPerCycle: 3,
    maxConcurrentRequests: 1,
    allowConcurrentRequests: false,
  },
  requestTypes: {
    allowedRequestTypes: [RequestType.ADD_COURSE, RequestType.DROP_COURSE, RequestType.CHANGE_SECTION, RequestType.SWAP_COURSE],
  },
  autoApproval: {
    autoApproveWithinDeadline: false,
    autoApproveSameTeacher: false,
    autoApproveLowEnrollment: false,
  },
};

export const DEFAULT_GRADING_RULES: GradingRuleConfig = {
  isActive: true,
  description: 'Default grading rules',
  periodBasedGrading: {
    requireActivePeriod: true,
    allowedPeriodTypes: [AcademicPeriodType.GRADING],
    earlyGradingAllowed: false,
    lateGradingAllowed: false,
  },
  deadlines: {
    deadlineType: 'DAYS_AFTER_PERIOD_END',
    deadlineDays: 7,
    gracePeriodDays: 3,
    hardDeadline: false,
  },
  validation: {
    requireAllAssignments: false,
    allowIncomplete: true,
    requireCommentsForLowGrades: false,
    lowGradeThreshold: 60,
  },
  locking: {
    lockAfterSubmission: false,
    allowCorrections: true,
    correctionRequiresApproval: false,
    finalGradeLock: false,
  },
};

export const DEFAULT_INSTRUCTION_RULES: InstructionRuleConfig = {
  isActive: true,
  description: 'Default instruction rules',
  activeInstruction: {
    requireInstructionalPeriod: true,
    allowedPeriodTypes: [AcademicPeriodType.INSTRUCTION],
    allowInstructionDuringBreaks: false,
    instructionDuringExams: false,
  },
  attendance: {
    trackAttendance: true,
    requiredPeriodTypes: [AcademicPeriodType.INSTRUCTION],
    attendanceDuringBreaks: false,
  },
  classActivities: {
    allowAssignments: true,
    allowQuizzes: true,
    allowNewEnrollments: false,
  },
};

export const DEFAULT_BREAK_PERIOD_RULES: BreakPeriodRuleConfig = {
  isActive: true,
  description: 'Default break period rules',
  systemBehavior: {
    disableEnrollment: true,
    disableScheduleChanges: true,
    disableGrading: true,
    allowViewing: true,
    allowPlanning: true,
  },
  exceptions: {
    allowEmergencyEnrollment: false,
    allowAdminOverrides: true,
  },
};

export const DEFAULT_BUSINESS_RULES: AcademicPeriodBusinessRules = {
  enrollment: DEFAULT_ENROLLMENT_RULES,
  scheduleChange: DEFAULT_SCHEDULE_CHANGE_RULES,
  grading: DEFAULT_GRADING_RULES,
  instruction: DEFAULT_INSTRUCTION_RULES,
  breakPeriod: DEFAULT_BREAK_PERIOD_RULES,
};

