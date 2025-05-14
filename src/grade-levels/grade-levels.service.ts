import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { UpdateGradeLevelDto } from './dto/update-grade-level.dto';

@Injectable()
export class GradeLevelsService {
  constructor(private prisma: PrismaService) {}

  async create(createGradeLevelDto: CreateGradeLevelDto) {
    return this.prisma.gradeLevel.create({
      data: createGradeLevelDto,
    });
  }

  async findAll() {
    return this.prisma.gradeLevel.findMany({
      orderBy: {
        level: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const gradeLevel = await this.prisma.gradeLevel.findUnique({
      where: { id },
    });

    if (!gradeLevel) {
      throw new NotFoundException(`Grade level with ID ${id} not found`);
    }

    return gradeLevel;
  }

  async update(id: string, updateGradeLevelDto: UpdateGradeLevelDto) {
    try {
      return await this.prisma.gradeLevel.update({
        where: { id },
        data: updateGradeLevelDto,
      });
    } catch (error) {
      throw new NotFoundException(`Grade level with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.gradeLevel.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Grade level with ID ${id} not found`);
    }
  }
} 