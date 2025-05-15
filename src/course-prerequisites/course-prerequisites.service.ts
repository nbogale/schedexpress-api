import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoursePrerequisiteDto } from './dto/create-course-prerequisite.dto';
import { UpdateCoursePrerequisiteDto } from './dto/update-course-prerequisite.dto';

@Injectable()
export class CoursePrerequisitesService {
  constructor(private prisma: PrismaService) {}

  async create(createCoursePrerequisiteDto: CreateCoursePrerequisiteDto) {
    // Check if both courses exist
    const [course, prerequisiteCourse] = await Promise.all([
      this.prisma.course.findUnique({
        where: { id: createCoursePrerequisiteDto.courseId },
      }),
      this.prisma.course.findUnique({
        where: { id: createCoursePrerequisiteDto.prerequisiteCourseId },
      }),
    ]);

    if (!course || !prerequisiteCourse) {
      throw new BadRequestException('One or both courses do not exist');
    }

    // Check if prerequisite already exists
    const existingPrerequisite = await this.prisma.coursePrerequisite.findUnique({
      where: {
        courseId_prerequisiteCourseId: {
          courseId: createCoursePrerequisiteDto.courseId,
          prerequisiteCourseId: createCoursePrerequisiteDto.prerequisiteCourseId,
        },
      },
    });

    if (existingPrerequisite) {
      throw new BadRequestException('This prerequisite already exists');
    }

    return this.prisma.coursePrerequisite.create({
      data: createCoursePrerequisiteDto,
      include: {
        course: true,
        prerequisiteCourse: true,
      },
    });
  }

  async findAll() {
    return this.prisma.coursePrerequisite.findMany({
      include: {
        course: true,
        prerequisiteCourse: true,
      },
    });
  }

  async findOne(id: string) {
    const prerequisite = await this.prisma.coursePrerequisite.findUnique({
      where: { id },
      include: {
        course: true,
        prerequisiteCourse: true,
      },
    });

    if (!prerequisite) {
      throw new NotFoundException(`Course prerequisite with ID ${id} not found`);
    }

    return prerequisite;
  }

  async findByCourse(courseId: string) {
    return this.prisma.coursePrerequisite.findMany({
      where: { courseId },
      include: {
        course: true,
        prerequisiteCourse: true,
      },
    });
  }

  async update(id: string, updateCoursePrerequisiteDto: UpdateCoursePrerequisiteDto) {
    try {
      return await this.prisma.coursePrerequisite.update({
        where: { id },
        data: updateCoursePrerequisiteDto,
        include: {
          course: true,
          prerequisiteCourse: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Course prerequisite with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.coursePrerequisite.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Course prerequisite with ID ${id} not found`);
    }
  }
} 