import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsNumber, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkStudentData {
  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Student ID' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Grade level ID' })
  @IsString()
  gradeLevelId: string;

  @ApiProperty({ description: 'Graduation year', required: false })
  @IsOptional()
  @IsNumber()
  graduationYear?: number;

  @ApiProperty({ description: 'Username', required: false })
  @IsString()
  @IsOptional()
  username?: string;
}

export class CreateBulkStudentsDto {
  @ApiProperty({ description: 'Array of students to create', type: [BulkStudentData] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one student must be provided' })
  @ValidateNested({ each: true })
  @Type(() => BulkStudentData)
  students: BulkStudentData[];
}
