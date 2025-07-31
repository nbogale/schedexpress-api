import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'The name of the department',
    example: 'Computer Science',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;
} 