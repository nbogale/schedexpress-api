import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';

@Injectable()
export class TimeBlocksService {
  constructor(private prisma: PrismaService) {}

  async create(createTimeBlockDto: CreateTimeBlockDto) {
    return this.prisma.timeBlock.create({
      data: createTimeBlockDto,
    });
  }

  async findAll() {
    return this.prisma.timeBlock.findMany({
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const timeBlock = await this.prisma.timeBlock.findUnique({
      where: { id },
    });

    if (!timeBlock) {
      throw new NotFoundException(`Time block with ID ${id} not found`);
    }

    return timeBlock;
  }

  async update(id: string, updateTimeBlockDto: UpdateTimeBlockDto) {
    try {
      return await this.prisma.timeBlock.update({
        where: { id },
        data: updateTimeBlockDto,
      });
    } catch (error) {
      throw new NotFoundException(`Time block with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.timeBlock.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Time block with ID ${id} not found`);
    }
  }

  async toggleStatus(id: string, isActive: boolean) {
    try {
      return await this.prisma.timeBlock.update({
        where: { id },
        data: { isActive },
      });
    } catch (error) {
      throw new NotFoundException(`Time block with ID ${id} not found`);
    }
  }
} 