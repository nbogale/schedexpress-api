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
    example: 'clg123xyz',
    description: 'ID of the school year',
  })
  @IsString()
  @IsNotEmpty()
  schoolYearId: string;

  @ApiProperty({
    example: 'clg123xyz',
    description: 'ID of the term',
  })
  @IsString()
  @IsNotEmpty()
  termId: string;

  @ApiProperty({
    example: ['clg456abc', 'clg789def'],
    description: 'Array of course section IDs to connect to the schedule',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  courseSectionIds: string[];
}
