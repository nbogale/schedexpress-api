import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseLevelDto {
  @ApiProperty({
    example: 'Undergraduate',
    description: 'The name of the course level',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Courses for undergraduate students',
    description: 'Description of the course level',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'The rank/order of the course level',
  })
  @IsInt()
  @Min(1)
  rank: number;
} 