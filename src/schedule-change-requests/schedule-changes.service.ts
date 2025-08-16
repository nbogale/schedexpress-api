import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateScheduleChangeRequestDto } from './dto/create-schedule-change-request.dto';
import { UpdateScheduleChangeRequestDto } from './dto/update-schedule-change-request.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { RequestStatus, RequestPriority, NotificationType, UserRoleType } from './enums/request-enums';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ConflictType, CourseRule, RuleType } from '@prisma/client';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class ScheduleChangesService {
  private readonly logger = new Logger(ScheduleChangesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly coursesService: CoursesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(filters?: any) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.termId) where.termId = filters.termId;

    return this.prisma.scheduleChangeRequest.findMany({
      where,
      include: {
        student: { include: { user: true, gradeLevel: true } },
        schoolYear: true,
        term: true,
        currentCourseSection: { include: { course: true, timeBlock: true } },
        requestedCourseSection: { include: { course: true } },
        preferredTimeBlock: true,
        reviewer: true,
        courseConflicts: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const req = await this.prisma.scheduleChangeRequest.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        schoolYear: true,
        term: true,
        currentCourseSection: {
          include: { course: true, teacher: true, room: true, timeBlock: true },
        },
        requestedCourseSection: { include: { course: true } },
        preferredTimeBlock: true,
        reviewer: true,
        actions: {
          include: {
            removedCourseSection: true,
            addedCourseSection: true,
            actionBy: true,
          },
        },
      },
    });
    if (!req) throw new NotFoundException(`Schedule change request with ID ${id} not found`);
    return req;
  }

  async create(dto: CreateScheduleChangeRequestDto, userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
        gradeLevel: true,
      },
    });

    if (!student) {
      throw new NotFoundException(
        ApiErrorResponseBuilder.create(ErrorCode.USRN, 'Student not found')
          .withLogger(this.logger)
          .build()
      );
    }

    const currentCourseSection = await this.prisma.courseSection.findUnique({
      where: { id: dto.currentCourseSectionId },
      include: { course: true, timeBlock: true },
    });

    if (!currentCourseSection) {
      throw new NotFoundException(
        ApiErrorResponseBuilder.create(ErrorCode.CSSN, 'Current course section not found')
          .withLogger(this.logger)
          .build()
      );
    }

    const requestedCourseSection = await this.prisma.courseSection.findUnique({
      where: { id: dto.requestedCourseSectionId },
      include: { course: { select: { name: true } }, timeBlock: true },
    });

    if (!requestedCourseSection) {
      throw new NotFoundException(
        ApiErrorResponseBuilder.create(ErrorCode.CSSN, 'Requested course section not found')
          .withLogger(this.logger)
          .build()
      );
    }

    const studentSchedule = await this.prisma.schedule.findFirst({
      where: {
        studentId: student.id,
        scheduleCourseSections: {
          some: {
            courseSectionId: currentCourseSection.id,
          },
        },
      },
      include: {
        scheduleCourseSections: true,
      },
    });

    if (!studentSchedule) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRD, 'You are not enrolled in the current course section')
          .withLogger(this.logger)
          .build()
      );
    }

    const duplicate = await this.prisma.scheduleChangeRequest.findFirst({
        where: {
          studentId: student.id,
          currentCourseSectionId: dto.currentCourseSectionId,
          requestedCourseSectionId: dto.requestedCourseSectionId,
          status: RequestStatus.PENDING,
        },
      });

    if (duplicate) {
      throw new ConflictException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRP, 'You already have a pending schedule change request for this course change')
          .withLogger(this.logger)
          .build()
      );
    }

    if (requestedCourseSection.currentEnrollment >= requestedCourseSection.maxEnrollment) {
      throw new ConflictException(
        ApiErrorResponseBuilder.create(ErrorCode.CSSE, 'Requested course section is at maximum enrollment')
          .withLogger(this.logger)
          .build()
      );
    }

    const currentSchoolYear = await this.prisma.schoolYear.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSchoolYear) {
      throw new NotFoundException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRE, 'No active school year found')
          .withLogger(this.logger)
          .build()
      );
    }

    const currentTerm = await this.prisma.term.findFirst({
      where: { isCurrent: true },
    });

    if (!currentTerm) {
      throw new NotFoundException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRF, 'No active term found')
          .withLogger(this.logger)
          .build()
      );
    }

    if (dto.preferredTimeBlockId) {
      const tb = await this.prisma.timeBlock.findUnique({ where: { id: dto.preferredTimeBlockId } });
      if (!tb) {
        throw new NotFoundException(
          ApiErrorResponseBuilder.create(ErrorCode.CSSN, 'Preferred time block not found')
            .withLogger(this.logger)
            .build()
        );
      }

      const existingSchedule = await this.prisma.schedule.findFirst({
        where: {
          studentId: student.id,
          scheduleCourseSections: {
            some: {
              courseSection: {
                timeBlockId: dto.preferredTimeBlockId,
              },
            },
          },
        },
        include: {
          scheduleCourseSections: {
            include: {
              courseSection: {
                include: {
                  course: true,
                  timeBlock: true,
                }
              }
            }
          },
        },
      });

      if(currentCourseSection.timeBlockId !== requestedCourseSection.timeBlockId && (existingSchedule && existingSchedule.scheduleCourseSections.length > 0)) {
        const existingScheduleSection = existingSchedule.scheduleCourseSections.find(s => s.courseSection.timeBlockId === tb.id);
        if (existingScheduleSection && existingScheduleSection.courseSection.id !== dto.currentCourseSectionId) {
          throw new BadRequestException(
            ApiErrorResponseBuilder.create(ErrorCode.SCRC, 'You already have a course scheduled during the preferred time block')
              .withLogger(this.logger)
              .build()
          );
        }
      }
    }

    const req = await this.prisma.scheduleChangeRequest.create({
      data: {
        studentId: student.id,
        schoolYearId: currentSchoolYear.id,
        termId: currentTerm.id,
        currentCourseSectionId: dto.currentCourseSectionId,
        requestedCourseSectionId: dto.requestedCourseSectionId,
        preferredTimeBlockId: dto.preferredTimeBlockId,
        reason: dto.reason,
        priority: dto.priority ?? RequestPriority.MEDIUM,
        status: RequestStatus.PENDING,
      },
    });

    // Check course rules for conflicts
    const courseRules = await this.prisma.courseRule.findMany({
      where: {
        courseId: requestedCourseSection.courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        conflictingCourse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (courseRules.length > 0) {
      const unsatisfiedRules: CourseRule[] = [];
      const courseHistory = await this.getStudentCourseHistory(student.id);
      for (const rule of courseRules) {
        if (!courseHistory.some(h => h.courseId === rule.conflictingCourseId && h.isPassed)) {
          unsatisfiedRules.push(rule);
        }
      }

      if (unsatisfiedRules.length > 0) {
        for(const rule of unsatisfiedRules) {
        //  if(!rule.isOverridable) {
            //throw new BadRequestException(`You cannot change to this course because it conflicts with another course: ${rule.description}`);
          //} else {
            //Save it to course conflict table
            await this.prisma.courseConflict.create({
              data: {
                courseSectionId1: dto.currentCourseSectionId,
                courseSectionId2: dto.requestedCourseSectionId,
                conflictType: this.mapRuleTypeToConflictType(rule.type),
                isResolvable: rule.isOverridable,
                resolutionNotes: rule.description,
                requestId: req.id,
              },
            });
          //}
        }
      }
    }

    try {
      // Create notification for the student and counselor
      const currentCourseSection = await this.prisma.courseSection.findUnique(
        { where: { id: dto.currentCourseSectionId }, include: { course: { select: { name: true } } } });
  
        await this.notificationsService.createNotification({
            studentId: student.id,
            userId: userId,
            message: `Your request to change from ${currentCourseSection.course.name} to ${requestedCourseSection.course.name} has been submitted`,
            type: NotificationType.REQUEST_UPDATE
        }, true);
  
        this.logger.log('Email notification created successfully');
  
        const counselor = await this.prisma.user.findFirst({
          where: {
            role: UserRoleType.COUNSELOR,
          },
        });
  
        if(counselor) {
          const message = `New schedule change request from ${student.user.firstName} ${student.user.lastName || 'a student'} (Grade ${student.gradeLevel.level})`;
          await this.notificationsService.createNotification({
            userId: counselor.id,
            type: NotificationType.REQUEST_UPDATE,
            message: message,
          }, true);
        }
    } catch (error) {
      console.log('Error creating notification', error);
    }
    return this.findOne(req.id);    
  }

  private mapRuleTypeToConflictType(ruleType: RuleType): ConflictType {
    switch(ruleType) {
      case RuleType.PREREQUISITE:
        return ConflictType.PREREQUISITE_NOT_MET;
      case RuleType.SEQUENCE:
        return ConflictType.COURSE_SEQUENCE_NOT_MET;
      case RuleType.COURSE_CONFLICT:
        return ConflictType.COURSE_CONFLICT;
      default:
        return ConflictType.OTHER;
    }
  }

  async update(id: string, dto: UpdateScheduleChangeRequestDto, userId: string) {
    const req = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (req.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRI, 'Cannot update a request that is no longer pending')
          .withLogger(this.logger)
          .build()
      );
    }

    const data: any = {};
    const student = await this.prisma.student.findUnique({ where: { userId } });
    
    if (user.role === 'STUDENT') {
      if (!student || student.id !== req.studentId) {
        throw new BadRequestException(
          ApiErrorResponseBuilder.create(ErrorCode.SCRJ, 'You can only update your own schedule change requests')
            .withLogger(this.logger)
            .build()
        );
      }
      
      if (dto.reason) data.reason = dto.reason;
      if (dto.preferredTimeBlockId) {
        const tb = await this.prisma.timeBlock.findUnique({ where: { id: dto.preferredTimeBlockId } });
        if (!tb) throw new NotFoundException(`Preferred time block with ID ${dto.preferredTimeBlockId} not found`);
        data.preferredTimeBlockId = tb.id;
      }
    } else {
      if (dto.priority) data.priority = dto.priority;
      if (dto.requestedCourseId) {
        const c = await this.prisma.course.findUnique({ where: { id: dto.requestedCourseId } });
        if (!c) throw new NotFoundException(`Requested course with ID ${dto.requestedCourseId} not found`);
        data.requestedCourseId = c.id;
      }
    }

    await this.prisma.scheduleChangeRequest.update({ where: { id }, data });

    const notification = await this.notificationsService.createNotification({
      studentId: req.studentId,
      userId: userId,
      message: `Your schedule change request has been updated for ${req.requestedCourseSection.course.name}`,
      type: NotificationType.REQUEST_UPDATE,
    });

    return this.findOne(id);
  }

  async processChangeRequest(id: string, dto: ProcessChangeRequestDto, userId: string) {
    const req = await this.findOne(id);
    if (req.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRK, 'This request has already been processed')
          .withLogger(this.logger)
          .build()
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!['ADMIN', 'COUNSELOR'].includes(user.role)) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRL, 'Only administrators and counselors can process schedule change requests')
          .withLogger(this.logger)
          .build()
      );
    }

    let updateData: any = { status: dto.status, resolutionNotes: dto.resolutionNotes, reviewedById: user.id };

    if (([RequestStatus.APPROVED, RequestStatus.COMPLETED] as RequestStatus[]).includes(dto.status) && dto.newCourseSectionId) {
      await this.prisma.$transaction(async tx => {
        // Get the student's schedule first
        const studentSchedule = await tx.schedule.findUnique({
          where: { studentId: req.studentId }
        });

        if (!studentSchedule) {
          throw new NotFoundException('Student schedule not found');
        }

        await tx.courseSection.update({ 
          where: { id: req.currentCourseSectionId }, 
          data: { currentEnrollment: { decrement: 1 } } 
        });
        
        await tx.courseSection.update({ 
          where: { id: dto.newCourseSectionId }, 
          data: { currentEnrollment: { increment: 1 } } 
        });

        // First delete the existing schedule course section
        await tx.scheduleCourseSection.delete({
          where: {
            scheduleId_courseSectionId: {
              scheduleId: studentSchedule.id,
              courseSectionId: req.currentCourseSectionId,
            },
          },
        });

        // Then create the new schedule course section
        await tx.scheduleCourseSection.create({
          data: {
            schedule: { connect: { id: studentSchedule.id } },
            courseSection: { connect: { id: dto.newCourseSectionId } },
          },
        });

        await tx.scheduleChangeAction.create({
          data: {
            requestId: req.id,
            removedCourseSectionId: req.currentCourseSectionId,
            addedCourseSectionId: dto.newCourseSectionId,
            actionById: user.id,
            notes: 'Schedule change completed',
          },
        });

        await tx.courseWaitlist.deleteMany({ 
          where: { 
            studentId: req.studentId, 
            requestId: req.id 
          } 
        });
      });

      if (dto.status === RequestStatus.APPROVED) updateData.status = RequestStatus.COMPLETED;
    } else if (dto.status === RequestStatus.APPROVED) {
      const avail = await this.findAvailableSections(req.requestedCourseSection.course.id, req.studentId, req.preferredTimeBlockId);
      if (!avail.length) await this.addToWaitlist(req);
    }

    await this.notificationsService.createNotification({
      studentId: req.studentId,
      userId: req.student.userId,
      message: `Your schedule change request has been ${dto.status.toLowerCase()}${
        dto.resolutionNotes ? `: ${dto.resolutionNotes}` : ''
      }`,
      type: NotificationType.REQUEST_UPDATE, 
    }, true);

    await this.prisma.scheduleChangeRequest.update({ where: { id }, data: updateData });
    return this.findOne(id);
  }

  async cancelChangeRequest(id: string, userId: string) {
    const req = await this.findOne(id);
    if (!([RequestStatus.PENDING, RequestStatus.APPROVED] as RequestStatus[]).includes(req.status)) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRM, 'This request can no longer be canceled')
          .withLogger(this.logger)
          .build()
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    if (user.role === 'STUDENT') {
      const student = await this.prisma.student.findUnique({ where: { userId } });
      if (!student || student.id !== req.studentId) {
        throw new BadRequestException(
          ApiErrorResponseBuilder.create(ErrorCode.SCRN, 'You can only cancel your own schedule change requests')
            .withLogger(this.logger)
            .build()
        );
      }
    }

    await this.prisma.courseWaitlist.deleteMany({ where: { studentId: req.studentId, requestId: req.id } });
    await this.prisma.scheduleChangeRequest.update({
      where: { id },
      data: { 
        status: RequestStatus.CANCELED, 
        resolutionNotes: `Request canceled by ${user.role === 'STUDENT' ? 'student' : 'staff'}` 
      },
    });
    return this.findOne(id);
  }

  async findPending() {
    return this.findAll({ status: RequestStatus.PENDING });
  }

  async findByStudent(studentId: string) {
    return this.findAll({ studentId });
  }

  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // If student, get their requests
    if (user.role === 'STUDENT' && user.student) {
      return this.findAll({ studentId: user.student.id });
    }

    // For counselors or admins, return pending requests
    return this.findPending();
  }

  private async getStudentCourseHistory(studentId: string): Promise<{ courseId: string; isPassed: boolean }[]> {
    // Retrieve the student's course history from the database
    const history = await this.prisma.studentCourseHistory.findMany({
      where: { studentId },
      select: {
        courseId: true,
        isPassed: true,
      },
    });
    
    return history;
  }

  private async checkForSchedulingConflict(studentId: string, sectionId: string): Promise<boolean> {
    const newSection = await this.prisma.courseSection.findUnique({ 
      where: { id: sectionId }, 
      include: { timeBlock: true } 
    });
    
    if (!newSection) {
      throw new NotFoundException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRN, `Course section with ID ${sectionId} not found`)
          .withLogger(this.logger)
          .build()
      );
    }

    // Get the student's current schedule
    const schedule = await this.prisma.schedule.findUnique({
      where: { studentId },
      include: { 
        scheduleCourseSections: {
          include: {
            courseSection: {
              include: {
                course: true,
                timeBlock: true,
              }
            }
          }
        } 
      },
    });
    
    // Check if any current sections have the same time block as the new section
    return schedule.scheduleCourseSections.some(s => s.courseSection.timeBlockId === newSection.timeBlockId);
  }

  private async findAvailableSections(courseId: string, studentId: string, preferredTimeBlockId?: string) {
    const where: any = { 
      courseId, 
      isActive: true, 
      currentEnrollment: { lt: this.prisma.courseSection.fields.maxEnrollment } 
    };
    
    if (preferredTimeBlockId) where.timeBlockId = preferredTimeBlockId;

    const sections = await this.prisma.courseSection.findMany({ 
      where, 
      include: { timeBlock: true, teacher: true, room: true } 
    });
    
    const result = [];
    for (const sec of sections) {
      if (!(await this.checkForSchedulingConflict(studentId, sec.id))) result.push(sec);
    }
    return result;
  }

  private async addToWaitlist(req: any): Promise<void> {
    const sections = await this.prisma.courseSection.findMany({ 
      where: { courseId: req.requestedCourseId, isActive: true } 
    });
    
    for (const sec of sections) {
      const highest = await this.prisma.courseWaitlist.findFirst({
        where: { courseSectionId: sec.id },
        orderBy: { position: 'desc' },
      });
      
      const nextPos = highest ? highest.position + 1 : 1;
      
      await this.prisma.courseWaitlist.create({
        data: { 
          courseSectionId: sec.id, 
          studentId: req.studentId, 
          position: nextPos, 
          requestId: req.id 
        },
      });
    }
  }
}
