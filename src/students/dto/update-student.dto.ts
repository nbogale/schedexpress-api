import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateStudentDto {
  @ApiProperty({
    description: 'Student name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Student grade level (9-12)',
    example: 10,
    required: false,
  })
  @IsNumber()
  @Min(9)
  @Max(12)
  @IsOptional()
  gradeLevel?: number;
}
