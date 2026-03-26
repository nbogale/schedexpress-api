import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectRecommendationDto {
  @ApiProperty({ 
    description: 'Optional reason for rejecting the recommendation', 
    required: false 
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
