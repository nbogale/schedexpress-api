import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsInt, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CycleType } from '@prisma/client';

export class CreateAcademicCycleConfigDto {
  @ApiProperty({ description: 'Configuration name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Configuration description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this configuration is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Whether this is the default configuration' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Whether to include semesters' })
  @IsOptional()
  @IsBoolean()
  hasSemesters?: boolean;

  @ApiPropertyOptional({ description: 'Whether to include quarters' })
  @IsOptional()
  @IsBoolean()
  hasQuarters?: boolean;

  @ApiPropertyOptional({ description: 'Whether to include trimesters' })
  @IsOptional()
  @IsBoolean()
  hasTrimesters?: boolean;

  @ApiPropertyOptional({ description: 'Whether to include sessions' })
  @IsOptional()
  @IsBoolean()
  hasSessions?: boolean;

  @ApiPropertyOptional({ description: 'Whether to enforce structure rules' })
  @IsOptional()
  @IsBoolean()
  enforceStructure?: boolean;

  @ApiPropertyOptional({ description: 'Whether to allow custom cycles' })
  @IsOptional()
  @IsBoolean()
  allowCustomCycles?: boolean;

  @ApiPropertyOptional({ description: 'Whether validation is required' })
  @IsOptional()
  @IsBoolean()
  requireValidation?: boolean;
}
