import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransferType } from '@prisma/client';

export class CreateTransferGradeDto {
  @ApiProperty()
  @IsString()
  sourceSchool: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceSchoolType?: string;

  @ApiProperty()
  @IsString()
  academicYear: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicPeriod?: string;

  @ApiProperty()
  @IsString()
  originalCourseName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  originalCourseCode?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(10)
  originalCredits: number;

  @ApiProperty()
  @IsString()
  originalGrade: string;

  @ApiProperty()
  @IsString()
  originalGradeSystem: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  convertedGrade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  convertedGradePoints?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mappedCourseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TransferType)
  transferType?: TransferType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transcriptUploadId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
