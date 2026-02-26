import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditNoteDto {
  @ApiProperty({ description: 'Note content' })
  @IsString()
  note: string;

  @ApiPropertyOptional({ description: 'Is this an action item?', default: false })
  @IsOptional()
  @IsBoolean()
  isActionItem?: boolean;
}
