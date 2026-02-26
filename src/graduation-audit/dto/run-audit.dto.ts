import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RunAuditDto {
  @ApiProperty({ description: 'Student ID' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Graduation year (e.g., 2025)' })
  @IsNumber()
  @Min(2000)
  graduationYear: number;

  @ApiPropertyOptional({ description: 'Academic cycle ID (optional, for cycle-specific audit)' })
  @IsOptional()
  @IsString()
  academicCycleId?: string;
}
