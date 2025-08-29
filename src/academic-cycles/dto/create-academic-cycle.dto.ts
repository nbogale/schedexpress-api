import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsInt, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CycleType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateAcademicCycleDto {
  @ApiPropertyOptional({ description: 'Parent cycle ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Configuration ID' })
  @IsOptional()
  @IsString()
  configId?: string;

  @ApiProperty({ description: 'Cycle name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Cycle type', enum: CycleType })
  @IsEnum(CycleType)
  cycleType: CycleType;

  @ApiPropertyOptional({ description: 'Cycle number' })
  @IsOptional()
  @IsInt()
  cycleNumber?: number;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // If it's just a date string (YYYY-MM-DD), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      // If it's a full ISO string, extract just the date part
      if (value.includes('T')) {
        return value.split('T')[0];
      }
      return value;
    }
    return value;
  })
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // If it's just a date string (YYYY-MM-DD), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      // If it's a full ISO string, extract just the date part
      if (value.includes('T')) {
        return value.split('T')[0];
      }
      return value;
    }
    return value;
  })
  endDate: string;

  @ApiPropertyOptional({ description: 'Whether this is the current cycle', default: false })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({ description: 'Whether this cycle is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Cycle description' })
  @IsOptional()
  @IsString()
  description?: string;
}
