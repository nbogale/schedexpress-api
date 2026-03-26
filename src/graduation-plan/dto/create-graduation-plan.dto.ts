import { IsString, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';

export class CreateGraduationPlanDto {
  @ApiProperty({ description: 'Student ID' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Graduation year (e.g., 2025)' })
  @IsNumber()
  graduationYear: number;

  @ApiPropertyOptional({ description: 'Plan name' })
  @IsOptional()
  @IsString()
  planName?: string;

  @ApiPropertyOptional({ enum: PlanType, description: 'Plan type', default: PlanType.STANDARD })
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
