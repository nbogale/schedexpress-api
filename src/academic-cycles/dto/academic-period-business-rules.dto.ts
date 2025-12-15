import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AcademicPeriodType } from '@prisma/client';
import {
  EnrollmentRuleConfig,
  ScheduleChangeRuleConfig,
  GradingRuleConfig,
  InstructionRuleConfig,
  BreakPeriodRuleConfig,
  AcademicPeriodBusinessRules,
} from '../interfaces/academic-period-business-rules.interface';
import { RequestType } from '../../schedule-change-requests/interfaces/schedule-change-config.interface';

/**
 * DTO for Enrollment Rule Configuration
 */
export class EnrollmentRuleConfigDto implements EnrollmentRuleConfig {
  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  periodBasedEnrollment: {
    requireActivePeriod: boolean;
    allowedPeriodTypes: AcademicPeriodType[];
    enrollmentWindow?: {
      startDaysBeforeCycle?: number;
      endDaysAfterCycleStart?: number;
      gracePeriodDays?: number;
    };
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  capacity: {
    checkCapacity: boolean;
    allowOverEnrollment: boolean;
    overEnrollmentLimit?: number;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  deadlines: {
    deadlineType: 'PERIOD_END' | 'DAYS_AFTER_START' | 'FIXED_DATE';
    deadlineDays?: number;
    lateEnrollmentAllowed: boolean;
    lateEnrollmentRequiresApproval: boolean;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  addDrop: {
    addWindowDays?: number;
    dropWindowDays?: number;
    addRequiresApproval: boolean;
    dropRequiresApproval: boolean;
    noDropAfterDays?: number;
  };
}

/**
 * DTO for Schedule Change Rule Configuration
 */
export class ScheduleChangeRuleConfigDto implements ScheduleChangeRuleConfig {
  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  periodBasedChanges: {
    requireActivePeriod: boolean;
    allowedPeriodTypes: AcademicPeriodType[];
    changeWindowDays?: number;
    deadlineDaysBeforeEnd?: number;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  requestLimits: {
    maxRequestsPerCycle: number;
    maxRequestsPerPeriod?: number;
    maxConcurrentRequests: number;
    allowConcurrentRequests: boolean;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  requestTypes: {
    allowedRequestTypes: RequestType[];
    restrictionsByPeriodType?: Partial<Record<AcademicPeriodType, RequestType[]>>;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  autoApproval: {
    autoApproveWithinDeadline: boolean;
    autoApproveSameTeacher: boolean;
    autoApproveLowEnrollment: boolean;
    autoApproveConditions?: Record<string, any>;
  };
}

/**
 * DTO for Grading Rule Configuration
 */
export class GradingRuleConfigDto implements GradingRuleConfig {
  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  periodBasedGrading: {
    requireActivePeriod: boolean;
    allowedPeriodTypes: AcademicPeriodType[];
    earlyGradingAllowed: boolean;
    lateGradingAllowed: boolean;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  deadlines: {
    deadlineType: 'PERIOD_END' | 'DAYS_AFTER_PERIOD_END' | 'FIXED_DATE';
    deadlineDays?: number;
    gracePeriodDays?: number;
    hardDeadline: boolean;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  validation: {
    requireAllAssignments: boolean;
    requireMinimumGradeCount?: number;
    allowIncomplete: boolean;
    requireCommentsForLowGrades: boolean;
    lowGradeThreshold?: number;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  locking: {
    lockAfterSubmission: boolean;
    allowCorrections: boolean;
    correctionRequiresApproval: boolean;
    finalGradeLock: boolean;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  multipleSubmissions: {
    allowMultipleSubmissions: boolean;
    maxSubmissionsPerCycle?: number;
    submissionInterval?: number;
    allowOverwriteInterim: boolean;
    requireFinalGradeAtCycleEnd: boolean;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  finalGradeCalculation: {
    method: 'AVERAGE' | 'WEIGHTED' | 'LATEST' | 'MANUAL';
    weights?: Record<string, number>;
    includeAllInterim: boolean;
    dropLowest?: number;
  };
}

/**
 * DTO for Instruction Rule Configuration
 */
export class InstructionRuleConfigDto implements InstructionRuleConfig {
  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  activeInstruction: {
    requireInstructionalPeriod: boolean;
    allowedPeriodTypes: AcademicPeriodType[];
    allowInstructionDuringBreaks: boolean;
    instructionDuringExams: boolean;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  attendance: {
    trackAttendance: boolean;
    requiredPeriodTypes: AcademicPeriodType[];
    attendanceDuringBreaks: boolean;
    minimumAttendancePercentage?: number;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  classActivities: {
    allowAssignments: boolean;
    allowQuizzes: boolean;
    allowNewEnrollments: boolean;
    restrictionsByPeriodType?: Partial<Record<AcademicPeriodType, string[]>>;
  };
}

/**
 * DTO for Break Period Rule Configuration
 */
export class BreakPeriodRuleConfigDto implements BreakPeriodRuleConfig {
  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  systemBehavior: {
    disableEnrollment: boolean;
    disableScheduleChanges: boolean;
    disableGrading: boolean;
    allowViewing: boolean;
    allowPlanning: boolean;
  };

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  exceptions: {
    allowEmergencyEnrollment: boolean;
    allowAdminOverrides: boolean;
    exceptionsByBreakType?: Record<string, any>;
  };
}

/**
 * DTO for Complete Business Rules
 */
export class AcademicPeriodBusinessRulesDto implements AcademicPeriodBusinessRules {
  @ApiPropertyOptional({ type: EnrollmentRuleConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnrollmentRuleConfigDto)
  enrollment?: EnrollmentRuleConfig;

  @ApiPropertyOptional({ type: ScheduleChangeRuleConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleChangeRuleConfigDto)
  scheduleChange?: ScheduleChangeRuleConfig;

  @ApiPropertyOptional({ type: GradingRuleConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GradingRuleConfigDto)
  grading?: GradingRuleConfig;

  @ApiPropertyOptional({ type: InstructionRuleConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InstructionRuleConfigDto)
  instruction?: InstructionRuleConfig;

  @ApiPropertyOptional({ type: BreakPeriodRuleConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BreakPeriodRuleConfigDto)
  breakPeriod?: BreakPeriodRuleConfig;
}

/**
 * DTO for updating business rules (partial update)
 * Uses @IsObject() to allow flexible nested structures without strict validation
 */
export class UpdateAcademicPeriodBusinessRulesDto {
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  enrollment?: any;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  scheduleChange?: any;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  grading?: any;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  instruction?: any;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  breakPeriod?: any;
}

/**
 * Response DTO for business rules
 */
export class AcademicPeriodBusinessRulesResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  settingsId: string;

  @ApiPropertyOptional({ type: AcademicPeriodBusinessRulesDto })
  academicPeriodRules?: AcademicPeriodBusinessRules;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

