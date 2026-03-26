import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { RelationshipType, ContactMethod } from '@prisma/client';

export class CreateParentGuardianDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @IsEnum(RelationshipType)
  relationship: RelationshipType;

  @IsOptional()
  @IsBoolean()
  isPrimaryContact?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmergencyContact?: boolean;

  @IsOptional()
  @IsEnum(ContactMethod)
  preferredContactMethod?: ContactMethod;
}
