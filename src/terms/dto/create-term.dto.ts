import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateTermDto {
  @ApiProperty({
    description: 'The ID of the school year this term belongs to',
    example: 'clg123xyz',
  })
  @IsString()
  @IsNotEmpty()
  schoolYearId: string;

  @ApiProperty({
    description: 'The name of the term (e.g., "Fall Semester 2024")',
    example: 'Fall Semester 2024',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'The start date of the term',
    example: '2024-08-14T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the term',
    example: '2024-12-19T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({
    description: 'Whether this is the current term',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
} 