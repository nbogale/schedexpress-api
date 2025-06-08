import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    // Check if course code already exists
    const existingCourse = await this.prisma.course.findUnique({
      where: { code: createCourseDto.code },
    });

    const {prerequisiteIds, ...partialCourseDto} = createCourseDto;
    
    console.log('existingCourse - ', JSON.stringify(existingCourse));

    if (existingCourse) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRSC,
        `Course with code ${createCourseDto.code} already exists`
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    const course = await this.prisma.course.create({
      data: {
        ...partialCourseDto,
      },
    });

    //add new prerequisites or update existing ones
    if (prerequisiteIds && prerequisiteIds.length > 0) {
      await this.prisma.coursePrerequisite.deleteMany({
        where: { courseId: course.id },
      });

      await this.prisma.coursePrerequisite.createMany({
        data: prerequisiteIds.map(prerequisite => ({
          courseId: course.id,
          prerequisiteCourseId: prerequisite,
        })),
      });
    }   

    return course;
  }

  async findAll(options?: any) {
    return this.prisma.course.findMany({
      where: options,
      include: {
        department: true,
        courseLevel: true,
        minGradeLevel: true,
      },
      orderBy: [
        //{ period: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
        courseLevel: true,
        minGradeLevel: true,
        prerequisites: {
          include: {
            prerequisiteCourse: true,
          },
        },
        //schedules: true,
        //changeRequests: true,
      },
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
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRSN,
        `Course with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRSN,
        `Course with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // If course code is being updated, check if it's unique
    if (updateCourseDto.code && updateCourseDto.code !== course.code) {
      const existingCourse = await this.prisma.course.findUnique({
        where: { code: updateCourseDto.code },
      });

      if (existingCourse) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.CRSC,
          `Course with code ${updateCourseDto.code} already exists`
        )
          .withLogger(this.logger)
          .build();
        throw new ConflictException(errorResponse);
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async remove(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRSN,
        `Course with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Check if course is in use
    const scheduleCount = await this.prisma.schedule.count({
      where: {
        scheduleCourseSections: {
          some: {
            courseSection: {
              courseId: id
            }
          }
        }
      }
    });

    if (scheduleCount > 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRSD,
        'Cannot delete course that is in use by student schedules'
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    const changeRequestCount = await this.prisma.scheduleChangeRequest.count({
      where: {
        requestedCourseSection: {
          courseId: id
        }
      }
    });

    if (changeRequestCount > 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRSE,
        'Cannot delete course that has pending change requests'
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }

  async getPrerequisites(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        prerequisites: {
          include: {
            prerequisiteCourse: true,
          },
        },
      },
    });
  }
}
