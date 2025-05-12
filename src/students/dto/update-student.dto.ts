import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStudentDto {
  @ApiProperty({
    description: 'Student ID number',
    example: 'S100001',
    required: false,
  })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({
    description: 'Grade level ID',
    example: 'clg123xyz',
    required: false,
  })
  @IsString()
  @IsOptional()
  gradeLevelId?: string;

  @ApiProperty({
    description: 'Expected graduation year',
    example: 2025,
    required: false,
  })
  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsOptional()
  graduationYear?: number;

  @ApiProperty({
    description: 'Whether the student has an Individualized Education Program',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  hasIep?: boolean;

  @ApiProperty({
    description: 'Whether the student is enrolled in dual enrollment programs',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDualEnrollment?: boolean;

  @ApiProperty({
    description: 'Whether the student is college-bound',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCollegeBound?: boolean;

  @ApiProperty({
    description: 'Whether the student is in credit recovery',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCreditRecovery?: boolean;

  @ApiProperty({
    description: 'Maximum credits allowed per term',
    example: 8.0,
    required: false,
  })
  @IsDecimal()
  @Type(() => Number)
  @IsOptional()
  maxCreditsPerTerm?: number;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    required: false,
  })  
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({  
    description: 'Last name',
    example: 'Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}
