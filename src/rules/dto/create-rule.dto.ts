import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum RuleType {
  SCHEDULE_OVERLAP = 'SCHEDULE_OVERLAP',
  PREREQUISITE = 'PREREQUISITE',
  GRADE_REQUIREMENT = 'GRADE_REQUIREMENT',
  CAPACITY = 'CAPACITY',
  OTHER = 'OTHER',
}

export class CreateRuleDto {
  @ApiProperty({
    description: 'The name of the rule',
    example: 'Maximum Course Load',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The type of rule',
    enum: RuleType,
    example: RuleType.OTHER,
  })
  @IsEnum(RuleType)
  type: RuleType;

  @ApiProperty({
    description: 'Description of the rule',
    example: 'Students cannot take more than 7 courses per semester',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Whether the rule is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  isActive: boolean = true;
}
