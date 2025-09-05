import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum ParentRole {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  EMERGENCY = 'emergency'
}

export class AssignParentToStudentDto {
  @IsString()
  studentId: string;

  @IsString()
  parentGuardianId: string;

  @IsEnum(ParentRole)
  role: ParentRole;

  @IsOptional()
  @IsBoolean()
  canReceiveNotifications?: boolean;
}
