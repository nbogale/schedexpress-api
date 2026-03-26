import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'The name of the department',
    example: 'Computer Science',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The unique code for the department',
    example: 'CS',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  code: string;

  @ApiProperty({
    description: 'The description of the department',
    example: 'Department focused on computer science and programming',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
} 