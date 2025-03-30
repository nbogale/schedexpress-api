import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RuleType } from './create-course-rule.dto';

export class UpdateCourseRuleDto {
  @ApiProperty({
    description: 'The ID of the primary course',
    example: 'course-123',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  courseId?: string;

  @ApiProperty({
    description: 'The ID of the conflicting course',
    example: 'course-456',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  conflictingCourseId?: string;

  @ApiProperty({
    description: 'The type of rule',
    enum: RuleType,
    example: RuleType.PREREQUISITE,
    required: false,
  })
  @IsEnum(RuleType)
  @IsOptional()
  type?: RuleType;

  @ApiProperty({
    description: 'Description of the rule',
    example: 'Algebra 1 is a prerequisite for Algebra 2',
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
