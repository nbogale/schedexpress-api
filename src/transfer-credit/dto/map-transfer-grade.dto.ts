import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MapTransferGradeDto {
  @ApiProperty()
  @IsString()
  mappedCourseId: string;
}
