import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponse } from 'src/common/api-error';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);
  constructor(private prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    return await this.prisma.$transaction(async (prisma) => {
      // check if the teacher already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: createTeacherDto.email },
      });

      if (existingUser) {
        const errorResponse: ApiErrorResponse = {
          errorCode: 'STUA',
          errorMessage: 'Email address already in use',
          timestamp: new Date().toISOString(),
        };
        throw new BadRequestException(errorResponse);
      }

      // check if the teacher already exists
      const existingTeacher = await prisma.teacher.findUnique({
        where: { email: createTeacherDto.email },
      });

      if (existingTeacher) {
        const errorResponse: ApiErrorResponse = {
          errorCode: 'TCHB',
          errorMessage: 'Email address already in use by another teacher',
          timestamp: new Date().toISOString(),
        };
        throw new BadRequestException(errorResponse);
      }

      // generate username from email if username is not provided
      const username = this.generateUsername(createTeacherDto.email);

      //Generate random temporary password
      const temporaryPassword = Math.random().toString(36).substring(2, 8);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email: createTeacherDto.email,
          firstName: createTeacherDto.firstName,
          lastName: createTeacherDto.lastName,
          username: username,
          role: UserRole.TEACHER,
          passwordHash: await bcrypt.hash(temporaryPassword, 10),
        },
      });

      return prisma.teacher.create({
        data: {
          name: createTeacherDto.firstName + ' ' + createTeacherDto.lastName,
          email: createTeacherDto.email,
          departmentId: createTeacherDto.departmentId,
          maxCourses: createTeacherDto.maxCourses,
          userId: user.id,
        },
        include: {
          department: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
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
        academicCycle: true,
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

  private generateUsername(email: string): string {
    // Extract username from email (before @)
    const username = email.split('@')[0];
    // Remove special characters and convert to lowercase
    return username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }
} 