import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RuleType } from './create-rule.dto';

export class UpdateRuleDto {
  @ApiProperty({
    description: 'The name of the rule',
    example: 'Maximum Course Load',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The type of rule',
    enum: RuleType,
    example: RuleType.OTHER,
    required: false,
  })
  @IsEnum(RuleType)
  @IsOptional()
  type?: RuleType;

  @ApiProperty({
    description: 'Description of the rule',
    example: 'Students cannot take more than 7 courses per semester',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether the rule is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
