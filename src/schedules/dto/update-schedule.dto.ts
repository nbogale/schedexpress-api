import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @ApiProperty({
    example: ['course-id-1', 'course-id-2'],
    description: 'Array of course IDs to add to the schedule',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  addCourseIds?: string[];

  @ApiProperty({
    example: ['course-id-3', 'course-id-4'],
    description: 'Array of course IDs to remove from the schedule',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  removeCourseIds?: string[];
}
