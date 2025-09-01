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

  @ApiProperty({
    example: 'classroom',
    description: 'Type of the room',
  })
  @IsString()
  roomType: string;
  
  @ApiProperty({
    example: 'Room 101',
    description: 'Description of the room',
  })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({
    example: 'Room 101',
    description: 'Location of the room',
  })
  @IsString()
  @IsOptional()
  location?: string;
} 