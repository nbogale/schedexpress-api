import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictType } from '@prisma/client';
import { CreateCourseConflictDto } from './dto/create-course-conflict.dto';

@Injectable()
export class ConflictsService {
  constructor(private readonly prisma: PrismaService) {}

  async createConflict(data: CreateCourseConflictDto) {
    return this.prisma.courseConflict.create({
      data: {
        ...data,
        isResolvable: false,
      },
    });
  }

  async detectConflicts(studentId: string, currentCourseId: string, newCourseId: string, requestId: string) {
    const conflicts = [];

    // Get schedule and student - use findFirst since studentId is no longer unique
    const schedule = await this.prisma.schedule.findFirst({
      where: { studentId },
      include: {
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
      orderBy: { createdAt: 'desc' }, // Get most recent schedule
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule for student ${studentId} not found`);
    }

    // Get settings
    const settings = await this.prisma.settings.findFirst();
    const allowConflicts = settings?.allowConflicts || false;

    // Get the current and new courses
    const [currentCourse, newCourse] = await Promise.all([
      this.prisma.courseSection.findUnique({ where: { id: currentCourseId } , include: {course: true}}),
      this.prisma.courseSection.findUnique({ where: { id: newCourseId } , include: {course: true}}),
    ]);

    // Check for existing period conflict
    const potentialPeriodConflict = schedule.scheduleCourseSections.find(
      scs => scs.courseSection.timeBlockId === newCourse.timeBlockId
    );

    if (potentialPeriodConflict) {
      conflicts.push({
        description: `Period conflict with ${potentialPeriodConflict.courseSection.course.name} (Period ${potentialPeriodConflict.courseSection.timeBlockId})`,
        courseId: potentialPeriodConflict.courseSection.id,
        requestId,
        type: ConflictType.SCHEDULE_OVERLAP,
      });
    }

    // Check for capacity conflict
    if (newCourse.currentEnrollment >= newCourse.maxEnrollment) {
      conflicts.push({
        description: `${newCourse.courseId} is at capacity (${newCourse.currentEnrollment}/${newCourse.maxEnrollment})`,
        courseId: newCourse.id,
        requestId,
        type: ConflictType.MAX_ENROLLMENT_REACHED,
      });
    }

    // Create all detected conflicts in the database if not allowing conflicts
    if (!allowConflicts && conflicts.length > 0) {
      await Promise.all(
        conflicts.map(conflict => this.createConflict(conflict))
      );
    }

    return conflicts;
  }

  async findAll() {
    return this.prisma.courseConflict.findMany({
      //TODO: revisit the below condition
     /*  include: {
        course: true,
        request: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            currentCourse: true,
            newCourse: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      }, */
    });
  }

  async findByRequest(requestId: string) {
    return this.prisma.courseConflict.findMany({
      where: { requestId },
     /*  include: {
        course: true,
      }, */
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async resolveConflict(id: string) {
    return this.prisma.courseConflict.update({
      where: { id },
      data: { isResolvable: true },
    });
  }
}
