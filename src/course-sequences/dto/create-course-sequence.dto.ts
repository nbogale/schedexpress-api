import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseSequenceDto {
  @ApiProperty({
    description: 'The ID of the department',
    example: 'dept123xyz',
  })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    description: 'The ID of the course',
    example: 'course456abc',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'The order of the course in the sequence',
    example: 1,
  })
  @IsInt()
  @Min(1)
  sequenceOrder: number;
} 