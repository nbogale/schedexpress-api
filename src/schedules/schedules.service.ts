import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { studentId, courseSectionIds, ...scheduleData } = createScheduleDto;

    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { schedule: true },
    });

    if (!student) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHN,
        `Student with ID ${studentId} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Check if student already has a schedule
    if (student.schedule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHC,
        `Student already has a schedule`
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    // Validate courses
    if (courseSectionIds.length === 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHB,
        'Schedule must include at least one course'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }

    // Check if all courses exist
    const courseSections = await this.prisma.courseSection.findMany({
      where: { id: { in: courseSectionIds } },
      include: { course: true },
    });

    if (courseSections.length !== courseSectionIds.length) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHN,
        'One or more courses not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Check capacity for each course
    const overCapacityCourses = courseSections.filter(
      course => course.currentEnrollment >= course.maxEnrollment
    );

    if (overCapacityCourses.length > 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHC,
        `Some courses are at capacity: ${overCapacityCourses.map(c => c.course.name).join(', ')}`
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    // Check for period conflicts
    const periods = courseSections.map(course => course.timeBlockId);
    const uniquePeriods = new Set(periods);
    
    if (periods.length !== uniquePeriods.size) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHC,
        'Schedule has period conflicts'
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    // Get settings to check max course load
    const settings = await this.prisma.settings.findFirst();
    const maxCourseLoad = settings?.maxCourseLoad || 8;

    if (courseSectionIds.length > maxCourseLoad) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHB,
        `Maximum course load (${maxCourseLoad}) exceeded`
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }

    return this.prisma.schedule.create({
      data: {
        ...scheduleData,
        student: { connect: { id: studentId } },
        scheduleCourseSections: {
          create: courseSectionIds.map(id => ({
            courseSection: { connect: { id } }
          }))
        },
      },
      include: {
        student: true,
        scheduleCourseSections: {
          include: {
            courseSection: {
              include: {
                course: true,
                timeBlock: true,
                room: true,
                teacher: true,
              }
            }
          }
        },
      },
    });
  }

  async findAll() {
    return this.prisma.schedule.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        scheduleCourseSections: {
          include: {
            courseSection: {
              include: {
                course: true,
                timeBlock: true,
                room: true,
                teacher: true,
              }
            }
          }
        },
      },
    });
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        student: true,
        scheduleCourseSections: {
          include: {
            courseSection: {
              include: {
                course: true,
                timeBlock: true,
                room: true,
                teacher: true,
              }
            }
          }
        },
      },
    });

    if (!schedule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHN,
        `Schedule with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return schedule;
  }

  async findByStudent(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const schedule = await this.prisma.schedule.findUnique({
      where: { studentId: student.id },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        scheduleCourseSections: {
          include: {
            courseSection: {
              include: {
                course: true,
                timeBlock: true,
                room: true,
                teacher: true,
              }
            }
          },
          orderBy: {
            courseSection: {
              timeBlock: {
                startTime: 'asc',
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule not found for student ID ${studentId}`);
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const { addCourseSectionIds, removeCourseSectionIds, ...scheduleData } = updateScheduleDto;

    // Check if schedule exists
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        scheduleCourseSections: {
          include: {
            courseSection: true
          }
        },
      },
    });

    if (!schedule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHN,
        `Schedule with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Process course modifications
    let coursesToConnect = [];
    let coursesToDisconnect = [];

    let addCourseSections = [];
    let removeCourseSections = [];

    if (addCourseSectionIds && addCourseSectionIds.length > 0) {
      // Check if courses exist
      addCourseSections = await this.prisma.courseSection.findMany({
        where: { id: { in: addCourseSectionIds } },
        include: { course: true },
      });

      if (addCourseSections.length !== addCourseSectionIds.length) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.SCHN,
          'One or more courses to add not found'
        )
          .withLogger(this.logger)
          .build();
        throw new NotFoundException(errorResponse);
      }

      // Check for capacity
      const overCapacityCourses = addCourseSections.filter(
        courseSection => courseSection.currentEnrollment >= courseSection.maxEnrollment
      );

      if (overCapacityCourses.length > 0) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.SCHC,
          `Some courses are at capacity: ${overCapacityCourses.map(c => c.course.name).join(', ')}`
        )
          .withLogger(this.logger)
          .build();
        throw new ConflictException(errorResponse);
      }

      coursesToConnect = addCourseSectionIds;
    }

    if (removeCourseSectionIds && removeCourseSectionIds.length > 0) {
      coursesToDisconnect = removeCourseSectionIds;
      if(addCourseSections.length > 0) {
        removeCourseSections = await this.prisma.courseSection.findMany({
          where: { id: { in: removeCourseSectionIds } },
            include: { course: true },
        });
      }
    }

    // Get settings to check max course load
    const settings = await this.prisma.settings.findFirst();
    const maxCourseLoad = settings?.maxCourseLoad || 8;

    const finalCourseCount = schedule.scheduleCourseSections.length + coursesToConnect.length - coursesToDisconnect.length;
    if (finalCourseCount > maxCourseLoad) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHB,
        `Maximum course load (${maxCourseLoad}) would be exceeded`
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }

    if(addCourseSections.length > 0) {
      // Check for period conflicts with existing courses
      const existingPeriods = schedule.scheduleCourseSections.map(scs => scs.courseSection.timeBlockId);
      const newPeriods = addCourseSections.map(courseSection => courseSection.timeBlockId);
      const removePeriods = removeCourseSections.map(courseSection => courseSection.timeBlockId);
      
      const allPeriods = [...existingPeriods];
      
      for (const period of newPeriods) {
        if (allPeriods.includes(period) && !removePeriods.includes(period)) {
          const errorResponse = ApiErrorResponseBuilder.create(
            ErrorCode.SCHC,
            `Period conflict with course in period ${period}`
          )
            .withLogger(this.logger)
            .build();
          throw new ConflictException(errorResponse);
        }
        allPeriods.push(period);
      }
    }
    

    return this.prisma.schedule.update({
      where: { id },
      data: {
        //...scheduleData,
        scheduleCourseSections: {
          create: coursesToConnect.map(id => ({
            courseSection: { connect: { id } }
          })),
          deleteMany: {
            courseSectionId: {
              in: coursesToDisconnect
            }
          }
        },
      },
      include: {
        student: true,
        scheduleCourseSections: {
          include: {
            courseSection: {
              include: {
                course: true,
                timeBlock: true,
                room: true,
                teacher: true,
              }
            }
          }
        },
      },
    });
  }

  async remove(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHN,
        `Schedule with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return this.prisma.schedule.delete({
      where: { id },
    });
  }
}
