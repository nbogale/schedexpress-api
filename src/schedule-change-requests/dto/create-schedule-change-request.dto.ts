import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestPriority } from '../enums/request-enums';

export class CreateScheduleChangeRequestDto {
  @ApiProperty({
    example: 'clg101uvw',
    description: 'ID of the current course section',
  })
  @IsString()
  @IsNotEmpty()
  currentCourseSectionId: string;

  @ApiProperty({
    example: 'clg202xyz',
    description: 'ID of the requested course',
  })
  @IsString()
  @IsNotEmpty()
  requestedCourseId: string;

  @ApiProperty({
    example: 'clg303abc',
    description: 'ID of the preferred time block (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  preferredTimeBlockId?: string;

  @ApiProperty({
    example: 'I need to change this course to better align with my career goals.',
    description: 'Reason for the schedule change request',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: 'MEDIUM',
    description: 'Priority level of the request',
    enum: RequestPriority,
    default: RequestPriority.MEDIUM,
  })
  @IsEnum(RequestPriority)
  @IsOptional()
  priority?: RequestPriority;
}
