import { IsString, IsEmail, IsOptional, IsInt, Min, Max, IsArray, IsEnum } from 'class-validator';
import { TeacherStatus } from '@prisma/client';

export class CreateTeacherDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  departmentId: string;

  @IsString()
  roomId: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxCourses?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  courseIds?: string[];

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(TeacherStatus)
  @IsOptional()
  status?: TeacherStatus;
} 