import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WaiveRequirementDto {
  @ApiProperty({ description: 'Reason for waiving the requirement' })
  @IsString()
  reason: string;
}
