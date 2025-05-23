import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RuleType } from '../enums/course-rule-enums';


export class CreateCourseRuleDto {
  @ApiProperty({
    description: 'The ID of the primary course',
    example: 'course-123',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'The ID of the conflicting course',
    example: 'course-456',
  })
  @IsString()
  @IsNotEmpty()
  conflictingCourseId: string;

  @ApiProperty({
    description: 'The type of rule',
    enum: RuleType,
    example: RuleType.PREREQUISITE,
  })
  @IsEnum(RuleType)
  type: RuleType;

  @ApiProperty({
    description: 'Description of the rule',
    example: 'Algebra 1 is a prerequisite for Algebra 2',
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

  @ApiProperty({
    description: 'Whether the rule is overridable',
    example: false,
    default: false,
  })
  @IsBoolean()
  isOverridable: boolean = false;
  
}
