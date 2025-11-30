import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsInt, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicPeriodType, AcademicPeriodStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateAcademicPeriodDto {
  @ApiProperty({ description: 'Cycle ID' })
  @IsString()
  @IsNotEmpty()
  cycleId: string;

  @ApiProperty({ description: 'Period name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Period type', enum: AcademicPeriodType })
  @IsEnum(AcademicPeriodType)
  periodType: AcademicPeriodType;

  @ApiPropertyOptional({ description: 'Period status', enum: AcademicPeriodStatus, default: AcademicPeriodStatus.PLANNED })
  @IsOptional()
  @IsEnum(AcademicPeriodStatus)
  status?: AcademicPeriodStatus;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
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
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      if (value.includes('T')) {
        return value.split('T')[0];
      }
      return value;
    }
    return value;
  })
  endDate: string;

  @ApiPropertyOptional({ description: 'Period description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this is an instructional period', default: false })
  @IsOptional()
  @IsBoolean()
  isInstructional?: boolean;

  @ApiPropertyOptional({ description: 'Whether enrollment is allowed during this period', default: false })
  @IsOptional()
  @IsBoolean()
  allowsEnrollment?: boolean;

  @ApiPropertyOptional({ description: 'Whether grading is allowed during this period', default: false })
  @IsOptional()
  @IsBoolean()
  allowsGrading?: boolean;

  @ApiPropertyOptional({ description: 'Whether schedule changes are allowed during this period', default: false })
  @IsOptional()
  @IsBoolean()
  allowsScheduleChanges?: boolean;

  @ApiPropertyOptional({ description: 'Whether this is a break period', default: false })
  @IsOptional()
  @IsBoolean()
  isBreak?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

