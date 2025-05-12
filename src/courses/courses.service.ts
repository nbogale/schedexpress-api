import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    // Check if course code already exists
    const existingCourse = await this.prisma.course.findUnique({
      where: { code: createCourseDto.code },
    });

    if (existingCourse) {
      throw new ConflictException(`Course with code ${createCourseDto.code} already exists`);
    }

    return this.prisma.course.create({
      data: {
        ...createCourseDto,
      },
    });
  }

  async findAll() {
    return this.prisma.course.findMany({
      orderBy: [
        //{ period: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      /* include: {
        schedules: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      }, */
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // If course code is being updated, check if it's unique
    if (updateCourseDto.code && updateCourseDto.code !== course.code) {
      const existingCourse = await this.prisma.course.findUnique({
        where: { code: updateCourseDto.code },
      });

      if (existingCourse) {
        throw new ConflictException(`Course with code ${updateCourseDto.code} already exists`);
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async remove(id: string) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id },
      /* include: {
        schedules: true,
        currentRequests: true,
        newRequests: true,
      }, */
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Check if course is associated with any schedules or requests
    //TODO: revisi this below conditions
   /*  if (course.schedules.length > 0) {
      throw new ConflictException('Cannot delete course that is in use by student schedules');
    }

    if (course.currentRequests.length > 0 || course.newRequests.length > 0) {
      throw new ConflictException('Cannot delete course that has pending change requests');
    } */

    return this.prisma.course.delete({
      where: { id },
    });
  }
}
