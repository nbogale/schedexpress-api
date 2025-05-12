import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestPriority, RequestStatus } from '@prisma/client';

export class UpdateRequestDto {
  @ApiProperty({
    example: 'clg123xyz',
    description: 'ID of the school year',
    required: false,
  })
  @IsString()
  @IsOptional()
  schoolYearId?: string;

  @ApiProperty({
    example: 'clg456abc',
    description: 'ID of the term',
    required: false,
  })
  @IsString()
  @IsOptional()
  termId?: string;

  @ApiProperty({
    example: 'clg789def',
    description: 'ID of the current course section',
    required: false,
  })
  @IsString()
  @IsOptional()
  currentCourseSectionId?: string;

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

  @ApiProperty({
    example: 'PENDING',
    description: 'Status of the request',
    enum: RequestStatus,
    required: false,
  })
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;

  @ApiProperty({
    example: 'clg303abc',
    description: 'ID of the user reviewing the request',
    required: false,
  })
  @IsString()
  @IsOptional()
  reviewedById?: string;

  @ApiProperty({
    example: 'Request approved after reviewing student\'s academic record.',
    description: 'Notes about the resolution of the request',
    required: false,
  })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
