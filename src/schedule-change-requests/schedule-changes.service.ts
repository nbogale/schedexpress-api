import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateScheduleChangeRequestDto } from './dto/create-schedule-change-request.dto';
import { UpdateScheduleChangeRequestDto } from './dto/update-schedule-change-request.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { RequestStatus, RequestPriority } from './enums/request-enums';

@Injectable()
export class ScheduleChangesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coursesService: CoursesService,
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
        student: { include: { user: true } },
        schoolYear: true,
        term: true,
        currentCourseSection: { include: { course: true, timeBlock: true } },
        requestedCourseSection: { include: { course: true } },
        preferredTimeBlock: true,
        reviewer: true,
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
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new BadRequestException('Only students can create schedule change requests');

    // Check if the student has this course in their schedule
    const schedule = await this.prisma.schedule.findUnique({
      where: { studentId: student.id },
      include: { courseSections: true }
    });
    
    if (!schedule) {
      throw new BadRequestException('Student does not have a schedule');
    }
    
    const hasCourse = schedule.courseSections.some(
      section => section.id === dto.currentCourseSectionId
    );
    
    if (!hasCourse) {
      throw new BadRequestException('The specified course is not in your current schedule');
    }

    const duplicate = await this.prisma.scheduleChangeRequest.findFirst({
      where: {
        studentId: student.id,
        currentCourseSectionId: dto.currentCourseSectionId,
        requestedCourseSectionId: dto.requestedCourseSectionId,
        status: RequestStatus.PENDING,
      },
    });
    if (duplicate) throw new ConflictException('You already have a pending request for this course change');

    const year = await this.prisma.schoolYear.findFirst({ where: { isCurrent: true } });
    if (!year) throw new BadRequestException('No active school year found');
    const term = await this.prisma.term.findFirst({ where: { schoolYearId: year.id, isCurrent: true } });
    if (!term) throw new BadRequestException('No active term found');

    const requestedCourseSection = await this.prisma.courseSection.findUnique({ where: { id: dto.requestedCourseSectionId }, include: { course: true } });
    if (!requestedCourseSection) throw new NotFoundException(`Requested course with ID ${dto.requestedCourseSectionId} not found`);

    // Check prerequisites
    const prereqs = await this.coursesService.getPrerequisites(requestedCourseSection.course.id);
    const prerequisiteCourses = prereqs?.prerequisites || [];
    
    if (prerequisiteCourses.length > 0) {
      const courseHistory = await this.getStudentCourseHistory(student.id);
      for (const prereq of prerequisiteCourses) {
        if (!courseHistory.some(h => h.courseId === prereq.prerequisiteCourseId && h.isPassed)) {
          const prerequisiteCourse = await this.prisma.course.findUnique({
            where: { id: prereq.prerequisiteCourseId }
          });
          throw new BadRequestException(`Missing prerequisite: ${prerequisiteCourse.name}`);
        }
      }
    }

    let preferredTimeBlockId = dto.preferredTimeBlockId;
    if (preferredTimeBlockId) {
      const tb = await this.prisma.timeBlock.findUnique({ where: { id: preferredTimeBlockId } });
      if (!tb) throw new NotFoundException(`Preferred time block with ID ${preferredTimeBlockId} not found`);
    }

    //check if the student has an existing course schedule for the preferred Time block
    const existingCourseSchedule = await this.prisma.schedule.findFirst({
      where: {
        studentId: student.id,
        courseSections: {
          some: {
            timeBlockId: preferredTimeBlockId,
          },
        },
      },
      include: {
        courseSections: true,
      },
    });

    if (existingCourseSchedule ) {
      if(existingCourseSchedule.courseSections.some(section => section.id !== dto.currentCourseSectionId)) {
       // throw new BadRequestException('You already have a course schedule for this time block');
      }
    }

    const req = await this.prisma.scheduleChangeRequest.create({
      data: {
        studentId: student.id,
        schoolYearId: year.id,
        termId: term.id,
        currentCourseSectionId: dto.currentCourseSectionId,
        requestedCourseSectionId: dto.requestedCourseSectionId,
        preferredTimeBlockId,
        reason: dto.reason,
        priority: dto.priority ?? RequestPriority.MEDIUM,
        status: RequestStatus.PENDING,
      },
    });
    return this.findOne(req.id);
  }

  async update(id: string, dto: UpdateScheduleChangeRequestDto, userId: string) {
    const req = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (req.status !== RequestStatus.PENDING) throw new BadRequestException('Cannot update a request that is no longer pending');

    const data: any = {};
    const student = await this.prisma.student.findUnique({ where: { userId } });
    
    // Check if user is a student and if so, if they're updating their own request
    if (user.role === 'STUDENT') {
      if (!student || student.id !== req.studentId) {
        throw new BadRequestException('You can only update your own schedule change requests');
      }
      
      if (dto.reason) data.reason = dto.reason;
      if (dto.preferredTimeBlockId) {
        const tb = await this.prisma.timeBlock.findUnique({ where: { id: dto.preferredTimeBlockId } });
        if (!tb) throw new NotFoundException(`Preferred time block with ID ${dto.preferredTimeBlockId} not found`);
        data.preferredTimeBlockId = tb.id;
      }
    } else { // Admin or Counselor
      if (dto.priority) data.priority = dto.priority;
      if (dto.requestedCourseId) {
        const c = await this.prisma.course.findUnique({ where: { id: dto.requestedCourseId } });
        if (!c) throw new NotFoundException(`Requested course with ID ${dto.requestedCourseId} not found`);
        data.requestedCourseId = c.id;
      }
    }

    await this.prisma.scheduleChangeRequest.update({ where: { id }, data });
    return this.findOne(id);
  }

  async processChangeRequest(id: string, dto: ProcessChangeRequestDto, userId: string) {
    const req = await this.findOne(id);
    if (req.status !== RequestStatus.PENDING) throw new BadRequestException('This request has already been processed');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!['ADMIN', 'COUNSELOR'].includes(user.role)) throw new BadRequestException('Only administrators and counselors can process schedule change requests');

    let updateData: any = { status: dto.status, resolutionNotes: dto.resolutionNotes, reviewedById: user.id };

    // Using type assertion to fix the type error
    if (([RequestStatus.APPROVED, RequestStatus.COMPLETED] as RequestStatus[]).includes(dto.status) && dto.newCourseSectionId) {
      await this.prisma.$transaction(async tx => {
        // Update course section enrollments
        await tx.courseSection.update({ 
          where: { id: req.currentCourseSectionId }, 
          data: { currentEnrollment: { decrement: 1 } } 
        });
        
        await tx.courseSection.update({ 
          where: { id: dto.newCourseSectionId }, 
          data: { currentEnrollment: { increment: 1 } } 
        });

        // Update student's schedule
        await tx.schedule.update({
          where: { studentId: req.studentId },
          data: {
            courseSections: {
              disconnect: { id: req.currentCourseSectionId },
              connect: { id: dto.newCourseSectionId }
            }
          }
        });

        // Record the action taken
        await tx.scheduleChangeAction.create({
          data: {
            requestId: req.id,
            removedCourseSectionId: req.currentCourseSectionId,
            addedCourseSectionId: dto.newCourseSectionId,
            actionById: user.id,
            notes: 'Schedule change completed',
          },
        });

        // Remove from waitlist if applicable
        await tx.courseWaitlist.deleteMany({ 
          where: { 
            studentId: req.studentId, 
            requestId: req.id 
          } 
        });
      });

      // If approved, mark as completed
      if (dto.status === RequestStatus.APPROVED) updateData.status = RequestStatus.COMPLETED;
    } else if (dto.status === RequestStatus.APPROVED) {
      // Check for available sections and add to waitlist if none are available
      const avail = await this.findAvailableSections(req.requestedCourseSection.course.id, req.studentId, req.preferredTimeBlockId);
      if (!avail.length) await this.addToWaitlist(req);
    }

    await this.prisma.scheduleChangeRequest.update({ where: { id }, data: updateData });
    return this.findOne(id);
  }

  async cancelChangeRequest(id: string, userId: string) {
    const req = await this.findOne(id);
    if (!([RequestStatus.PENDING, RequestStatus.APPROVED] as RequestStatus[]).includes(req.status)) {
      throw new BadRequestException('This request can no longer be canceled');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    if (user.role === 'STUDENT') {
      const student = await this.prisma.student.findUnique({ where: { userId } });
      if (!student || student.id !== req.studentId) {
        throw new BadRequestException('You can only cancel your own schedule change requests');
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
    
    if (!newSection) throw new NotFoundException(`Course section with ID ${sectionId} not found`);

    // Get the student's current schedule
    const schedule = await this.prisma.schedule.findUnique({
      where: { studentId },
      include: { 
        courseSections: {
          include: { timeBlock: true }
        } 
      },
    });
    
    // Check if any current sections have the same time block as the new section
    return schedule.courseSections.some(s => s.timeBlockId === newSection.timeBlockId);
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
