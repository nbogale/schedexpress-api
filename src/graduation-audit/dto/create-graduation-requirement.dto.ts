import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, IsString as IsStringDecorator, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequirementType } from '@prisma/client';

export class CreateGraduationRequirementDto {
  @ApiProperty({ description: 'Requirement name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Requirement description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: RequirementType, description: 'Type of requirement' })
  @IsEnum(RequirementType)
  requirementType: RequirementType;

  @ApiPropertyOptional({ description: 'Requirement category (e.g., Math, English, Science)' })
  @IsOptional()
  @IsString()
  requirementCategory?: string;

  @ApiPropertyOptional({ description: 'Required credits (for credit-based requirements)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredCredits?: number;

  @ApiPropertyOptional({ description: 'Required course ID (for course-based requirements)' })
  @IsOptional()
  @IsString()
  requiredCourseId?: string;

  @ApiPropertyOptional({ description: 'Alternative course IDs (array) for COURSE_ONE_OF', type: [String] })
  @IsOptional()
  @IsArray()
  @IsStringDecorator({ each: true })
  alternativeCourseIds?: string[];

  @ApiPropertyOptional({ description: 'Requires lab-based courses (for science requirements)' })
  @IsOptional()
  @IsBoolean()
  requiresLabBased?: boolean;

  @ApiPropertyOptional({ description: 'Requires life science courses' })
  @IsOptional()
  @IsBoolean()
  requiresLifeScience?: boolean;

  @ApiPropertyOptional({ description: 'Requires physical science courses' })
  @IsOptional()
  @IsBoolean()
  requiresPhysicalScience?: boolean;

  @ApiPropertyOptional({ description: 'Minimum GPA required' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  minimumGPA?: number;

  @ApiPropertyOptional({ description: 'Assessment alternatives (array)' })
  @IsOptional()
  @IsArray()
  assessmentAlternatives?: any[];

  @ApiPropertyOptional({ description: 'Priority (for ordering)', default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
