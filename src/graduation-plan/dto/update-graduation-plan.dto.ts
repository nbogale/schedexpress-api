import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';

export class UpdateGraduationPlanDto {
  @ApiPropertyOptional({ description: 'Plan name' })
  @IsOptional()
  @IsString()
  planName?: string;

  @ApiPropertyOptional({ enum: PlanType, description: 'Plan type' })
  @IsOptional()
  @IsEnum(PlanType)
  planType?: PlanType;

  @ApiPropertyOptional({ description: 'Plan notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Student goals (JSON object)' })
  @IsOptional()
  @IsObject()
  goals?: any;
}
