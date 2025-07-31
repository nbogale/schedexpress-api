import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDecimal, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStudentCourseHistoryDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'clg123xyz',
    required: false,
  })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({
    description: 'Course ID',
    example: 'clg456abc',
    required: false,
  })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiProperty({
    description: 'School Year ID',
    example: 'clg789def',
    required: false,
  })
  @IsString()
  @IsOptional()
  schoolYearId?: string;

  @ApiProperty({
    description: 'Term ID',
    example: 'clg012ghi',
    required: false,
  })
  @IsString()
  @IsOptional()
  termId?: string;

  @ApiProperty({
    description: 'Grade received',
    example: 'A',
    required: false,
  })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiProperty({
    description: 'Whether the student passed the course',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPassed?: boolean;

  @ApiProperty({
    description: 'Credits earned',
    example: 3.0,
    required: false,
  })
  @IsDecimal()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  @IsOptional()
  creditEarned?: number;
} 