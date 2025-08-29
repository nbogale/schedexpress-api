import { IsString, IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  departmentId: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxCourses?: number;

  @IsString()
  @IsOptional()
  userId?: string;


  @IsString()
  @IsOptional()
  password?: string;

} 