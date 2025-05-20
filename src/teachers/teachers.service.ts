import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    return this.prisma.teacher.create({
      data: createTeacherDto,
      include: {
        department: true,
        sections: {
          include: {
            course: true,
            timeBlock: true,
            room: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        department: true,
        sections: {
          include: {
            course: true,
            timeBlock: true,
            room: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        department: true,
          sections: {
          include: {
            course: true,
            timeBlock: true,
            room: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    try {
      return await this.prisma.teacher.update({
        where: { id },
        data: updateTeacherDto,
        include: {
          department: true,
            sections: {
            include: {
              course: true,
              timeBlock: true,
              room: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.teacher.delete({
        where: { id },
        include: {
          department: true,
          sections: {
            include: {
              course: true,
              timeBlock: true,
              room: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }
      throw error;
    }
  }
} 