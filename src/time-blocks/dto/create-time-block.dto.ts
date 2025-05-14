import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, MinLength } from 'class-validator';

export class CreateTimeBlockDto {
  @ApiProperty({
    description: 'The name of the time block (e.g., "Period 1", "Morning Session")',
    example: 'Period 1',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'The start time of the time block',
    example: '2024-01-01T08:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    description: 'The end time of the time block',
    example: '2024-01-01T08:50:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: Date;
} 