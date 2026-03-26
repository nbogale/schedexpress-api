import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class UploadScheduleImportDto {
  @ApiProperty({
    description: 'Academic cycle name',
    example: '2024-2025 School Year',
  })
  @IsString()
  @IsNotEmpty()
  academicCycleName: string;

  @ApiProperty({
    description: 'Whether to override existing schedule data for this academic cycle',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  overrideExisting?: boolean = false;
}

