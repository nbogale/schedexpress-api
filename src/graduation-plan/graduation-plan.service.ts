import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGraduationPlanDto } from './dto/create-graduation-plan.dto';
import { UpdateGraduationPlanDto } from './dto/update-graduation-plan.dto';
import { AddCourseToPlanDto } from './dto/add-course-to-plan.dto';
import { SubstituteCourseDto } from './dto/substitute-course.dto';
import { RejectPlanDto } from './dto/reject-plan.dto';
import { CreatePlanNoteDto } from './dto/create-plan-note.dto';
import { PlanStatus, PlanType, PlanHistoryAction, PlannedCourseStatus, Prisma } from '@prisma/client';
import { ErrorCode } from '../common/error-codes';
import { ApiErrorResponseBuilder } from '../common/api-error-builder';

@Injectable()
export class GraduationPlanService {
  private readonly logger = new Logger(GraduationPlanService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // Plan CRUD Operations
  // ============================================

  async createPlan(createDto: CreateGraduationPlanDto, userId: string) {
    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id: createDto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check for existing plan for this student and graduation year
    const existingPlan = await this.prisma.graduationPlan.findFirst({
      where: {
        studentId: createDto.studentId,
        graduationYear: createDto.graduationYear,
        status: { not: PlanStatus.ARCHIVED },
      },
      orderBy: { version: 'desc' },
    });

    const version = existingPlan ? existingPlan.version + 1 : 1;

    const plan = await this.prisma.graduationPlan.create({
      data: {
        studentId: createDto.studentId,
        graduationYear: createDto.graduationYear,
        planName: createDto.planName,
        planType: createDto.planType || PlanType.STANDARD,
        notes: createDto.notes,
        goals: createDto.goals,
        version,
        status: PlanStatus.DRAFT,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        planCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    // Create history entry
    await this.prisma.graduationPlanHistory.create({
      data: {
        planId: plan.id,
        action: PlanHistoryAction.CREATED,
        performedBy: userId,
        notes: 'Plan created',
      },
    });

    return plan;
  }

  async getPlan(planId: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        planCourses: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
            plannedAcademicCycle: true,
            completedCourseHistory: {
              include: {
                course: true,
              },
            },
          },
          orderBy: [
            { plannedYear: 'asc' },
            { plannedGrade: 'asc' },
            { priority: 'desc' },
          ],
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        rejector: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        history: {
          include: {
            performer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { performedAt: 'desc' },
        },
        planNotes: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            completer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async getPlansByStudent(studentId: string, graduationYear?: number) {
    const where: Prisma.GraduationPlanWhereInput = {
      studentId,
    };

    if (graduationYear) {
      where.graduationYear = graduationYear;
    }

    return await this.prisma.graduationPlan.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        planCourses: {
          include: {
            course: true,
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { graduationYear: 'desc' },
        { version: 'desc' },
      ],
    });
  }

  async getActivePlan(studentId: string) {
    return await this.prisma.graduationPlan.findFirst({
      where: {
        studentId,
        isActive: true,
        status: PlanStatus.ACTIVE,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        planCourses: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
            plannedAcademicCycle: true,
            completedCourseHistory: {
              include: {
                course: true,
              },
            },
          },
          orderBy: [
            { plannedYear: 'asc' },
            { plannedGrade: 'asc' },
            { priority: 'desc' },
          ],
        },
      },
    });
  }

  async updatePlan(planId: string, updateDto: UpdateGraduationPlanDto, userId: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== PlanStatus.DRAFT && plan.status !== PlanStatus.REJECTED) {
      throw new BadRequestException('Can only update plans in DRAFT or REJECTED status');
    }

    const updatedPlan = await this.prisma.graduationPlan.update({
      where: { id: planId },
      data: {
        planName: updateDto.planName,
        planType: updateDto.planType,
        notes: updateDto.notes,
        goals: updateDto.goals,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        planCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    // Create history entry
    await this.prisma.graduationPlanHistory.create({
      data: {
        planId: updatedPlan.id,
        action: PlanHistoryAction.UPDATED,
        performedBy: userId,
        notes: 'Plan updated',
      },
    });

    return updatedPlan;
  }

  // ============================================
  // Course Management
  // ============================================

  async addCourseToPlan(planId: string, addCourseDto: AddCourseToPlanDto, userId: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== PlanStatus.DRAFT && plan.status !== PlanStatus.REJECTED) {
      throw new BadRequestException('Can only modify courses in DRAFT or REJECTED plans');
    }

    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: addCourseDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if course already exists in plan for the same academic cycle
    if (addCourseDto.plannedAcademicCycleId) {
      const existing = await this.prisma.graduationPlanCourse.findUnique({
        where: {
          planId_courseId_plannedAcademicCycleId: {
            planId,
            courseId: addCourseDto.courseId,
            plannedAcademicCycleId: addCourseDto.plannedAcademicCycleId,
          },
        },
      });

      if (existing) {
        throw new BadRequestException('Course already exists in plan for this academic cycle');
      }
    }

    const planCourse = await this.prisma.graduationPlanCourse.create({
      data: {
        planId,
        courseId: addCourseDto.courseId,
        plannedAcademicCycleId: addCourseDto.plannedAcademicCycleId,
        plannedYear: addCourseDto.plannedYear,
        plannedGrade: addCourseDto.plannedGrade,
        priority: addCourseDto.priority || 0,
        notes: addCourseDto.notes,
        isRequired: addCourseDto.isRequired || false,
        isElective: addCourseDto.isElective !== undefined ? addCourseDto.isElective : true,
        status: PlannedCourseStatus.PLANNED,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        plannedAcademicCycle: true,
      },
    });

    // Create history entry
    await this.prisma.graduationPlanHistory.create({
      data: {
        planId,
        action: PlanHistoryAction.COURSE_ADDED,
        performedBy: userId,
        changes: {
          courseId: addCourseDto.courseId,
          courseName: course.name,
          courseCode: course.code,
        },
        notes: `Added course: ${course.code} - ${course.name}`,
      },
    });

    return planCourse;
  }

  async removeCourseFromPlan(planId: string, courseId: string, userId: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== PlanStatus.DRAFT && plan.status !== PlanStatus.REJECTED) {
      throw new BadRequestException('Can only modify courses in DRAFT or REJECTED plans');
    }

    const planCourse = await this.prisma.graduationPlanCourse.findFirst({
      where: {
        planId,
        courseId,
      },
      include: {
        course: true,
      },
    });

    if (!planCourse) {
      throw new NotFoundException('Course not found in plan');
    }

    await this.prisma.graduationPlanCourse.delete({
      where: { id: planCourse.id },
    });

    // Create history entry
    await this.prisma.graduationPlanHistory.create({
      data: {
        planId,
        action: PlanHistoryAction.COURSE_REMOVED,
        performedBy: userId,
        changes: {
          courseId,
          courseName: planCourse.course.name,
          courseCode: planCourse.course.code,
        },
        notes: `Removed course: ${planCourse.course.code} - ${planCourse.course.name}`,
      },
    });
  }

  async substituteCourseInPlan(
    planId: string,
    substituteDto: SubstituteCourseDto,
    userId: string,
  ) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== PlanStatus.DRAFT && plan.status !== PlanStatus.REJECTED) {
      throw new BadRequestException('Can only modify courses in DRAFT or REJECTED plans');
    }

    // Find the old course in plan
    const oldPlanCourse = await this.prisma.graduationPlanCourse.findFirst({
      where: {
        planId,
        courseId: substituteDto.oldCourseId,
      },
      include: {
        course: true,
      },
    });

    if (!oldPlanCourse) {
      throw new NotFoundException('Old course not found in plan');
    }

    // Verify new course exists
    const newCourse = await this.prisma.course.findUnique({
      where: { id: substituteDto.newCourseId },
    });

    if (!newCourse) {
      throw new NotFoundException('New course not found');
    }

    // Update the plan course
    const updatedPlanCourse = await this.prisma.graduationPlanCourse.update({
      where: { id: oldPlanCourse.id },
      data: {
        courseId: substituteDto.newCourseId,
        status: PlannedCourseStatus.SUBSTITUTED,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        plannedAcademicCycle: true,
      },
    });

    // Create history entry
    await this.prisma.graduationPlanHistory.create({
      data: {
        planId,
        action: PlanHistoryAction.COURSE_SUBSTITUTED,
        performedBy: userId,
        changes: {
          oldCourseId: substituteDto.oldCourseId,
          oldCourseName: oldPlanCourse.course.name,
          oldCourseCode: oldPlanCourse.course.code,
          newCourseId: substituteDto.newCourseId,
          newCourseName: newCourse.name,
          newCourseCode: newCourse.code,
        },
        notes: `Substituted ${oldPlanCourse.course.code} with ${newCourse.code}`,
      },
    });

    return updatedPlanCourse;
  }

