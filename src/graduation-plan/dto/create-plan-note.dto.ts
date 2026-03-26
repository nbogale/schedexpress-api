import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanNoteDto {
  @ApiProperty({ description: 'Note content' })
  @IsString()
  note: string;

  @ApiPropertyOptional({ description: 'Is action item', default: false })
  @IsOptional()
  @IsBoolean()
  isActionItem?: boolean;

  @ApiPropertyOptional({ description: 'Link to specific plan version' })
  @IsOptional()
  planVersion?: number;
}
