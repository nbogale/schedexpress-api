import { IsArray, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({
    example: 'student-id-123',
    description: 'Student ID',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    example: 'Fall',
    description: 'Semester',
  })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({
    example: 2025,
    description: 'Academic year',
  })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({
    example: ['course-id-1', 'course-id-2'],
    description: 'Array of course IDs',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  courseIds: string[];
}
