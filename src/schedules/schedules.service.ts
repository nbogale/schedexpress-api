import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/schedule-change-requests/enums/request-enums';
import { AcademicPeriodStatus, CycleType } from '@prisma/client';
import { AcademicPeriodBusinessRulesService } from '../academic-cycles/academic-period-business-rules.service';
import { EnrollmentRuleConfig } from '../academic-cycles/interfaces/academic-period-business-rules.interface';
import { AcademicCyclesService } from '../academic-cycles/academic-cycles.service';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly businessRulesService: AcademicPeriodBusinessRulesService,
    private readonly academicCyclesService: AcademicCyclesService,
  ) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { studentId, courseSectionIds, academicCycleId, ...scheduleData } = createScheduleDto;

    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
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

    // Check if student already has a schedule for this academic cycle
    const existingSchedule = await this.prisma.schedule.findUnique({
      where: {
        studentId_academicCycleId: {
          studentId,
          academicCycleId,
        },
      },
    });

    if (existingSchedule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCHC,
        `Student already has a schedule for this academic cycle`
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

    // Check if enrollment is allowed based on business rules
    const enrollmentValidation = await this.businessRulesService.canEnroll(
      studentId,
      academicCycleId
    );

    if (!enrollmentValidation.allowed) {
      const errorCode = enrollmentValidation.errorCode || ErrorCode.SCHB;
      const errorResponse = ApiErrorResponseBuilder.create(
        errorCode,
        enrollmentValidation.reason || 'Enrollment is not allowed at this time.'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }

    // Check capacity based on business rules
    const enrollmentRules = await this.businessRulesService.getRuleCategory('enrollment') as EnrollmentRuleConfig;
    if (enrollmentRules && enrollmentRules.isActive && enrollmentRules.capacity.checkCapacity) {
      const overCapacityCourses = courseSections.filter(course => {
        const isOverCapacity = course.currentEnrollment >= course.maxEnrollment;
        if (!isOverCapacity) return false;
        
        // Check if over-enrollment is allowed
        if (enrollmentRules.capacity.allowOverEnrollment && enrollmentRules.capacity.overEnrollmentLimit) {
          const currentPercentage = (course.currentEnrollment / course.maxEnrollment) * 100;
          return currentPercentage > enrollmentRules.capacity.overEnrollmentLimit;
        }
        return true;
      });

      if (overCapacityCourses.length > 0) {
        // Check if any course exceeds over-enrollment limit
        const exceedsLimit = overCapacityCourses.some(course => {
          if (enrollmentRules.capacity.allowOverEnrollment && enrollmentRules.capacity.overEnrollmentLimit) {
            const currentPercentage = (course.currentEnrollment / course.maxEnrollment) * 100;
            return currentPercentage > enrollmentRules.capacity.overEnrollmentLimit;
          }
          return true; // At capacity and over-enrollment not allowed
        });

        const errorCode = exceedsLimit ? ErrorCode.ACRE7 : ErrorCode.ACRE6;
        const errorResponse = ApiErrorResponseBuilder.create(
          errorCode,
          `Some courses are at capacity: ${overCapacityCourses.map(c => c.course.name).join(', ')}`
        )
          .withLogger(this.logger)
          .build();
        throw new ConflictException(errorResponse);
      }
    } else {
      // Fallback to basic capacity check if rules are disabled
      const overCapacityCourses = courseSections.filter(
        course => course.currentEnrollment >= course.maxEnrollment
      );

      if (overCapacityCourses.length > 0) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.CSSE,
          `Some courses are at capacity: ${overCapacityCourses.map(c => c.course.name).join(', ')}`
        )
          .withLogger(this.logger)
          .build();
        throw new ConflictException(errorResponse);
      }
    }

    return this.prisma.schedule.create({
      data: {
        ...scheduleData,
        academicCycle: { connect: { id: academicCycleId } },
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
        academicCycle: true,
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
        academicCycle: true,
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

  async findByStudent(studentId: string, academicCycleId?: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // If academicCycleId is provided, find schedule for that cycle
    // Otherwise, find the most recent schedule
    const schedule = academicCycleId
      ? await this.prisma.schedule.findUnique({
          where: {
            studentId_academicCycleId: {
              studentId: student.id,
              academicCycleId,
            },
          },
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
            academicCycle: true,
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
        })
      : await this.prisma.schedule.findFirst({
          where: { studentId: student.id },
          orderBy: { createdAt: 'desc' },
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
            academicCycle: true,
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


  async findStudentScheduleForCurrentAcademicYear(studentId: string) {

    const currentAcademicCycle = await this.academicCyclesService.findCurrentCycle(CycleType.SCHOOL_YEAR);

    console.log('Current academic cycle:', JSON.stringify(currentAcademicCycle, null, 2));

    if(!currentAcademicCycle) {
      throw new NotFoundException(`Current academic cycle not found`);
    }
    const student = await this.prisma.student.findUnique({
      where: { userId: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const schedule = await this.prisma.schedule.findUnique({
      where: {
        studentId_academicCycleId: {
          studentId: student.id,
          academicCycleId: currentAcademicCycle.id,
        },
      },
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
        academicCycle: true,
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
      throw new NotFoundException(`Schedule not found for student ID ${studentId} for the academic year ${currentAcademicCycle.name}`);
    }

    console.log('Current year Schedule:', JSON.stringify(schedule, null, 2));

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
   
      removeCourseSections = await this.prisma.courseSection.findMany({
        where: { id: { in: removeCourseSectionIds } },
          include: { course: true },
      });
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

    const updatedSchedule =  await this.prisma.schedule.update({
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

    // Snet email notification to student
    const student = await this.prisma.student.findUnique({
      where: { id: updatedSchedule.studentId},
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    
    if(student) {
      // Send email notification to student
      let message = 'Your schedule has been updated.\n';
      let addedCourseMessage = '';
      let removedCourseMessage = '';
      if(addCourseSections.length > 0) {
        addedCourseMessage = `You have been added to ${addCourseSections.map(c => c.course.name).join(', ')}\n`;
      }
      if(removeCourseSections.length > 0) {
        removedCourseMessage = `You have been removed from ${removeCourseSections.map(c => c.course.name).join(', ')}\n`;
      }

      await this.notificationsService.createNotification({
        studentId: student.id,
        userId: student.user.id,
        message: message + addedCourseMessage + removedCourseMessage,
        type: NotificationType.SCHEDULE_UPDATE
      }, true);
    }


    return updatedSchedule;
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
