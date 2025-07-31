import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestPriority } from '../enums/request-enums';

export class UpdateScheduleChangeRequestDto {
  @ApiProperty({
    example: 'clg101uvw',
    description: 'ID of the requested course',
    required: false,
  })
  @IsString()
  @IsOptional()
  requestedCourseId?: string;

  @ApiProperty({
    example: 'clg202xyz',
    description: 'ID of the preferred time block',
    required: false,
  })
  @IsString()
  @IsOptional()
  preferredTimeBlockId?: string;

  @ApiProperty({
    example: 'I need to change this course to better align with my career goals.',
    description: 'Reason for the schedule change request',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    example: 'MEDIUM',
    description: 'Priority level of the request',
    enum: RequestPriority,
    required: false,
  })
  @IsEnum(RequestPriority)
  @IsOptional()
  priority?: RequestPriority;
}
