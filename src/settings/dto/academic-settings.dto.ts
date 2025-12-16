import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsObject, IsOptional, IsEnum, Min, Max, IsIn } from 'class-validator';

export enum AcademicStructureType {
  SEMESTER_QUARTERS = 'SEMESTER_QUARTERS',
  QUARTERS_ONLY = 'QUARTERS_ONLY',
  TRIMESTERS = 'TRIMESTERS',
  SEMESTERS_ONLY = 'SEMESTERS_ONLY',
  /**
   * Single school year only - no semesters or quarters are required.
   * Periods can still be configured optionally at the school-year level.
   */
  SCHOOL_YEAR_ONLY = 'SCHOOL_YEAR_ONLY',
  CUSTOM = 'CUSTOM',
}

export class DefaultPeriodConfiguration {
  @ApiProperty({ description: 'School year level period defaults', required: false })
  schoolYear?: {
    preparation?: { daysBeforeStart: number; duration: number };
    registration?: { timing: 'BEFORE_INSTRUCTION' | 'CONCURRENT'; duration: number };
    orientation?: { duration: number };
    closing?: { daysBeforeEnd: number; duration: number };
  };

  @ApiProperty({ description: 'Semester/Quarter level period defaults', required: false })
  semesterQuarter?: {
    instruction?: { nameTemplate: string; allowsScheduleChanges: boolean; scheduleChangeWindow: number };
    exam?: { duration: number; timing: 'END_OF_CYCLE' };
    grading?: { duration: number; timing: 'AFTER_EXAMS' };
    breaks?: {
      thanksgiving?: { enabled: boolean; duration: number };
      spring?: { enabled: boolean; duration: number };
      winter?: { enabled: boolean; duration: number };
    };
  };
}

export class AcademicPeriodRules {
  @ApiProperty({ description: 'Enrollment window settings', required: false })
  enrollment?: {
    defaultDuration: number;
    allowLateEnrollment: boolean;
    lateEnrollmentGracePeriod?: number;
    requireCounselorApproval: boolean;
  };

  @ApiProperty({ description: 'Grading window settings', required: false })
  grading?: {
    defaultDuration: number;
    allowLateSubmission: boolean;
    lateSubmissionGracePeriod?: number;
    requireAdminApproval: boolean;
  };

  @ApiProperty({ description: 'Schedule change restrictions', required: false })
  scheduleChanges?: {
    defaultWindow: number;
    allowChangesAfterDeadline: boolean;
    requireReason: boolean;
    maxChangesPerStudent: number;
  };

  @ApiProperty({ description: 'UI visibility rules', required: false })
  uiVisibility?: {
    hideEnrollmentOutsidePeriods: boolean;
    hideGradingOutsidePeriods: boolean;
    hideScheduleChangesOutsidePeriods: boolean;
    showPeriodWarnings: boolean;
  };

  @ApiProperty({ description: 'Notification preferences', required: false })
  notifications?: {
    notifyBeforeTransitions: boolean;
    notifyTeachersBeforeGrading: boolean;
    notifyAdminsBeforeEnrollment: boolean;
    notificationLeadTime: number;
  };
}

export class UpdateAcademicSettingsDto {
  @ApiProperty({
    enum: AcademicStructureType,
    example: AcademicStructureType.SEMESTER_QUARTERS,
    description: 'Academic structure type',
    required: false,
  })
  @IsEnum(AcademicStructureType)
  @IsOptional()
  academicStructureType?: AcademicStructureType;

  @ApiProperty({
    example: 2,
    description: 'Default number of semesters per year (0 allowed for SCHOOL_YEAR_ONLY)',
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(4)
  @IsOptional()
  defaultSemesterCount?: number;

  @ApiProperty({
    example: 4,
    description: 'Default number of quarters per year (0 allowed for SCHOOL_YEAR_ONLY)',
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(8)
  @IsOptional()
  defaultQuarterCount?: number;

  @ApiProperty({
    example: 3,
    description: 'Default number of trimesters per year (0 allowed for SCHOOL_YEAR_ONLY)',
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  defaultTrimesterCount?: number;

  @ApiProperty({
    example: true,
    description: 'Whether semesters have quarters',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  semestersHaveQuarters?: boolean;

  @ApiProperty({
    description: 'Default period configuration',
    required: false,
    type: 'object',
  })
  @IsObject()
  @IsOptional()
  defaultPeriodConfiguration?: DefaultPeriodConfiguration;

  @ApiProperty({
    description: 'Academic period business rules',
    required: false,
    type: 'object',
  })
  @IsObject()
  @IsOptional()
  academicPeriodRules?: AcademicPeriodRules;
}

export class AcademicSettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  settingsId: string;

  @ApiProperty({ enum: AcademicStructureType })
  academicStructureType: AcademicStructureType;

  @ApiProperty()
  defaultSemesterCount: number;

  @ApiProperty()
  defaultQuarterCount: number;

  @ApiProperty()
  defaultTrimesterCount: number;

  @ApiProperty()
  semestersHaveQuarters: boolean;

  @ApiProperty({ required: false })
  defaultPeriodConfiguration?: DefaultPeriodConfiguration;

  @ApiProperty({ required: false })
  academicPeriodRules?: AcademicPeriodRules;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

