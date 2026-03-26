import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { DigestFrequency } from '@prisma/client';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  scheduleChanges?: boolean;

  @IsOptional()
  @IsBoolean()
  gradeUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  attendanceAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  counselorMeetings?: boolean;

  @IsOptional()
  @IsBoolean()
  emergencyAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  generalAnnouncements?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  phoneCallEnabled?: boolean;

  @IsOptional()
  @IsEnum(DigestFrequency)
  digestFrequency?: DigestFrequency;
}
