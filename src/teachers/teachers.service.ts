import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';
import { ErrorCode } from 'src/common/error-codes';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);
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

    // check if the teacher is used in course sections
    const courseSections = await this.prisma.courseSection.findMany({
      where: { teacherId: id },
    });
    if (courseSections.length > 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.TCHD,
        'Teacher is used in course sections'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }
    try {
      return await this.prisma.teacher.delete({
        where: { id },
        /* include: {
          department: true,
          sections: {
            include: {
              course: true,
              timeBlock: true,
              room: true,
            },
          },
        }, */
      });
    } catch (error) {
     // if (error.code === 'P2025') {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.TCHB,
          `Teacher with ID ${id} not found`
        )
          .withLogger(this.logger)
          .build();
        throw new NotFoundException(errorResponse);
     // }
   //   throw error;
    }
  }

  async getCoursesByTeacher(teacherId: string) {
    return this.prisma.courseSection.findMany({
      where: { teacherId },
      include: {
        course: true,
        timeBlock: true,
        room: true,
      },
    });
  }

  async getStudentsPerCourse(teacherId: string) {
    // Get all course sections for this teacher, including enrolled students via scheduleCourseSections
    return this.prisma.courseSection.findMany({
      where: { teacherId },
      include: {
        course: true,
        scheduleCourseSections: {
          include: {
            schedule: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getStudentsForCourseSection(teacherId: string, courseSectionId: string) {
    // Ensure the course section belongs to the teacher
    const section = await this.prisma.courseSection.findFirst({
      where: { id: courseSectionId, teacherId },
    });
    if (!section) {
      throw new Error('Course section not found for this teacher');
    }
    // Get students for this course section
    return this.prisma.scheduleCourseSection.findMany({
      where: { courseSectionId },
      include: {
        schedule: {
          include: {
            student: {
              include: {
                user: true,
                gradeLevel: true,
              },
            },
          },
        },
      },
    });
  }

  async getByUserId(userId: string) {
    return this.prisma.teacher.findUnique({
      where: { userId },
      include: { 
        department: true,
      }
    });
  }
} 