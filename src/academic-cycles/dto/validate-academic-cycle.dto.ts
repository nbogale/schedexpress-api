import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateAcademicCycleDto {
  @ApiProperty({ description: 'Academic cycle ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({ description: 'Validation notes' })
  @IsOptional()
  @IsString()
  validationNotes?: string;
}
