import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGradeLevelDto {
  @ApiProperty({
    example: 'Grade 9',
    description: 'The name of the grade level',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Ninth grade level',
    description: 'Description of the grade level',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 9,
    description: 'The numeric level of the grade',
  })
  @IsInt()
  @Min(1)
  level: number;
} 