import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateRecommendationsDto {
  @ApiProperty({ description: 'Student ID' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Academic Cycle ID' })
  @IsString()
  @IsNotEmpty()
  academicCycleId: string;

  @ApiProperty({ description: 'User ID who generated the recommendations', required: false })
  @IsString()
  @IsOptional()
  generatedBy?: string;
}
