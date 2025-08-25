import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsInt, IsEnum, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CycleType } from '@prisma/client';

export class CreateAcademicCycleRuleDto {
  @ApiProperty({ description: 'Configuration ID' })
  @IsString()
  @IsNotEmpty()
  configId: string;

  @ApiPropertyOptional({ description: 'Parent cycle type', enum: CycleType })
  @IsOptional()
  @IsEnum(CycleType)
  parentCycleType?: CycleType;

  @ApiProperty({ description: 'Cycle type', enum: CycleType })
  @IsEnum(CycleType)
  cycleType: CycleType;

  @ApiProperty({ description: 'Cycle name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cycleName: string;

  @ApiPropertyOptional({ description: 'Cycle number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cycleNumber?: number;

  @ApiPropertyOptional({ description: 'Whether this cycle is required', default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Minimum count', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minCount?: number;

  @ApiPropertyOptional({ description: 'Maximum count', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxCount?: number;

  @ApiPropertyOptional({ description: 'Default duration in days', default: 90 })
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultDuration?: number;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether cycles must be sequential', default: true })
  @IsOptional()
  @IsBoolean()
  mustBeSequential?: boolean;

  @ApiPropertyOptional({ description: 'Whether cycles must have gaps', default: false })
  @IsOptional()
  @IsBoolean()
  mustHaveGaps?: boolean;

  @ApiPropertyOptional({ description: 'Whether cycles can overlap', default: false })
  @IsOptional()
  @IsBoolean()
  allowOverlap?: boolean;
}
