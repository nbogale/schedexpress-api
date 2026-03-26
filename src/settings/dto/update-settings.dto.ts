import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max, IsEnum, Min, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ScheduleChangeConfig } from '../../schedule-change-requests/interfaces/schedule-change-config.interface';

export enum ScheduleType {
  STANDARD = 'STANDARD',
  BLOCK = 'BLOCK',
}

export class UpdateSettingsDto {
  @ApiProperty({
    example: 'East High School',
    description: 'School name',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  schoolName?: string;

  @ApiProperty({
    example: 8,
    description: 'Maximum number of courses per student',
    required: false,
  })
  @IsInt()
  @IsPositive()
  @Max(12)
  @IsOptional()
  maxCourseLoad?: number;

  @ApiProperty({
    example: false,
    description: 'Whether to allow scheduling conflicts',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  allowConflicts?: boolean;

  @ApiProperty({
    example: ScheduleType.STANDARD,
    description: 'Type of schedule system',
    enum: ScheduleType,
    required: false,
  })
  @IsEnum(ScheduleType)
  @IsOptional()
  scheduleType?: ScheduleType;

  @ApiProperty({
    example: false,
    description: 'Whether rotation days are enabled',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  hasRotationDays?: boolean;

  @ApiProperty({
    example: 'A_DAY,B_DAY',
    description: 'Comma-separated rotation pattern tokens (e.g. A_DAY,B_DAY)',
    required: false,
  })
  @IsString()
  @IsOptional()
  rotationPattern?: string;

  @ApiProperty({
    example: 45,
    description: 'Minimum block duration in minutes',
    required: false,
  })
  @IsInt()
  @IsPositive()
  @Min(15)
  @Max(60)
  @IsOptional()
  minBlockDuration?: number;

  @ApiProperty({
    example: 120,
    description: 'Maximum block duration in minutes',
    required: false,
  })
  @IsInt()
  @IsPositive()
  @Min(60)
  @Max(180)
  @IsOptional()
  maxBlockDuration?: number;

  @ApiProperty({
    example: false,
    description: 'Whether overlapping time blocks are allowed',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  allowOverlappingBlocks?: boolean;

  @ApiProperty({
    example: {
      enabled: true,
      deadlineDays: 14,
      allowEmergencyChanges: true,
      studentCanRequest: true,
      parentCanRequest: true,
      counselorCanApprove: true,
      maxRequestsPerStudent: 2,
      requireReason: true,
      allowChangesAfterDeadline: false,
      notifyTeachers: true,
      notifyParents: true,
      notifyCounselors: true,
      autoApproveConditions: {
        sameTeacher: false,
        sameTimeSlot: false,
        withinDeadline: false,
        sameCourse: true,
        lowEnrollment: false
      },
      allowedRequestTypes: ['ADD_COURSE', 'DROP_COURSE', 'CHANGE_SECTION', 'SWAP_COURSE'],
      requireParentApproval: false,
      allowConcurrentRequests: true,
      maxConcurrentRequests: 3
    },
    description: 'Schedule change request configuration (global defaults)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  scheduleChangeConfig?: ScheduleChangeConfig;
}
