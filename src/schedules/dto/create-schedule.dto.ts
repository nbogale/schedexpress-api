import { IsArray, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({
    example: 'clg123xyz',
    description: 'ID of the student',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    example: 'Fall',
    description: 'Semester name',
  })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({
    example: 2024,
    description: 'Academic year',
  })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({
    example: ['clg456abc', 'clg789def'],
    description: 'Array of course section IDs to connect to the schedule',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  courseSectionIds: string[];
}
