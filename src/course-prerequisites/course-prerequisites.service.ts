import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoursePrerequisiteDto } from './dto/create-course-prerequisite.dto';
import { UpdateCoursePrerequisiteDto } from './dto/update-course-prerequisite.dto';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class CoursePrerequisitesService {
  private readonly logger = new Logger(CoursePrerequisitesService.name);

  constructor(private readonly prisma: PrismaService) {}

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
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CPAA,
        'One or both courses do not exist'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
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
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CPAB,
        'This prerequisite already exists'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
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
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CPAA,
        `Course prerequisite with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
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
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CPAA,
        `Course prerequisite with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.coursePrerequisite.delete({
        where: { id },
      });
    } catch (error) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CPAA,
        `Course prerequisite with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }
  }
} 