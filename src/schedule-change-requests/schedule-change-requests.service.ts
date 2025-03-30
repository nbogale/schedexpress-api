import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ConflictsService } from '../conflicts/conflicts.service';
import { NotificationType, RequestStatus } from '@prisma/client';

@Injectable()
export class ScheduleChangeRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly conflictsService: ConflictsService,
  ) {}

  async create(createRequestDto: CreateRequestDto) {
    const { studentId, currentCourseId, newCourseId } = createRequestDto;

    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        schedule: {
          include: {
            courses: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Check if student has a schedule
    if (!student.schedule) {
      throw new BadRequestException('Student does not have a schedule');
    }

    // Check if current course is in student's schedule
    const hasCourse = student.schedule.courses.some(
      course => course.id === currentCourseId
    );

    if (!hasCourse) {
      throw new BadRequestException('Current course is not in student\'s schedule');
    }

    // Check if courses exist
    const [currentCourse, newCourse] = await Promise.all([
      this.prisma.course.findUnique({ where: { id: currentCourseId } }),
      this.prisma.course.findUnique({ where: { id: newCourseId } }),
    ]);

    if (!currentCourse) {
      throw new NotFoundException(`Current course with ID ${currentCourseId} not found`);
    }

    if (!newCourse) {
      throw new NotFoundException(`New course with ID ${newCourseId} not found`);
    }

    // Check if new course is already in student's schedule
    const hasNewCourse = student.schedule.courses.some(
      course => course.id === newCourseId
    );

    if (hasNewCourse) {
      throw new BadRequestException('New course is already in student\'s schedule');
    }

    // Create change request
    const request = await this.prisma.scheduleChangeRequest.create({
      data: createRequestDto,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        currentCourse: true,
        newCourse: true,
      },
    });

    // Detect conflicts
    await this.conflictsService.detectConflicts(
      studentId,
      currentCourseId,
      newCourseId,
      request.id
    );

    // Notify counselors
    const counselors = await this.prisma.counselor.findMany({
      include: {
        user: true,
      },
    });

    for (const counselor of counselors) {
      await this.notificationsService.createNotification({
        counselorId: counselor.id,
        message: `New schedule change request from ${student.user.name}: ${currentCourse.name} to ${newCourse.name}`,
        type: NotificationType.REQUEST_UPDATE,
      });
    }

    return request;
  }

  async findAll() {
    return this.prisma.scheduleChangeRequest.findMany({
      include: {
        student: {
          include: {
            user: true,
          },
        },
        counselor: {
          include: {
            user: true,
          },
        },
        currentCourse: true,
        newCourse: true,
        conflicts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPending() {
    return this.prisma.scheduleChangeRequest.findMany({
      where: { status: RequestStatus.PENDING },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        currentCourse: true,
        newCourse: true,
        conflicts: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.scheduleChangeRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        counselor: {
          include: {
            user: true,
          },
        },
        currentCourse: true,
        newCourse: true,
        conflicts: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    return request;
  }

  async findByStudent(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.prisma.scheduleChangeRequest.findMany({
      where: { studentId },
      include: {
        counselor: {
          include: {
            user: true,
          },
        },
        currentCourse: true,
        newCourse: true,
        conflicts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateRequestDto: UpdateRequestDto, userId: string) {
    const { status, counselorId, comments } = updateRequestDto;

    // Check if request exists
    const request = await this.prisma.scheduleChangeRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        currentCourse: true,
        newCourse: true,
        conflicts: {
          where: { resolved: false },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        counselor: true,
      },
    });

    // Ensure counselor exists if provided
    if (counselorId) {
      const counselor = await this.prisma.counselor.findUnique({
        where: { id: counselorId },
      });

      if (!counselor) {
        throw new NotFoundException(`Counselor with ID ${counselorId} not found`);
      }
    }

    // Handle approval
    if (status === RequestStatus.APPROVED) {
      // Check if there are unresolved conflicts
      if (request.conflicts.length > 0) {
        throw new ConflictException('Cannot approve request with unresolved conflicts');
      }

      // Check if new course has capacity
      const newCourse = await this.prisma.course.findUnique({
        where: { id: request.newCourseId },
      });

      if (newCourse.currentEnrollment >= newCourse.capacity) {
        throw new ConflictException(`New course ${newCourse.name} is at capacity`);
      }

      // Get student schedule
      const schedule = await this.prisma.schedule.findUnique({
        where: { studentId: request.studentId },
      });

      // Update schedule with new course
      await this.prisma.$transaction(async (prisma) => {
        // Update request
        await prisma.scheduleChangeRequest.update({
          where: { id },
          data: {
            status,
            counselorId: counselorId || (user.counselor ? user.counselor.id : null),
            comments,
          },
        });

        // Update schedule by swapping courses
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            courses: {
              disconnect: { id: request.currentCourseId },
              connect: { id: request.newCourseId },
            },
          },
        });

        // Update course enrollments
        await prisma.course.update({
          where: { id: request.currentCourseId },
          data: { currentEnrollment: { decrement: 1 } },
        });

        await prisma.course.update({
          where: { id: request.newCourseId },
          data: { currentEnrollment: { increment: 1 } },
        });

        // Create notification for student
        await this.notificationsService.createNotification({
          studentId: request.studentId,
          message: `Your request to change from ${request.currentCourse.name} to ${request.newCourse.name} has been approved`,
          type: NotificationType.REQUEST_APPROVED,
        });
      });
    } else if (status === RequestStatus.DENIED) {
      // Update request
      await this.prisma.scheduleChangeRequest.update({
        where: { id },
        data: {
          status,
          counselorId: counselorId || (user.counselor ? user.counselor.id : null),
          comments,
        },
      });

      // Create notification for student
      await this.notificationsService.createNotification({
        studentId: request.studentId,
        message: `Your request to change from ${request.currentCourse.name} to ${request.newCourse.name} has been denied${comments ? ': ' + comments : ''}`,
        type: NotificationType.REQUEST_DENIED,
      });
    } else {
      // For comment updates only
      await this.prisma.scheduleChangeRequest.update({
        where: { id },
        data: {
          counselorId: counselorId || (user.counselor ? user.counselor.id : null),
          comments,
        },
      });

      // Notify student of update
      await this.notificationsService.createNotification({
        studentId: request.studentId,
        message: `Your schedule change request has been updated`,
        type: NotificationType.REQUEST_UPDATE,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // Check if request exists
    const request = await this.prisma.scheduleChangeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    // Delete associated conflicts first
    await this.prisma.conflict.deleteMany({
      where: { requestId: id },
    });

    // Delete request
    await this.prisma.scheduleChangeRequest.delete({
      where: { id },
    });

    return { id, deleted: true };
  }
}
