import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptRecommendationDto {
  @ApiProperty({ 
    description: 'Optional note when accepting the recommendation', 
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;
}
