import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecommendationStatus } from '../recommendation.constants';

const STATUS_VALUES = Object.values(RecommendationStatus);

export class GetRecommendationsDto {
  @ApiProperty({ description: 'Academic Cycle ID', required: false })
  @IsString()
  @IsOptional()
  academicCycleId?: string;

  @ApiProperty({
    description: 'Filter by recommendation status',
    enum: STATUS_VALUES,
    required: false,
  })
  @IsIn(STATUS_VALUES)
  @IsOptional()
  status?: (typeof RecommendationStatus)[keyof typeof RecommendationStatus];
}
