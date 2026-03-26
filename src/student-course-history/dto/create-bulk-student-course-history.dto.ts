import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDecimal, Min, Max, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentGradeData {
  @ApiProperty({
    description: 'Student ID',
    example: 'clg123xyz',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: 'Grade received (optional)',
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

export class CreateBulkStudentCourseHistoryDto {
  @ApiProperty({
    description: 'Course ID',
    example: 'clg456abc',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'Academic Cycle ID',
    example: 'clg789def',
  })
  @IsString()
  academicCycleId: string;

  @ApiProperty({
    description: 'Array of student grade data',
    type: [StudentGradeData],
    example: [
      {
        studentId: 'clg123xyz',
        grade: 'A',
        creditEarned: 3.0
      },
      {
        studentId: 'clg456abc',
        grade: 'B',
        creditEarned: 3.0
      }
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StudentGradeData)
  students: StudentGradeData[];
} 