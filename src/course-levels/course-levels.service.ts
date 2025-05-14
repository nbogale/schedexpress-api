import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseLevelDto } from './dto/create-course-level.dto';
import { UpdateCourseLevelDto } from './dto/update-course-level.dto';

@Injectable()
export class CourseLevelsService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseLevelDto: CreateCourseLevelDto) {
    return this.prisma.courseLevel.create({
      data: createCourseLevelDto,
    });
  }

  async findAll() {
    return this.prisma.courseLevel.findMany({
      orderBy: {
        rank: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const courseLevel = await this.prisma.courseLevel.findUnique({
      where: { id },
    });

    if (!courseLevel) {
      throw new NotFoundException(`Course level with ID ${id} not found`);
    }

    return courseLevel;
  }

  async update(id: string, updateCourseLevelDto: UpdateCourseLevelDto) {
    try {
      return await this.prisma.courseLevel.update({
        where: { id },
        data: updateCourseLevelDto,
      });
    } catch (error) {
      throw new NotFoundException(`Course level with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.courseLevel.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Course level with ID ${id} not found`);
    }
  }
} 