import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateCourseSectionDto {
  @ApiProperty({ description: 'The course ID this section belongs to' })
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'The section number (e.g., A, B, C)' })
  @IsString()
  sectionNumber: string;

  @ApiProperty({ description: 'The school year ID' })
  @IsString()
  schoolYearId: string;

  @ApiProperty({ description: 'The term ID' })
  @IsString()
  termId: string;

  @ApiProperty({ description: 'The time block ID' })
  @IsString()
  timeBlockId: string;

  @ApiProperty({ description: 'The room ID' })
  @IsString()
  roomId: string;

  @ApiProperty({ description: 'The teacher ID' })
  @IsString()
  teacherId: string;

  @ApiProperty({ description: 'Maximum number of students allowed in the section' })
  @IsNumber()
  @Min(1)
  @Max(100)
  maxEnrollment: number;

  @ApiProperty({ description: 'Current number of enrolled students', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentEnrollment?: number = 0;
} 