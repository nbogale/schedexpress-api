import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoursePrerequisiteDto {
  @ApiProperty({
    description: 'The ID of the course that requires the prerequisite',
    example: 'clg123xyz',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'The ID of the course that is a prerequisite',
    example: 'clg456abc',
  })
  @IsString()
  @IsNotEmpty()
  prerequisiteCourseId: string;
} 