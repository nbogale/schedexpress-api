import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({
    example: 'student-id-123',
    description: 'Student ID',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    example: 'course-id-1',
    description: 'Current course ID to change from',
  })
  @IsString()
  @IsNotEmpty()
  currentCourseId: string;

  @ApiProperty({
    example: 'course-id-2',
    description: 'New course ID to change to',
  })
  @IsString()
  @IsNotEmpty()
  newCourseId: string;

  @ApiProperty({
    example: 'I need to change this course to better align with my career goals.',
    description: 'Reason for the schedule change request',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
