import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateScheduleChangeRequestDto, RequestType } from './dto/create-schedule-change-request.dto';
import { UpdateScheduleChangeRequestDto } from './dto/update-schedule-change-request.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { RequestStatus, RequestPriority, NotificationType, UserRoleType } from './enums/request-enums';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ConflictType, CourseRule, RuleType, AcademicPeriodStatus } from '@prisma/client';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';
import { AcademicPeriodBusinessRulesService } from '../academic-cycles/academic-period-business-rules.service';
import { ScheduleChangeRuleConfig } from '../academic-cycles/interfaces/academic-period-business-rules.interface';

@Injectable()
export class ScheduleChangesService {
  private readonly logger = new Logger(ScheduleChangesService.name);

  private withComputedEnrollment<T extends { _count?: { scheduleCourseSections?: number }; currentEnrollment?: number }>(
    section: T | null
  ): (Omit<T, '_count'> & { currentEnrollment: number }) | null {
    if (!section) return null;
    const { _count, ...rest } = section as any;
    return {
      ...rest,
      currentEnrollment: _count?.scheduleCourseSections ?? rest.currentEnrollment ?? 0,
    };
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly coursesService: CoursesService,
    private readonly notificationsService: NotificationsService,
    private readonly businessRulesService: AcademicPeriodBusinessRulesService,
  ) {}

