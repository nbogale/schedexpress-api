import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../enums/request-enums';

export class ProcessChangeRequestDto {
  @ApiProperty({
    example: 'APPROVED',
    description: 'New status for the request',
    enum: RequestStatus,
  })
  @IsEnum(RequestStatus)
  @IsNotEmpty()
  status: RequestStatus;

  @ApiProperty({
    example: 'clg101uvw',
    description: 'ID of the new course section to be added',
    required: false,
  })
  @IsString()
  @IsOptional()
  newCourseSectionId?: string;

  @ApiProperty({
    example: 'Request approved after reviewing student\'s academic record.',
    description: 'Notes about the resolution of the request',
    required: false,
  })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
