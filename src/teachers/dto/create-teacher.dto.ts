import { IsString, IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  name: string;

  @IsString()
  userId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  departmentId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxCourses?: number;
} 