  async findAll(filters?: any) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.priority) where.priority = filters.priority;

    const requests = await this.prisma.scheduleChangeRequest.findMany({
      where,
      include: {
        student: { include: { user: true, gradeLevel: true } },
        academicCycle: true,
        currentCourseSection: {
          include: {
            course: true,
            timeBlock: true,
            teacher: true,
            _count: { select: { scheduleCourseSections: true } },
          },
        },
        requestedCourseSection: {
          include: {
            course: true,
            timeBlock: true,
            teacher: true,
            _count: { select: { scheduleCourseSections: true } },
          },
        },
        preferredTimeBlock: true,
        reviewer: true,
        courseConflicts: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return requests.map(req => ({
      ...req,
      currentCourseSection: this.withComputedEnrollment(req.currentCourseSection as any) as any,
      requestedCourseSection: this.withComputedEnrollment(req.requestedCourseSection as any) as any,
    }));
  }

  async findOne(id: string) {
    const req = await this.prisma.scheduleChangeRequest.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        academicCycle: true,
        currentCourseSection: {
          include: {
            course: true,
            teacher: true,
            room: true,
            timeBlock: true,
            _count: { select: { scheduleCourseSections: true } },
          },
        },
        requestedCourseSection: {
          include: {
            course: true,
            teacher: true,
            room: true,
            timeBlock: true,
            _count: { select: { scheduleCourseSections: true } },
          },
        },
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
    return {
      ...req,
      currentCourseSection: this.withComputedEnrollment(req.currentCourseSection as any) as any,
      requestedCourseSection: this.withComputedEnrollment(req.requestedCourseSection as any) as any,
    };
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

    // Validate request type and required fields
    if (dto.requestType === RequestType.ADD_COURSE && !dto.requestedCourseSectionId) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRU, 'Requested course section is required for ADD_COURSE requests')
          .withLogger(this.logger)
          .build()
      );
    }

    if (dto.requestType === RequestType.DROP_COURSE && !dto.currentCourseSectionId) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRV, 'Current course section is required for DROP_COURSE requests')
          .withLogger(this.logger)
          .build()
      );
    }

    if (dto.requestType === RequestType.CHANGE_SECTION && (!dto.currentCourseSectionId || !dto.requestedCourseSectionId)) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRW, 'Both current and requested course sections are required for CHANGE_SECTION requests')
          .withLogger(this.logger)
          .build()
      );
    }

    // Fetch current course section if provided
    let currentCourseSection = null;
    if (dto.currentCourseSectionId) {
      currentCourseSection = await this.prisma.courseSection.findUnique({
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
    }

    // Fetch requested course section if provided
    let requestedCourseSection = null;
    if (dto.requestedCourseSectionId) {
      requestedCourseSection = await this.prisma.courseSection.findUnique({
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
    }

    // Validate student schedule based on request type
    if (dto.requestType === RequestType.DROP_COURSE || dto.requestType === RequestType.CHANGE_SECTION) {
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
    }

    // Check for duplicate requests
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

    // NOTE:
    // We intentionally allow students to submit requests even if a section is currently full.
    // Counselors can still review/deny, suggest alternatives, or handle waitlist workflows.

    // Get current academic cycle
    const currentAcademicCycle = await this.prisma.academicCycle.findFirst({
      where: { isCurrent: true },
    });

    if (!currentAcademicCycle) {
      throw new NotFoundException(
        ApiErrorResponseBuilder.create(ErrorCode.SCRX, 'Current academic cycle not found')
          .withLogger(this.logger)
          .build()
      );
    }

    // Check if schedule changes are allowed based on business rules
    const scheduleChangeValidation = await this.businessRulesService.canRequestScheduleChange(
      student.id,
      currentAcademicCycle.id,
      dto.requestType
    );

    if (!scheduleChangeValidation.allowed) {
      const errorCode: ErrorCode = scheduleChangeValidation.errorCode || ErrorCode.SCRX;
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(
          errorCode,
          scheduleChangeValidation.reason || 'Schedule changes are not allowed at this time.'
        )
          .withLogger(this.logger)
          .build()
      );
    }

    // Check request limits based on business rules
    const rules = await this.businessRulesService.getRuleCategory('scheduleChange') as ScheduleChangeRuleConfig;
    if (rules && rules.isActive) {
      // Count existing requests for this student in this cycle
      const existingRequests = await this.prisma.scheduleChangeRequest.findMany({
        where: {
          studentId: student.id,
          academicCycleId: currentAcademicCycle.id,
        },
      });

      // Check max requests per cycle
      if (existingRequests.length >= rules.requestLimits.maxRequestsPerCycle) {
        throw new BadRequestException(
          ApiErrorResponseBuilder.create(
            ErrorCode.ACRS7,
            `Maximum number of schedule change requests (${rules.requestLimits.maxRequestsPerCycle}) reached for this cycle.`
          )
            .withLogger(this.logger)
            .build()
        );
      }

      // Check concurrent requests
      if (!rules.requestLimits.allowConcurrentRequests) {
        const pendingRequests = existingRequests.filter(req =>
          req.status === RequestStatus.PENDING
        );
        if (pendingRequests.length > 0) {
          throw new BadRequestException(
            ApiErrorResponseBuilder.create(
              ErrorCode.ACRSA,
              'You have a pending schedule change request. Please wait for it to be processed.'
            )
              .withLogger(this.logger)
              .build()
          );
        }
      } else {
        const pendingRequests = existingRequests.filter(req =>
          req.status === RequestStatus.PENDING
        );
        if (pendingRequests.length >= rules.requestLimits.maxConcurrentRequests) {
          throw new BadRequestException(
            ApiErrorResponseBuilder.create(
              ErrorCode.ACRS9,
              `Maximum concurrent requests (${rules.requestLimits.maxConcurrentRequests}) reached.`
            )
              .withLogger(this.logger)
              .build()
          );
        }
      }
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
    }

    const req = await this.prisma.scheduleChangeRequest.create({
      data: {
        studentId: student.id,
        academicCycleId: currentAcademicCycle.id,
        requestType: dto.requestType,
        currentCourseSectionId: dto.currentCourseSectionId,
        requestedCourseSectionId: dto.requestedCourseSectionId,
        preferredTimeBlockId: dto.preferredTimeBlockId,
        reason: dto.reason,
        priority: dto.priority ?? RequestPriority.MEDIUM,
        status: RequestStatus.PENDING,
      },
    });

    // Check course rules for conflicts (only for ADD_COURSE and CHANGE_SECTION)
    let courseRules = [];
    if (requestedCourseSection) {
      courseRules = await this.prisma.courseRule.findMany({
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
    }

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
                courseSectionId1: dto.currentCourseSectionId || '',
                courseSectionId2: dto.requestedCourseSectionId || '',
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
      // Create notification for the student and counselors
      const currentCourseName = currentCourseSection?.course?.name;
      const requestedCourseName = requestedCourseSection?.course?.name;

      const studentMessage =
        dto.requestType === RequestType.ADD_COURSE
          ? `Your request to add ${requestedCourseName || 'a course'} has been submitted`
          : dto.requestType === RequestType.DROP_COURSE
          ? `Your request to drop ${currentCourseName || 'a course'} has been submitted`
          : `Your request to change from ${currentCourseName || 'a course'} to ${requestedCourseName || 'a course'} has been submitted`;

      await this.notificationsService.createNotification(
        {
          studentId: student.id,
          userId,
          message: studentMessage,
          type: NotificationType.REQUEST_UPDATE,
        },
        true
      );

      const counselors = await this.prisma.user.findMany({
        where: { role: UserRoleType.COUNSELOR },
        select: { id: true },
      });

      if (counselors.length > 0) {
        const counselorMessage =
          dto.requestType === RequestType.ADD_COURSE
            ? `New schedule change request from ${student.user.firstName} ${student.user.lastName || 'a student'} (Grade ${student.gradeLevel.level}): Add ${requestedCourseName || 'a course'}`
            : dto.requestType === RequestType.DROP_COURSE
            ? `New schedule change request from ${student.user.firstName} ${student.user.lastName || 'a student'} (Grade ${student.gradeLevel.level}): Drop ${currentCourseName || 'a course'}`
            : `New schedule change request from ${student.user.firstName} ${student.user.lastName || 'a student'} (Grade ${student.gradeLevel.level}): Change ${currentCourseName || 'a course'} → ${requestedCourseName || 'a course'}`;

        const results = await Promise.allSettled(
          counselors.map(counselor =>
            this.notificationsService.createNotification(
              {
                userId: counselor.id,
                type: NotificationType.REQUEST_UPDATE,
                message: counselorMessage,
              },
              true
            )
          )
        );

        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          this.logger.warn(
            `Failed to create ${failed.length} counselor notification(s) for schedule change request ${req.id}`
          );
        }
      }
    } catch (error: any) {
      this.logger.error(`Error creating schedule-change notification(s) for request ${req.id}: ${error?.message || error}`, error?.stack);
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

    // Handle different request types when approved/completed
    if (([RequestStatus.APPROVED, RequestStatus.COMPLETED] as RequestStatus[]).includes(dto.status)) {
      await this.prisma.$transaction(async tx => {
        // Get the student's schedule first - use composite unique constraint
        const studentSchedule = await tx.schedule.findUnique({
          where: {
            studentId_academicCycleId: {
              studentId: req.studentId,
              academicCycleId: req.academicCycleId,
            },
          },
        });

        if (!studentSchedule) {
          throw new NotFoundException('Student schedule not found');
        }

        if (req.requestType === RequestType.ADD_COURSE) {
          // For ADD_COURSE requests, add the new course section
          if (!req.requestedCourseSectionId) {
            throw new BadRequestException('Requested course section ID is required for ADD_COURSE requests');
          }

          // Check if course section exists and has space
          const courseSection = await tx.courseSection.findUnique({
            where: { id: req.requestedCourseSectionId }
          });

          if (!courseSection) {
            throw new NotFoundException('Requested course section not found');
          }

          if (courseSection.currentEnrollment >= courseSection.maxEnrollment) {
            throw new ConflictException('Course section is at maximum enrollment');
          }

          // Increment enrollment for the new course section
          await tx.courseSection.update({ 
            where: { id: req.requestedCourseSectionId }, 
            data: { currentEnrollment: { increment: 1 } } 
          });

          // Add the new course section to student's schedule
          await tx.scheduleCourseSection.create({
            data: {
              schedule: { connect: { id: studentSchedule.id } },
              courseSection: { connect: { id: req.requestedCourseSectionId } },
            },
          });

          // Create action record
          await tx.scheduleChangeAction.create({
            data: {
              requestId: req.id,
              addedCourseSectionId: req.requestedCourseSectionId,
              actionById: user.id,
              notes: 'Course added to schedule',
            },
          });

        } else if (req.requestType === RequestType.DROP_COURSE) {
          // For DROP_COURSE requests, remove the current course section
          if (!req.currentCourseSectionId) {
            throw new BadRequestException('Current course section ID is required for DROP_COURSE requests');
          }

          // Decrement enrollment for the current course section
          await tx.courseSection.update({ 
            where: { id: req.currentCourseSectionId }, 
            data: { currentEnrollment: { decrement: 1 } } 
          });

          // Remove the course section from student's schedule
          await tx.scheduleCourseSection.delete({
            where: {
              scheduleId_courseSectionId: {
                scheduleId: studentSchedule.id,
                courseSectionId: req.currentCourseSectionId,
              },
            },
          });

          // Create action record
          await tx.scheduleChangeAction.create({
            data: {
              requestId: req.id,
              removedCourseSectionId: req.currentCourseSectionId,
              actionById: user.id,
              notes: 'Course dropped from schedule',
            },
          });

        } else if (req.requestType === RequestType.CHANGE_SECTION) {
          // For CHANGE_SECTION requests, replace current with new section
          if (!req.currentCourseSectionId || !req.requestedCourseSectionId) {
            throw new BadRequestException('Both current and requested course section IDs are required for CHANGE_SECTION requests');
          }

          // Check if new course section exists and has space
          const newCourseSection = await tx.courseSection.findUnique({
            where: { id: req.requestedCourseSectionId }
          });

          if (!newCourseSection) {
            throw new NotFoundException('Requested course section not found');
          }

          if (newCourseSection.currentEnrollment >= newCourseSection.maxEnrollment) {
            throw new ConflictException('Requested course section is at maximum enrollment');
          }

          // Update enrollments
          await tx.courseSection.update({ 
            where: { id: req.currentCourseSectionId }, 
            data: { currentEnrollment: { decrement: 1 } } 
          });
          
          await tx.courseSection.update({ 
            where: { id: req.requestedCourseSectionId }, 
            data: { currentEnrollment: { increment: 1 } } 
          });

          // Remove current course section from schedule
          await tx.scheduleCourseSection.delete({
            where: {
              scheduleId_courseSectionId: {
                scheduleId: studentSchedule.id,
                courseSectionId: req.currentCourseSectionId,
              },
            },
          });

          // Add new course section to schedule
          await tx.scheduleCourseSection.create({
            data: {
              schedule: { connect: { id: studentSchedule.id } },
              courseSection: { connect: { id: req.requestedCourseSectionId } },
            },
          });

          // Create action record
          await tx.scheduleChangeAction.create({
            data: {
              requestId: req.id,
              removedCourseSectionId: req.currentCourseSectionId,
              addedCourseSectionId: req.requestedCourseSectionId,
              actionById: user.id,
              notes: 'Course section changed',
            },
          });
        }

        // Clean up waitlist entries
        await tx.courseWaitlist.deleteMany({ 
          where: { 
            studentId: req.studentId, 
            requestId: req.id 
          } 
        });
      });

      if (dto.status === RequestStatus.APPROVED) updateData.status = RequestStatus.COMPLETED;
    } else if (dto.status === RequestStatus.APPROVED) {
      // Handle approval without immediate completion (e.g., add to waitlist)
      if (req.requestType === RequestType.ADD_COURSE && req.requestedCourseSection) {
        const avail = await this.findAvailableSections(req.requestedCourseSection.course.id, req.studentId, req.preferredTimeBlockId);
        if (!avail.length) await this.addToWaitlist(req);
      } else if (req.requestType === RequestType.CHANGE_SECTION && req.requestedCourseSection) {
        const avail = await this.findAvailableSections(req.requestedCourseSection.course.id, req.studentId, req.preferredTimeBlockId);
        if (!avail.length) await this.addToWaitlist(req);
      }
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

  async findCompleted() {
    // Return only completed requests (APPROVED and DENIED)
    return this.prisma.scheduleChangeRequest.findMany({
      where: {
        status: {
          not: RequestStatus.PENDING,
        },
      },
      include: {
        student: { include: { user: true, gradeLevel: true } },
        academicCycle: true,
        currentCourseSection: { include: { course: true, timeBlock: true } },
        requestedCourseSection: { include: { course: true } },
        preferredTimeBlock: true,
        reviewer: true,
        courseConflicts: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
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

    // Get the student's current schedule - use findFirst since we may not have academicCycleId
    const schedule = await this.prisma.schedule.findFirst({
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
      orderBy: { createdAt: 'desc' }, // Get most recent schedule
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
