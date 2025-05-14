import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateSchoolYearDto {
  @ApiProperty({
    description: 'The name of the school year (e.g., "2024-2025")',
    example: '2024-2025',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'The start date of the school year',
    example: '2024-08-14T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the school year',
    example: '2025-06-09T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({
    description: 'Whether this is the current school year',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
} 