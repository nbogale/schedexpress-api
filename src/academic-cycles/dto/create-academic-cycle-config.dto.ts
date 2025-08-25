import { IsString, IsOptional, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicCycleConfigDto {
  @ApiProperty({ description: 'Configuration name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Configuration description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this configuration is active', default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Whether this is the default configuration', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Whether to include semesters', default: true })
  @IsOptional()
  @IsBoolean()
  hasSemesters?: boolean;

  @ApiPropertyOptional({ description: 'Whether to include quarters', default: true })
  @IsOptional()
  @IsBoolean()
  hasQuarters?: boolean;

  @ApiPropertyOptional({ description: 'Whether to include trimesters', default: false })
  @IsOptional()
  @IsBoolean()
  hasTrimesters?: boolean;

  @ApiPropertyOptional({ description: 'Whether to include sessions', default: false })
  @IsOptional()
  @IsBoolean()
  hasSessions?: boolean;

  @ApiPropertyOptional({ description: 'Whether to enforce structure rules', default: true })
  @IsOptional()
  @IsBoolean()
  enforceStructure?: boolean;

  @ApiPropertyOptional({ description: 'Whether to allow custom cycles', default: false })
  @IsOptional()
  @IsBoolean()
  allowCustomCycles?: boolean;

  @ApiPropertyOptional({ description: 'Whether validation is required', default: true })
  @IsOptional()
  @IsBoolean()
  requireValidation?: boolean;
}
