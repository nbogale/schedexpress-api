import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTransferCreditMappingDto {
  @ApiPropertyOptional({ description: 'External course code' })
  @IsOptional()
  @IsString()
  externalCourseCode?: string;

  @ApiPropertyOptional({ description: 'External course name' })
  @IsOptional()
  @IsString()
  externalCourseName?: string;

  @ApiPropertyOptional({ description: 'Source school type for context' })
  @IsOptional()
  @IsString()
  sourceSchoolType?: string;

  @ApiPropertyOptional({ description: 'Internal course ID (direct equivalent)' })
  @IsOptional()
  @IsString()
  internalCourseId?: string;

  @ApiPropertyOptional({ description: 'Department ID if no direct course' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Credit equivalent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditEquivalent?: number;

  @ApiPropertyOptional({ description: 'Mapping rule description' })
  @IsOptional()
  @IsString()
  mappingRule?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Priority for multiple matches' })
  @IsOptional()
  @IsNumber()
  priority?: number;
}
