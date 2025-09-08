import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsInt, IsEnum, IsDateString, MaxLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CycleType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { ScheduleChangeConfig } from '../../schedule-change-requests/interfaces/schedule-change-config.interface';

export class CreateAcademicCycleDto {
  @ApiPropertyOptional({ description: 'Parent cycle ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Configuration ID' })
  @IsOptional()
  @IsString()
  configId?: string;

  @ApiProperty({ description: 'Cycle name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Cycle type', enum: CycleType })
  @IsEnum(CycleType)
  cycleType: CycleType;

  @ApiPropertyOptional({ description: 'Cycle number' })
  @IsOptional()
  @IsInt()
  cycleNumber?: number;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // If it's just a date string (YYYY-MM-DD), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      // If it's a full ISO string, extract just the date part
      if (value.includes('T')) {
        return value.split('T')[0];
      }
      return value;
    }
    return value;
  })
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // If it's just a date string (YYYY-MM-DD), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      // If it's a full ISO string, extract just the date part
      if (value.includes('T')) {
        return value.split('T')[0];
      }
      return value;
    }
    return value;
  })
  endDate: string;

  @ApiPropertyOptional({ description: 'Whether this is the current cycle', default: false })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({ description: 'Whether this cycle is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Cycle description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Schedule change request configuration (cycle-specific overrides)',
    example: {
      enabled: true,
      deadlineDays: 10,
      allowEmergencyChanges: true,
      studentCanRequest: true,
      parentCanRequest: true,
      counselorCanApprove: true,
      maxRequestsPerStudent: 1,
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
      allowedRequestTypes: ['ADD_COURSE', 'DROP_COURSE'],
      requireParentApproval: false,
      allowConcurrentRequests: false,
      maxConcurrentRequests: 1
    }
  })
  @IsOptional()
  @IsObject()
  scheduleChangeConfig?: ScheduleChangeConfig;
}
