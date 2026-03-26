import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GrantExceptionDto {
  @ApiProperty({ description: 'Reason for granting exception' })
  @IsString()
  exceptionReason: string;

  @ApiPropertyOptional({ description: 'Credit amount to grant (if different from original)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  creditAmount?: number;

  @ApiPropertyOptional({ description: 'Department ID for subject area if no direct course equivalent' })
  @IsOptional()
  @IsString()
  departmentId?: string;
}
