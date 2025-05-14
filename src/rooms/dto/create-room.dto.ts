import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    example: 'Room 101',
    description: 'Name of the room',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 30,
    description: 'Maximum capacity of the room',
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({
    example: true,
    description: 'Whether the room is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 