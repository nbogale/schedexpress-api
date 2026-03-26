import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestPriority } from '../enums/request-enums';

export enum RequestType {
  ADD_COURSE = 'ADD_COURSE',
  DROP_COURSE = 'DROP_COURSE',
  CHANGE_SECTION = 'CHANGE_SECTION'
}

export class CreateScheduleChangeRequestDto {
  @ApiProperty({
    example: 'CHANGE_SECTION',
    description: 'Type of schedule change request',
    enum: RequestType,
  })
  @IsEnum(RequestType)
  @IsNotEmpty()
  requestType: RequestType;

  @ApiProperty({
    example: 'clg101uvw',
    description: 'ID of the current course section (required for DROP_COURSE and CHANGE_SECTION)',
    required: false,
  })
  @IsString()
  @IsOptional()
  currentCourseSectionId?: string;

  @ApiProperty({
    example: 'clg202xyz',
    description: 'ID of the requested course section (required for ADD_COURSE and CHANGE_SECTION)',
    required: false,
  })
  @IsString()
  @IsOptional()
  requestedCourseSectionId?: string;

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
