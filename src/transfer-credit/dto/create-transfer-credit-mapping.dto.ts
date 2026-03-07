import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferCreditMappingDto {
  @ApiProperty({ description: 'External course code' })
  @IsString()
  externalCourseCode: string;

  @ApiProperty({ description: 'External course name' })
  @IsString()
  externalCourseName: string;

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

  @ApiPropertyOptional({ description: 'Credit equivalent', default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditEquivalent?: number;

  @ApiPropertyOptional({ description: 'Mapping rule description' })
  @IsOptional()
  @IsString()
  mappingRule?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Priority for multiple matches', default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}
