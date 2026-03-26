import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AllocateCourseDto {
  @ApiProperty({ description: 'Course history ID' })
  @IsString()
  courseHistoryId: string;

  @ApiProperty({ description: 'Requirement ID' })
  @IsString()
  requirementId: string;

  @ApiProperty({ description: 'Audit ID' })
  @IsString()
  auditId: string;

  @ApiProperty({ description: 'Credits to allocate' })
  @IsNumber()
  @Min(0)
  credits: number;

  @ApiPropertyOptional({ description: 'Allocation reason' })
  @IsOptional()
  @IsString()
  allocationReason?: string;
}