  // ============================================
  // Approval Workflow
  // ============================================

  async submitPlanForApproval(planId: string, userId: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
      include: {
        planCourses: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== PlanStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT plans can be submitted for approval');
    }

    if (!plan.planCourses || plan.planCourses.length === 0) {
      throw new BadRequestException('Cannot submit plan without courses');
    }

    const updatedPlan = await this.prisma.graduationPlan.update({
      where: { id: planId },
      data: {
        status: PlanStatus.SUBMITTED,
        submittedBy: userId,
        submittedAt: new Date(),
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        planCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    // Create history entry
    await this.prisma.graduationPlanHistory.create({
      data: {
        planId,
        action: PlanHistoryAction.SUBMITTED,
        performedBy: userId,
        notes: 'Plan submitted for approval',
      },
    });

    return updatedPlan;
  }

  async approvePlan(planId: string, userId: string, approvalNote?: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== PlanStatus.SUBMITTED) {
      throw new BadRequestException('Only SUBMITTED plans can be approved');
    }

    // Deactivate any other active plans for this student
    await this.prisma.graduationPlan.updateMany({
      where: {
        studentId: plan.studentId,
        isActive: true,
      },
      data: {
        isActive: false,
        status: PlanStatus.ARCHIVED,
      },
    });

    const updatedPlan = await this.prisma.graduationPlan.update({
      where: { id: planId },
      data: {
        status: PlanStatus.ACTIVE,
        approvedBy: userId,
        approvedAt: new Date(),
        isActive: true,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        planCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    // Create history entry with approval note if provided
    await this.prisma.graduationPlanHistory.create({
      data: {
        planId,
        action: PlanHistoryAction.APPROVED,
        performedBy: userId,
        notes: approvalNote || 'Plan approved',
      },
    });

    // Create activation history entry
    await this.prisma.graduationPlanHistory.create({
      data: {
        planId,
        action: PlanHistoryAction.ACTIVATED,
        performedBy: userId,
        notes: 'Plan activated',
      },
    });

    return updatedPlan;
  }

  async rejectPlan(planId: string, rejectDto: RejectPlanDto, userId: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== PlanStatus.SUBMITTED) {
      throw new BadRequestException('Only SUBMITTED plans can be rejected');
    }

    const updatedPlan = await this.prisma.graduationPlan.update({
      where: { id: planId },
      data: {
        status: PlanStatus.REJECTED,
        rejectedBy: userId,
        rejectedAt: new Date(),
        rejectionReason: rejectDto.reason,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        rejector: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        planCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    // Create history entry
    await this.prisma.graduationPlanHistory.create({
      data: {
        planId,
        action: PlanHistoryAction.REJECTED,
        performedBy: userId,
        notes: `Plan rejected: ${rejectDto.reason}`,
      },
    });

    return updatedPlan;
  }

  // ============================================
  // Plan Notes
  // ============================================

  async addNoteToPlan(planId: string, noteDto: CreatePlanNoteDto, userId: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return await this.prisma.planNote.create({
      data: {
        planId,
        note: noteDto.note,
        isActionItem: noteDto.isActionItem || false,
        planVersion: noteDto.planVersion,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getPlanNotes(planId: string) {
    return await this.prisma.planNote.findMany({
      where: { planId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        completer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async completeActionItem(noteId: string, userId: string) {
    const note = await this.prisma.planNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (!note.isActionItem) {
      throw new BadRequestException('Note is not an action item');
    }

    if (note.completed) {
      throw new BadRequestException('Action item already completed');
    }

    return await this.prisma.planNote.update({
      where: { id: noteId },
      data: {
        completed: true,
        completedAt: new Date(),
        completedBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        completer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // ============================================
  // Plan Validation & Sync
  // ============================================

  async validatePlanPrerequisites(planId: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
      include: {
        planCourses: {
          include: {
            course: {
              include: {
                prerequisites: {
                  include: {
                    prerequisiteCourse: true,
                  },
                },
              },
            },
            plannedAcademicCycle: true,
          },
          orderBy: [
            { plannedYear: 'asc' },
            { plannedGrade: 'asc' },
          ],
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const issues: Array<{
      courseId: string;
      courseName: string;
      courseCode: string;
      issue: string;
      severity: 'ERROR' | 'WARNING';
    }> = [];

    // Check prerequisites for each planned course
    for (const planCourse of plan.planCourses) {
      if (!planCourse.course.prerequisites || planCourse.course.prerequisites.length === 0) {
        continue;
      }

      // Get courses planned before this one
      const coursesBefore = plan.planCourses.filter((pc) => {
        if (!planCourse.plannedYear || !pc.plannedYear) return false;
        if (!planCourse.plannedGrade || !pc.plannedGrade) return false;
        
        return (
          pc.plannedYear < planCourse.plannedYear ||
          (pc.plannedYear === planCourse.plannedYear && pc.plannedGrade < planCourse.plannedGrade)
        );
      });

      // Check each prerequisite
      for (const prereq of planCourse.course.prerequisites) {
        const prereqCourseId = prereq.prerequisiteCourseId;
        const prereqFound = coursesBefore.some(
          (pc) => pc.courseId === prereqCourseId,
        );

        // Also check if student has completed the prerequisite
        const studentCompleted = await this.prisma.studentCourseHistory.findFirst({
          where: {
            studentId: plan.studentId,
            courseId: prereqCourseId,
            isPassed: true,
          },
        });

        if (!prereqFound && !studentCompleted) {
          const prereqCourse = prereq.prerequisiteCourse;
          issues.push({
            courseId: planCourse.courseId,
            courseName: planCourse.course.name,
            courseCode: planCourse.course.code,
            issue: `Missing prerequisite: ${prereqCourse?.code || prereqCourseId}`,
            severity: 'ERROR',
          });
        }
      }
    }

    return {
      planId,
      isValid: issues.filter((i) => i.severity === 'ERROR').length === 0,
      issues,
    };
  }

  async syncPlanWithProgress(planId: string) {
    const plan = await this.prisma.graduationPlan.findUnique({
      where: { id: planId },
      include: {
        planCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Get student's course history
    const courseHistory = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId: plan.studentId,
        isPassed: true,
      },
      include: {
        course: true,
      },
    });

    // Update plan course statuses
    for (const planCourse of plan.planCourses) {
      const completedHistory = courseHistory.find(
        (ch) => ch.courseId === planCourse.courseId && ch.isPassed,
      );

      if (completedHistory) {
        await this.prisma.graduationPlanCourse.update({
          where: { id: planCourse.id },
          data: {
            status: PlannedCourseStatus.COMPLETED,
            completedCourseHistoryId: completedHistory.id,
          },
        });
      }
    }

    return await this.getPlan(planId);
  }
}
