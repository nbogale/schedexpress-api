import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCourseToPlanDto {
  @ApiProperty({ description: 'Course ID' })
  @IsString()
  courseId: string;

  @ApiPropertyOptional({ description: 'Planned academic cycle ID' })
  @IsOptional()
  @IsString()
  plannedAcademicCycleId?: string;

  @ApiPropertyOptional({ description: 'Planned year (e.g., 2024)' })
  @IsOptional()
  @IsNumber()
  plannedYear?: number;

  @ApiPropertyOptional({ description: 'Planned grade level (9, 10, 11, 12)' })
  @IsOptional()
  @IsNumber()
  @Min(9)
  @Max(12)
  plannedGrade?: number;

  @ApiPropertyOptional({ description: 'Priority', default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is required course', default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Is elective course', default: true })
  @IsOptional()
  @IsBoolean()
  isElective?: boolean;
}
