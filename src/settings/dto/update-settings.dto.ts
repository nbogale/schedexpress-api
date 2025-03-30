import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    example: '2024-2025',
    description: 'Academic year',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  academicYear?: string;

  @ApiProperty({
    example: 'Fall',
    description: 'Current semester',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  semester?: string;

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
}
