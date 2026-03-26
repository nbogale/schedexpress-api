import { IsNotEmpty, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoursePreferenceDto {
  @ApiProperty({
    example: 'clg101uvw',
    description: 'ID of the course the student wants to take',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    example: 'clg202xyz',
    description: 'ID of the academic cycle (future academic year)',
  })
  @IsString()
  @IsNotEmpty()
  academicCycleId: string;

  @ApiProperty({
    example: 'I want to take this course to prepare for my college major in engineering.',
    description: 'Optional reason for the course preference',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    example: 1,
    description: 'Priority ranking (1st choice, 2nd choice, 3rd choice, etc.). If not provided, will be auto-assigned as the next available priority.',
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

