import { PartialType } from '@nestjs/swagger';
import { CreateCoursePreferenceDto } from './create-course-preference.dto';
import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CoursePreferenceStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateCoursePreferenceDto extends PartialType(CreateCoursePreferenceDto) {
  @ApiProperty({
    example: 'SUBMITTED',
    description: 'Status of the course preference',
    enum: CoursePreferenceStatus,
    required: false,
  })
  @IsEnum(CoursePreferenceStatus)
  @IsOptional()
  status?: CoursePreferenceStatus;

  @ApiProperty({
    example: 'Student has completed prerequisites. Approved for enrollment.',
    description: 'Notes from counselor reviewing the preference',
    required: false,
  })
  @IsString()
  @IsOptional()
  counselorNotes?: string;

  @ApiProperty({
    example: 1,
    description: 'Priority ranking (1st choice, 2nd choice, 3rd choice, etc.)',
    required: false,
    minimum: 1,
    maximum: 20,
  })
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  priority?: number;
}

