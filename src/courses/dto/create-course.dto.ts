import { IsInt, IsNotEmpty, IsPositive, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Algebra II',
    description: 'Course name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'MATH201',
    description: 'Unique course code',
  })
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @ApiProperty({
    example: 'Mr. Johnson',
    description: 'Teacher name',
  })
  @IsString()
  @IsNotEmpty()
  teacher: string;

  @ApiProperty({
    example: 3,
    description: 'Period number (1-8)',
  })
  @IsInt()
  @Min(1)
  @Max(8)
  period: number;

  @ApiProperty({
    example: 'Room 304',
    description: 'Classroom',
  })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({
    example: 30,
    description: 'Maximum number of students',
  })
  @IsInt()
  @IsPositive()
  capacity: number;
}
