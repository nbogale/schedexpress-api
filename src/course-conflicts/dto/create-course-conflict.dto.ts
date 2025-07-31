import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConflictType } from '@prisma/client';

export class CreateCourseConflictDto {
  @ApiProperty({
    example: 'clg123xyz',
    description: 'ID of the first course section',
  })
  @IsString()
  @IsNotEmpty()
  courseSectionId1: string;

  @ApiProperty({
    example: 'clg456abc',
    description: 'ID of the second course section',
  })
  @IsString()
  @IsNotEmpty()
  courseSectionId2: string;

  @ApiProperty({
    example: 'TIME_OVERLAP',
    description: 'Type of conflict',
    enum: ConflictType,
  })
  @IsEnum(ConflictType)
  @IsNotEmpty()
  conflictType: ConflictType;

  @ApiProperty({
    example: true,
    description: 'Whether the conflict can be resolved',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isResolvable?: boolean;

  @ApiProperty({
    example: 'Students can choose either section',
    description: 'Notes about how to resolve the conflict',
    required: false,
  })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
