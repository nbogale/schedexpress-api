import { IsNotEmpty, IsOptional, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCoursePreferenceDto {
  @ApiProperty({
    example: 'clg101uvw',
    description: 'ID of the course to assign to the student',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    example: 'clg202xyz',
    description: 'ID of the academic cycle (future academic year)',
  })
  @IsString()
  @IsNotEmpty()
  academicCycleId: string;

  @ApiProperty({
    example: 1,
    description: 'Priority ranking (1st choice, 2nd choice, 3rd choice, etc.). If not provided, will be auto-assigned as the next available priority.',
    required: false,
    minimum: 1,
    maximum: 20,
  })
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  priority?: number;

  @ApiProperty({
    example: 'Required course for grade level',
    description: 'Optional reason for the course assignment',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    example: true,
    description: 'Whether to auto-approve this preference. Defaults to true for counselor assignments.',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  autoApprove?: boolean;
}

