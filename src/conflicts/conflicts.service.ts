import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictType } from '@prisma/client';

@Injectable()
export class ConflictsService {
  constructor(private readonly prisma: PrismaService) {}

  async createConflict(data: {
    description: string;
    courseId: string;
    requestId: string;
    type: ConflictType;
  }) {
    return this.prisma.conflict.create({
      data: {
        ...data,
        resolved: false,
      },
    });
  }

  async detectConflicts(studentId: string, currentCourseId: string, newCourseId: string, requestId: string) {
    const conflicts = [];

    // Get schedule and student
    const schedule = await this.prisma.schedule.findUnique({
      where: { studentId },
      include: {
        courses: true,
      },
    });

    // Get settings
    const settings = await this.prisma.settings.findFirst();
    const allowConflicts = settings?.allowConflicts || false;

    // Get the current and new courses
    const [currentCourse, newCourse] = await Promise.all([
      this.prisma.course.findUnique({ where: { id: currentCourseId } }),
      this.prisma.course.findUnique({ where: { id: newCourseId } }),
    ]);

    // Check for existing period conflict
    const potentialPeriodConflict = schedule.courses.find(
      course => course.period === newCourse.period && course.id !== currentCourseId
    );

    if (potentialPeriodConflict) {
      conflicts.push({
        description: `Period conflict with ${potentialPeriodConflict.name} (Period ${potentialPeriodConflict.period})`,
        courseId: potentialPeriodConflict.id,
        requestId,
        type: ConflictType.SCHEDULE_OVERLAP,
      });
    }

    // Check for capacity conflict
    if (newCourse.currentEnrollment >= newCourse.capacity) {
      conflicts.push({
        description: `${newCourse.name} is at capacity (${newCourse.currentEnrollment}/${newCourse.capacity})`,
        courseId: newCourse.id,
        requestId,
        type: ConflictType.CAPACITY,
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
    return this.prisma.conflict.findMany({
      include: {
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
      },
    });
  }

  async findByRequest(requestId: string) {
    return this.prisma.conflict.findMany({
      where: { requestId },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async resolveConflict(id: string) {
    return this.prisma.conflict.update({
      where: { id },
      data: { resolved: true },
    });
  }
}
