import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubstituteCourseDto {
  @ApiProperty({ description: 'Old course ID to replace' })
  @IsString()
  oldCourseId: string;

  @ApiProperty({ description: 'New course ID to use instead' })
  @IsString()
  newCourseId: string;
}
