import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min, Max } from 'class-validator';

export enum BulkAuditScope {
  /** Run audit only for students whose profile graduationYear matches the given year (Class of X) */
  COHORT = 'COHORT',
  /** Run audit for all students in the school */
  ALL = 'ALL',
}

export class StartBulkAuditDto {
  @ApiProperty({ description: 'Graduation year for the audit (e.g. 2026)', example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  graduationYear: number;

  @ApiProperty({
    description: 'Which students to include: COHORT = Class of graduation year only, ALL = all students',
    enum: BulkAuditScope,
  })
  @IsEnum(BulkAuditScope)
  scope: BulkAuditScope;
}
