import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsInt, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CycleType } from '@prisma/client';

export class CreateAcademicCycleRuleDto {
  @ApiProperty({ description: 'Configuration ID' })
  @IsString()
  @IsNotEmpty()
  configId: string;

  @ApiPropertyOptional({ description: 'Parent cycle type' })
  @IsOptional()
  @IsEnum(CycleType)
  parentCycleType?: CycleType;

  @ApiProperty({ description: 'Cycle type' })
  @IsEnum(CycleType)
  cycleType: CycleType;

  @ApiProperty({ description: 'Cycle name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cycleName: string;

  @ApiPropertyOptional({ description: 'Cycle number' })
  @IsOptional()
  @IsInt()
  cycleNumber?: number;

  @ApiPropertyOptional({ description: 'Whether this cycle is required' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Minimum count' })
  @IsOptional()
  @IsInt()
  minCount?: number;

  @ApiPropertyOptional({ description: 'Maximum count' })
  @IsOptional()
  @IsInt()
  maxCount?: number;

  @ApiPropertyOptional({ description: 'Default duration in days' })
  @IsOptional()
  @IsInt()
  defaultDuration?: number;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether cycles must be sequential' })
  @IsOptional()
  @IsBoolean()
  mustBeSequential?: boolean;

  @ApiPropertyOptional({ description: 'Whether cycles must have gaps' })
  @IsOptional()
  @IsBoolean()
  mustHaveGaps?: boolean;

  @ApiPropertyOptional({ description: 'Whether cycles can overlap' })
  @IsOptional()
  @IsBoolean()
  allowOverlap?: boolean;
}
