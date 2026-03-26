import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApprovePlanDto {
  @ApiPropertyOptional({ 
    description: 'Optional note when approving the plan (e.g., reviewed with student/parent)',
    example: 'Reviewed with student and parent. Plan meets all graduation requirements.'
  })
  @IsOptional()
  @IsString()
  note?: string;
}
