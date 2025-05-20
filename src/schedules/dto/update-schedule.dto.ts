import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @ApiProperty({
    example: ['course-section-id-1', 'course-section-id-2'],
    description: 'Array of course section IDs to add to the schedule',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  addCourseIds?: string[];

  @ApiProperty({
    example: ['course-section-id-3', 'course-section-id-4'],
    description: 'Array of course section IDs to remove from the schedule',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  removeCourseIds?: string[];
}
