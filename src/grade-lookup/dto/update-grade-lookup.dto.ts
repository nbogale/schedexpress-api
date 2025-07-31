import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDecimal, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGradeLookupDto {
  @ApiProperty({
    description: 'Grade letter (e.g., A, B, C, D, F)',
    example: 'A',
    required: false,
  })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiProperty({
    description: 'Grade points (e.g., 4.0 for A, 3.0 for B)',
    example: 4.0,
    required: false,
  })
  @IsDecimal()
  @Type(() => Number)
  @Min(0)
  @Max(4)
  @IsOptional()
  gradePoints?: number;

  @ApiProperty({
    description: 'Description of the grade',
    example: 'Excellent',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether this grade is considered passing',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPassing?: boolean;

  @ApiProperty({
    description: 'Whether this grade lookup is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 