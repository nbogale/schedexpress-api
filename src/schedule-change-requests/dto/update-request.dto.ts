import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';

export class UpdateRequestDto {
  @ApiProperty({
    enum: RequestStatus,
    example: 'APPROVED',
    description: 'Status of the request',
    required: false,
  })
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;

  @ApiProperty({
    example: 'counselor-id-123',
    description: 'Counselor ID who is handling the request',
    required: false,
  })
  @IsString()
  @IsOptional()
  counselorId?: string;

  @ApiProperty({
    example: 'Approved due to academic needs.',
    description: 'Comments on the request',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  comments?: string;
}
