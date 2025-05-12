import { IsBoolean, IsDecimal, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({
    example: 'MATH101',
    description: 'Unique course code',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'Algebra 1',
    description: 'Course name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Introduction to algebraic concepts',
    description: 'Course description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'clg123xyz',
    description: 'Department ID',
  })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    example: 1.0,
    description: 'Number of credits',
  })
  @IsDecimal()
  @Type(() => Number)
  credits: number;

  @ApiProperty({
    example: 'clg456abc',
    description: 'Course level ID',
  })
  @IsString()
  @IsNotEmpty()
  courseLevelId: string;

  @ApiProperty({
    example: 'clg789def',
    description: 'Minimum grade level ID',
  })
  @IsString()
  @IsNotEmpty()
  minGradeLevelId: string;

  @ApiProperty({
    example: 30,
    description: 'Maximum number of students',
  })
  @IsOptional()
  maxStudents?: number;

  @ApiProperty({
    example: false,
    description: 'Whether the course is an elective',
  })
  @IsBoolean()
  @IsOptional()
  isElective?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the course is a core requirement',
  })
  @IsBoolean()
  @IsOptional()
  isCore?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the course is active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
