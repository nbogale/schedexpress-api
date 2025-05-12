import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ConflictsService } from '../course-conflicts/conflicts.service';
import { NotificationType, RequestStatus, UserRole } from '@prisma/client';

@Injectable()
export class ScheduleChangeRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly conflictsService: ConflictsService,
  ) {}

  async create(createRequestDto: CreateRequestDto) {
    const { studentId, currentCourseSectionId, requestedCourseId } = createRequestDto;

    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        schedule: {
          include: {
            courseSections: true,
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
    const hasCourse = student.schedule.courseSections.some(
      course => course.id === currentCourseSectionId
    );

    if (!hasCourse) {
      throw new BadRequestException('Current course is not in student\'s schedule');
    }

    // Check if courses exist
    const [currentCourse, newCourse] = await Promise.all([
      this.prisma.courseSection.findUnique({ where: { id: currentCourseSectionId } , include: {course: true}}),
      this.prisma.courseSection.findUnique({ where: { id: requestedCourseId } , include: {course: true}}),
    ]);

    if (!currentCourse) {
      throw new NotFoundException(`Current course with ID ${currentCourseSectionId} not found`);
    }

    if (!newCourse) {
      throw new NotFoundException(`New course with ID ${requestedCourseId} not found`);
    }

    // Check if new course is already in student's schedule
    const hasNewCourse = student.schedule.courseSections.some(
      course => course.id === requestedCourseId
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
        currentCourseSection: true,
        requestedCourse: true,
      },
    });

    // Detect conflicts
    await this.conflictsService.detectConflicts(
      studentId,
      currentCourseSectionId,
      requestedCourseId,
      request.id
    );

    // Notify counselors
    const counselors = await this.prisma.user.findMany({
      where: {
        role: UserRole.COUNSELOR,
      },
    });
    //TODO: do we need to loop through counselors?
    for (const counselor of counselors) {
      await this.notificationsService.createNotification({
        counselorId: counselor.id,
        message: `New schedule change request from ${student.user.firstName} ${student.user.lastName}: ${currentCourse.course.name} to ${newCourse.course.name}`,
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
        currentCourseSection: true,
        requestedCourse: true,
        courseConflicts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: string) {
    // First get the user to determine role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // If student, get their schedule and requests
    if (user.role === UserRole.STUDENT && user.student) {
      // Get the student's schedule
      const schedule = await this.prisma.schedule.findUnique({
        where: { studentId: user.student.id },
        include: {
          courseSections: true,
        },
      });

      // Get the student's requests
      const requests = await this.prisma.scheduleChangeRequest.findMany({
        where: { studentId: user.student.id },
        include: {
          currentCourseSection: true,
          requestedCourse: true,
          courseConflicts: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        schedule,
        requests,
      };
    }

    // For counselors or admins, return pending requests
    return this.findPending();
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
        currentCourseSection: true,
        requestedCourse: true,
        courseConflicts: true,
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
        currentCourseSection: true,
        requestedCourse: true,
        courseConflicts: true,
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
        currentCourseSection: true,
        requestedCourse: true,
        courseConflicts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateRequestDto: UpdateRequestDto, userId: string) {
    const { status, reviewedById, resolutionNotes } = updateRequestDto;

    // Check if request exists
    const request = await this.prisma.scheduleChangeRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        currentCourseSection: {
          include: {
            course: true,
          },
        },
        requestedCourse: true,
        courseConflicts: {
          where: { isResolvable: false },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      /* include: {
        counselor: true,
      }, */
    });

    // Ensure counselor exists if provided
    if (reviewedById) {
      const counselor = await this.prisma.user.findUnique({
        where: { id: reviewedById, role: UserRole.COUNSELOR },
      });

      if (!counselor) {
        throw new NotFoundException(`Counselor with ID ${reviewedById} not found`);
      }
    }

    // Handle approval
    if (status === RequestStatus.APPROVED) {
      // Check if there are unresolved conflicts
      if (request.courseConflicts.length > 0) {
        throw new ConflictException('Cannot approve request with unresolved conflicts');
      }

      // Check if new course has capacity
      const newCourse = await this.prisma.courseSection.findUnique({
        where: { id: request.requestedCourseId },
        include: {
          course: true,
        },
      });

      if (newCourse.currentEnrollment >= newCourse.maxEnrollment) {
        throw new ConflictException(`New course ${newCourse.course.name} is at capacity`);
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
            reviewedById,
            resolutionNotes,
          },
        });

        // Update schedule by swapping courses
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            courseSections: {
              disconnect: { id: request.currentCourseSectionId },
              connect: { id: request.requestedCourseId },
            },
          },
        });

        // Update course enrollments
        await prisma.courseSection.update({
          where: { id: request.currentCourseSectionId },
          data: { currentEnrollment: { decrement: 1 } },
        });

        await prisma.courseSection.update({
          where: { id: request.requestedCourseId },
          data: { currentEnrollment: { increment: 1 } },
        });

        // Create notification for student
        await this.notificationsService.createNotification({
          studentId: request.studentId,
          message: `Your request to change from ${request.currentCourseSection.course.name} to ${request.requestedCourse.name} has been approved`,
          type: NotificationType.REQUEST_APPROVED,
        });
      });
    } else if (status === RequestStatus.DENIED) {
      // Update request
      await this.prisma.scheduleChangeRequest.update({
        where: { id },
        data: {
          status,
          reviewedById,
          resolutionNotes,
        },
      });

      // Create notification for student
      await this.notificationsService.createNotification({
        studentId: request.studentId,
        message: `Your request to change from ${request.currentCourseSection.course.name} to ${request.requestedCourse.name} has been denied${resolutionNotes ? ': ' + resolutionNotes : ''}`,
        type: NotificationType.REQUEST_DENIED,
      });
    } else {
      // For comment updates only
      await this.prisma.scheduleChangeRequest.update({
        where: { id },
        data: {
          reviewedById,
          resolutionNotes,
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
    await this.prisma.courseConflict.deleteMany({
      where: { requestId: id },
    });

    // Delete request
    await this.prisma.scheduleChangeRequest.delete({
      where: { id },
    });

    return { id, deleted: true };
  }
}
