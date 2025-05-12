import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestPriority, RequestStatus } from '@prisma/client';

export class CreateRequestDto {
  @ApiProperty({
    example: 'clg123xyz',
    description: 'ID of the student making the request',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    example: 'clg456abc',
    description: 'ID of the school year',
  })
  @IsString()
  @IsNotEmpty()
  schoolYearId: string;

  @ApiProperty({
    example: 'clg789def',
    description: 'ID of the term',
  })
  @IsString()
  @IsNotEmpty()
  termId: string;

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

  @ApiProperty({
    example: 'PENDING',
    description: 'Status of the request',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;
}
