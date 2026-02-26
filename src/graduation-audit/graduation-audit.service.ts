import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GradeLookupService } from '../grade-lookup/grade-lookup.service';
import { CreateGraduationRequirementDto } from './dto/create-graduation-requirement.dto';
import { UpdateGraduationRequirementDto } from './dto/update-graduation-requirement.dto';
import { RunAuditDto } from './dto/run-audit.dto';
import { AllocateCourseDto } from './dto/allocate-course.dto';
import { WaiveRequirementDto } from './dto/waive-requirement.dto';
import { CreateAuditNoteDto } from './dto/create-audit-note.dto';
import { 
  RequirementType, 
  AuditStatus,
  Prisma 
} from '@prisma/client';

// OverallAuditStatus is not in Prisma schema (it's a computed value)
export enum OverallAuditStatus {
  ELIGIBLE = 'ELIGIBLE',
  NOT_YET = 'NOT_YET',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}
import { ErrorCode } from '../common/error-codes';
import { ApiErrorResponseBuilder } from '../common/api-error-builder';

export interface AuditResult {
  auditId?: string;
  requirementId: string;
  requirementName: string;
  status: AuditStatus;
  currentValue: number;
  requiredValue: number;
  deficiency?: number;
  details?: any;
}

export interface AuditSummary {
  studentId: string;
  graduationYear: number;
  overallStatus: OverallAuditStatus;
  totalRequirements: number;
  metRequirements: number;
  notMetRequirements: number;
  partialRequirements: number;
  inProgressRequirements: number;
  waivedRequirements: number;
  exceptionRequirements: number;
  audits: AuditResult[];
}

export interface DetailedAuditBreakdown {
  requirementId: string;
  requirementName: string;
  status: AuditStatus;
  currentValue: number;
  requiredValue: number;
  deficiency?: number;
  coursesCounted: Array<{
    courseHistoryId: string;
    courseName: string;
    courseCode: string;
    credits: number;
    allocationReason?: string;
  }>;
  excludedCourses: Array<{
    courseHistoryId: string;
    courseName: string;
    courseCode: string;
    reason: string;
  }>;
  details?: any;
}

@Injectable()
export class GraduationAuditService {
  private readonly logger = new Logger(GraduationAuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gradeLookupService: GradeLookupService,
  ) {}

  // ============================================
  // Graduation Requirement Management
  // ============================================

  async createRequirement(createDto: CreateGraduationRequirementDto, createdBy?: string) {
    try {
      const requirement = await this.prisma.graduationRequirement.create({
        data: {
          name: createDto.name,
          description: createDto.description,
          requirementType: createDto.requirementType,
          requirementCategory: createDto.requirementCategory,
          requiredCredits: createDto.requiredCredits ? new Prisma.Decimal(createDto.requiredCredits) : null,
          requiredCourseId: createDto.requiredCourseId,
          alternativeCourseIds: createDto.alternativeCourseIds ? createDto.alternativeCourseIds : null,
          requiresLabBased: createDto.requiresLabBased ?? false,
          requiresLifeScience: createDto.requiresLifeScience ?? false,
          requiresPhysicalScience: createDto.requiresPhysicalScience ?? false,
          minimumGPA: createDto.minimumGPA ? new Prisma.Decimal(createDto.minimumGPA) : null,
          assessmentAlternatives: createDto.assessmentAlternatives ? createDto.assessmentAlternatives : null,
          priority: createDto.priority ?? 0,
          isActive: createDto.isActive ?? true,
          createdBy: createdBy || null,
        },
        include: {
          requiredCourse: {
            include: {
              department: true,
            },
          },
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

      return requirement;
    } catch (error) {
      this.logger.error(`Error creating graduation requirement: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create graduation requirement: ${error.message}`);
    }
  }

  async updateRequirement(id: string, updateDto: UpdateGraduationRequirementDto) {
    const requirement = await this.prisma.graduationRequirement.findUnique({
      where: { id },
    });

    if (!requirement) {
      throw new NotFoundException('Graduation requirement not found');
    }

    const updateData: any = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.requirementType !== undefined) updateData.requirementType = updateDto.requirementType;
    if (updateDto.requirementCategory !== undefined) updateData.requirementCategory = updateDto.requirementCategory;
    if (updateDto.requiredCredits !== undefined) updateData.requiredCredits = new Prisma.Decimal(updateDto.requiredCredits);
    if (updateDto.requiredCourseId !== undefined) updateData.requiredCourseId = updateDto.requiredCourseId;
    if (updateDto.alternativeCourseIds !== undefined) updateData.alternativeCourseIds = updateDto.alternativeCourseIds;
    if (updateDto.requiresLabBased !== undefined) updateData.requiresLabBased = updateDto.requiresLabBased;
    if (updateDto.requiresLifeScience !== undefined) updateData.requiresLifeScience = updateDto.requiresLifeScience;
    if (updateDto.requiresPhysicalScience !== undefined) updateData.requiresPhysicalScience = updateDto.requiresPhysicalScience;
    if (updateDto.minimumGPA !== undefined) updateData.minimumGPA = new Prisma.Decimal(updateDto.minimumGPA);
    if (updateDto.assessmentAlternatives !== undefined) updateData.assessmentAlternatives = updateDto.assessmentAlternatives;
    if (updateDto.priority !== undefined) updateData.priority = updateDto.priority;
    if (updateDto.isActive !== undefined) updateData.isActive = updateDto.isActive;

    return await this.prisma.graduationRequirement.update({
      where: { id },
      data: updateData,
      include: {
        requiredCourse: {
          include: {
            department: true,
          },
        },
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

  async getRequirement(id: string) {
    const requirement = await this.prisma.graduationRequirement.findUnique({
      where: { id },
      include: {
        requiredCourse: {
          include: {
            department: true,
          },
        },
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

    if (!requirement) {
      throw new NotFoundException('Graduation requirement not found');
    }

    return requirement;
  }

  async getAllRequirements(activeOnly: boolean = false) {
    return await this.prisma.graduationRequirement.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        requiredCourse: {
          include: {
            department: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async deleteRequirement(id: string) {
    const requirement = await this.prisma.graduationRequirement.findUnique({
      where: { id },
      include: {
        audits: {
          take: 1,
        },
      },
    });

    if (!requirement) {
      throw new NotFoundException('Graduation requirement not found');
    }

    if (requirement.audits.length > 0) {
      throw new BadRequestException('Cannot delete requirement that has audit records. Deactivate it instead.');
    }

    await this.prisma.graduationRequirement.delete({
      where: { id },
    });

    return { message: 'Requirement deleted successfully' };
  }

  // ============================================
  // Audit Execution
  // ============================================

  async runAudit(studentId: string, graduationYear: number, academicCycleId?: string, auditedBy?: string): Promise<AuditResult[]> {
    try {
      // Verify student exists
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: true,
        },
      });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      // Get all active requirements
      const requirements = await this.prisma.graduationRequirement.findMany({
        where: { isActive: true },
        include: {
          requiredCourse: {
            include: {
              department: true,
            },
          },
        },
        orderBy: [
          { priority: 'asc' },
          { name: 'asc' },
        ],
      });

      this.logger.log(`Running audit for student ${studentId}, graduation year ${graduationYear}, ${requirements.length} requirements found`);

      const auditResults: AuditResult[] = [];

      // Audit each requirement
      for (const requirement of requirements) {
        try {
          const result = await this.auditRequirement(studentId, requirement, graduationYear, academicCycleId);
          auditResults.push(result);

          // Prepare audit data
          const auditData = {
            status: result.status,
            currentValue: result.currentValue ? new Prisma.Decimal(result.currentValue) : null,
            requiredValue: new Prisma.Decimal(result.requiredValue),
            deficiency: result.deficiency ? new Prisma.Decimal(result.deficiency) : null,
            details: result.details || null,
            auditedBy: auditedBy || null,
          };

          // Handle null academicCycleId: Prisma doesn't allow null in unique constraint lookups
          if (academicCycleId) {
            // Use upsert when academicCycleId is provided
            await this.prisma.graduationAudit.upsert({
              where: {
                studentId_requirementId_academicCycleId_graduationYear: {
                  studentId,
                  requirementId: requirement.id,
                  academicCycleId,
                  graduationYear,
                },
              },
              create: {
                studentId,
                requirementId: requirement.id,
                academicCycleId,
                graduationYear,
                ...auditData,
              },
              update: {
                ...auditData,
                auditedAt: new Date(),
              },
            });
          } else {
            // Use findFirst + create/update when academicCycleId is null
            const existing = await this.prisma.graduationAudit.findFirst({
              where: {
                studentId,
                requirementId: requirement.id,
                academicCycleId: null,
                graduationYear,
              },
            });

            if (existing) {
              await this.prisma.graduationAudit.update({
                where: { id: existing.id },
                data: {
                  ...auditData,
                  auditedAt: new Date(),
                },
              });
            } else {
              await this.prisma.graduationAudit.create({
                data: {
                  studentId,
                  requirementId: requirement.id,
                  academicCycleId: null,
                  graduationYear,
                  ...auditData,
                },
              });
            }
          }
        } catch (error) {
          this.logger.error(`Error auditing requirement ${requirement.id} (${requirement.name}): ${error.message}`, error.stack);
          // Continue with other requirements even if one fails
          auditResults.push({
            requirementId: requirement.id,
            requirementName: requirement.name,
            status: AuditStatus.NOT_MET,
            currentValue: 0,
            requiredValue: 0,
            details: { error: error.message },
          });
        }
      }

      this.logger.log(`Audit completed for student ${studentId}: ${auditResults.length} results`);
      return auditResults;
    } catch (error) {
      this.logger.error(`Error running audit for student ${studentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async auditRequirement(
    studentId: string,
    requirement: any,
    graduationYear: number,
    academicCycleId?: string
  ): Promise<AuditResult> {
    try {
      let status: AuditStatus = AuditStatus.NOT_MET;
      let currentValue = 0;
      let requiredValue = 0;
      let deficiency: number | undefined;
      let details: any = {};

      // Get student's course history
      const courseHistory = await this.prisma.studentCourseHistory.findMany({
        where: {
          studentId,
          isPassed: true, // Only count passed courses
        },
        include: {
          course: {
            include: {
              department: true,
            },
          },
        },
      });

      this.logger.debug(`Auditing requirement ${requirement.id} (${requirement.name}), type: ${requirement.requirementType}, found ${courseHistory.length} passed courses`);

      switch (requirement.requirementType) {
      case RequirementType.CREDIT_TOTAL:
        requiredValue = requirement.requiredCredits ? Number(requirement.requiredCredits) : 0;
        currentValue = courseHistory.reduce((sum, ch) => sum + Number(ch.creditEarned), 0);
        deficiency = currentValue < requiredValue ? requiredValue - currentValue : undefined;
        status = currentValue >= requiredValue ? AuditStatus.MET : 
                 currentValue > 0 ? AuditStatus.PARTIAL : AuditStatus.NOT_MET;
        details = {
          totalCredits: currentValue,
          requiredCredits: requiredValue,
          courses: courseHistory.map(ch => ({
            courseId: ch.courseId,
            courseName: ch.course.name,
            courseCode: ch.course.code,
            credits: Number(ch.creditEarned),
          })),
        };
        break;

      case RequirementType.CREDIT_BY_SUBJECT:
        requiredValue = requirement.requiredCredits ? Number(requirement.requiredCredits) : 0;
        const category = requirement.requirementCategory;
        if (!category) {
          this.logger.warn(`Requirement ${requirement.id} (${requirement.name}) is CREDIT_BY_SUBJECT but has no requirementCategory`);
          status = AuditStatus.NOT_MET;
          details = { error: 'Requirement category not specified' };
          break;
        }
        const subjectCourses = courseHistory.filter(ch => {
          if (!ch.course.department) {
            return false;
          }
          return ch.course.department.name === category || 
                 ch.course.department.code === category;
        });
        currentValue = subjectCourses.reduce((sum, ch) => sum + Number(ch.creditEarned), 0);
        deficiency = currentValue < requiredValue ? requiredValue - currentValue : undefined;
        status = currentValue >= requiredValue ? AuditStatus.MET : 
                 currentValue > 0 ? AuditStatus.PARTIAL : AuditStatus.NOT_MET;
        details = {
          category,
          totalCredits: currentValue,
          requiredCredits: requiredValue,
          courses: subjectCourses.map(ch => ({
            courseId: ch.courseId,
            courseName: ch.course.name,
            courseCode: ch.course.code,
            credits: Number(ch.creditEarned),
          })),
        };
        break;

      case RequirementType.COURSE_REQUIRED:
        requiredValue = 1;
        const hasRequiredCourse = courseHistory.some(ch => ch.courseId === requirement.requiredCourseId);
        currentValue = hasRequiredCourse ? 1 : 0;
        status = hasRequiredCourse ? AuditStatus.MET : AuditStatus.NOT_MET;
        details = {
          requiredCourseId: requirement.requiredCourseId,
          requiredCourseName: requirement.requiredCourse?.name,
          hasCourse: hasRequiredCourse,
          completedCourse: hasRequiredCourse ? courseHistory.find(ch => ch.courseId === requirement.requiredCourseId) : null,
        };
        break;

      case RequirementType.COURSE_ONE_OF:
        requiredValue = 1;
        const alternativeIds = requirement.alternativeCourseIds as string[] || [];
        const hasAlternativeCourse = courseHistory.some(ch => alternativeIds.includes(ch.courseId));
        currentValue = hasAlternativeCourse ? 1 : 0;
        status = hasAlternativeCourse ? AuditStatus.MET : AuditStatus.NOT_MET;
        details = {
          alternativeCourseIds: alternativeIds,
          alternativeCourses: alternativeIds.map(id => {
            const course = courseHistory.find(ch => ch.courseId === id);
            return course ? {
              courseId: id,
              courseName: course.course.name,
              courseCode: course.course.code,
              completed: true,
            } : {
              courseId: id,
              completed: false,
            };
          }),
          hasAnyCourse: hasAlternativeCourse,
        };
        break;

      case RequirementType.GPA_MIN:
        requiredValue = requirement.minimumGPA ? Number(requirement.minimumGPA) : 0;
        currentValue = await this.gradeLookupService.calculateGPA(studentId);
        deficiency = currentValue < requiredValue ? requiredValue - currentValue : undefined;
        status = currentValue >= requiredValue ? AuditStatus.MET : AuditStatus.NOT_MET;
        details = {
          currentGPA: currentValue,
          requiredGPA: requiredValue,
        };
        break;

      case RequirementType.ASSESSMENT:
        // Assessment requirements are typically handled separately
        // For now, mark as NOT_MET (can be updated manually)
        requiredValue = 1;
        currentValue = 0;
        status = AuditStatus.NOT_MET;
        details = {
          assessmentAlternatives: requirement.assessmentAlternatives,
          note: 'Assessment requirements must be verified manually',
        };
        break;

      case RequirementType.OTHER:
        // Other requirements are typically handled manually
        requiredValue = 1;
        currentValue = 0;
        status = AuditStatus.NOT_MET;
        details = {
          description: requirement.description,
          note: 'Other requirements must be verified manually',
        };
        break;

      default:
        this.logger.warn(`Unknown requirement type: ${requirement.requirementType} for requirement ${requirement.id}`);
        status = AuditStatus.NOT_MET;
        details = { error: 'Unknown requirement type' };
    }

      return {
        requirementId: requirement.id,
        requirementName: requirement.name,
        status,
        currentValue,
        requiredValue,
        deficiency,
        details,
      };
    } catch (error) {
      this.logger.error(`Error in auditRequirement for requirement ${requirement.id}: ${error.message}`, error.stack);
      return {
        requirementId: requirement.id,
        requirementName: requirement.name,
        status: AuditStatus.NOT_MET,
        currentValue: 0,
        requiredValue: 0,
        details: { error: error.message },
      };
    }
  }


  // ============================================
  // Audit Results Retrieval
  // ============================================

  async getAuditSummary(studentId: string, graduationYear: number): Promise<AuditSummary> {
    const audits = await this.prisma.graduationAudit.findMany({
      where: {
        studentId,
        graduationYear,
      },
      include: {
        requirement: true,
      },
    });

    const metCount = audits.filter(a => a.status === AuditStatus.MET).length;
    const notMetCount = audits.filter(a => a.status === AuditStatus.NOT_MET).length;
    const partialCount = audits.filter(a => a.status === AuditStatus.PARTIAL).length;
    const inProgressCount = audits.filter(a => a.status === AuditStatus.IN_PROGRESS).length;
    const waivedCount = audits.filter(a => a.status === AuditStatus.WAIVED).length;
    const exceptionCount = audits.filter(a => a.status === AuditStatus.EXCEPTION).length;

    // Determine overall status
    let overallStatus: OverallAuditStatus = OverallAuditStatus.ELIGIBLE;
    if (notMetCount > 0 || partialCount > 0) {
      overallStatus = OverallAuditStatus.NOT_YET;
    }
    if (waivedCount > 0 || exceptionCount > 0 || inProgressCount > 0) {
      overallStatus = OverallAuditStatus.NEEDS_REVIEW;
    }

    const auditResults: AuditResult[] = audits.map(audit => ({
      auditId: audit.id,
      requirementId: audit.requirementId,
      requirementName: audit.requirement.name,
      status: audit.status,
      currentValue: audit.currentValue ? Number(audit.currentValue) : 0,
      requiredValue: Number(audit.requiredValue),
      deficiency: audit.deficiency ? Number(audit.deficiency) : undefined,
      details: audit.details as any,
    }));

    return {
      studentId,
      graduationYear,
      overallStatus,
      totalRequirements: audits.length,
      metRequirements: metCount,
      notMetRequirements: notMetCount,
      partialRequirements: partialCount,
      inProgressRequirements: inProgressCount,
      waivedRequirements: waivedCount,
      exceptionRequirements: exceptionCount,
      audits: auditResults,
    };
  }

  async getDeficiencies(studentId: string, graduationYear: number) {
    return await this.prisma.graduationAudit.findMany({
      where: {
        studentId,
        graduationYear,
        status: {
          in: [AuditStatus.NOT_MET, AuditStatus.PARTIAL],
        },
      },
      include: {
        requirement: true,
      },
      orderBy: {
        requirement: {
          priority: 'asc',
        },
      },
    });
  }

  async getDetailedBreakdown(studentId: string, graduationYear: number): Promise<DetailedAuditBreakdown[]> {
    const audits = await this.prisma.graduationAudit.findMany({
      where: {
        studentId,
        graduationYear,
      },
      include: {
        requirement: true,
        courseAllocations: {
          include: {
            courseHistory: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    // Get all course history for the student
    const allCourseHistory = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        isPassed: true,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    });

    const breakdowns: DetailedAuditBreakdown[] = [];

    for (const audit of audits) {
      const allocations = audit.courseAllocations || [];
      const coursesCounted = allocations.map(alloc => ({
        courseHistoryId: alloc.courseHistoryId,
        courseName: alloc.courseHistory.course.name,
        courseCode: alloc.courseHistory.course.code,
        credits: Number(alloc.allocatedCredits),
        allocationReason: alloc.allocationReason || undefined,
      }));

      // Find courses that could count but aren't allocated
      const excludedCourses = allCourseHistory
        .filter(ch => {
          // Check if this course could potentially count for this requirement
          const couldCount = this.couldCourseCountForRequirement(ch, audit.requirement);
          // But it's not allocated
          const isAllocated = allocations.some(a => a.courseHistoryId === ch.id);
          return couldCount && !isAllocated;
        })
        .map(ch => ({
          courseHistoryId: ch.id,
          courseName: ch.course.name,
          courseCode: ch.course.code,
          reason: 'Not allocated to this requirement',
        }));

      breakdowns.push({
        requirementId: audit.requirementId,
        requirementName: audit.requirement.name,
        status: audit.status,
        currentValue: audit.currentValue ? Number(audit.currentValue) : 0,
        requiredValue: Number(audit.requiredValue),
        deficiency: audit.deficiency ? Number(audit.deficiency) : undefined,
        coursesCounted,
        excludedCourses,
        details: audit.details as any,
      });
    }

    return breakdowns;
  }

  private couldCourseCountForRequirement(courseHistory: any, requirement: any): boolean {
    switch (requirement.requirementType) {
      case RequirementType.CREDIT_TOTAL:
        return true; // Any course can count toward total credits
      case RequirementType.CREDIT_BY_SUBJECT:
        return courseHistory.course.department.name === requirement.requirementCategory ||
               courseHistory.course.department.code === requirement.requirementCategory;
      case RequirementType.COURSE_REQUIRED:
        return courseHistory.courseId === requirement.requiredCourseId;
      case RequirementType.COURSE_ONE_OF:
        const alternatives = requirement.alternativeCourseIds as string[] || [];
        return alternatives.includes(courseHistory.courseId);
      default:
        return false;
    }
  }

  // ============================================
  // Course Allocation
  // ============================================

  async allocateCourseToRequirement(
    allocateDto: AllocateCourseDto,
    userId: string
  ) {
    // Verify course history exists
    const courseHistory = await this.prisma.studentCourseHistory.findUnique({
      where: { id: allocateDto.courseHistoryId },
      include: {
        course: true,
        student: true,
      },
    });

    if (!courseHistory) {
      throw new NotFoundException('Course history not found');
    }

    // Verify requirement exists
    const requirement = await this.prisma.graduationRequirement.findUnique({
      where: { id: allocateDto.requirementId },
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    // Verify audit exists
    const audit = await this.prisma.graduationAudit.findUnique({
      where: { id: allocateDto.auditId },
    });

    if (!audit) {
      throw new NotFoundException('Audit not found');
    }

    // Check if allocation already exists
    const existing = await this.prisma.courseRequirementAllocation.findUnique({
      where: {
        courseHistoryId_requirementId_auditId: {
          courseHistoryId: allocateDto.courseHistoryId,
          requirementId: allocateDto.requirementId,
          auditId: allocateDto.auditId,
        },
      },
    });

    if (existing) {
      // Update existing allocation
      return await this.prisma.courseRequirementAllocation.update({
        where: { id: existing.id },
        data: {
          allocatedCredits: new Prisma.Decimal(allocateDto.credits),
          allocationReason: allocateDto.allocationReason,
        },
      });
    }

    // Check for conflicts (course already allocated to another requirement in same audit)
    const conflict = await this.prisma.courseRequirementAllocation.findFirst({
      where: {
        courseHistoryId: allocateDto.courseHistoryId,
        auditId: allocateDto.auditId,
        requirementId: { not: allocateDto.requirementId },
      },
    });

    const wasConflict = !!conflict;

    // Create allocation
    const allocation = await this.prisma.courseRequirementAllocation.create({
      data: {
        studentId: courseHistory.studentId,
        courseHistoryId: allocateDto.courseHistoryId,
        requirementId: allocateDto.requirementId,
        auditId: allocateDto.auditId,
        allocatedCredits: new Prisma.Decimal(allocateDto.credits),
        allocationReason: allocateDto.allocationReason,
        wasConflict,
        conflictResolvedBy: wasConflict ? userId : null,
        conflictResolvedAt: wasConflict ? new Date() : null,
        allocatedBy: userId,
      },
      include: {
        courseHistory: {
          include: {
            course: true,
          },
        },
        requirement: true,
      },
    });

    // If there was a conflict, remove the old allocation
    if (conflict) {
      await this.prisma.courseRequirementAllocation.delete({
        where: { id: conflict.id },
      });
    }

    // Re-run audit for this requirement
    await this.runAudit(
      courseHistory.studentId,
      audit.graduationYear,
      audit.academicCycleId || undefined,
      userId
    );

    return allocation;
  }

  async resolveMultiCategoryConflict(
    courseHistoryId: string,
    requirementId: string,
    auditId: string,
    userId: string
  ) {
    // Get course history to get credits
    const courseHistory = await this.prisma.studentCourseHistory.findUnique({
      where: { id: courseHistoryId },
    });

    if (!courseHistory) {
      throw new NotFoundException('Course history not found');
    }

    return await this.allocateCourseToRequirement(
      {
        courseHistoryId,
        requirementId,
        auditId,
        credits: Number(courseHistory.creditEarned),
        allocationReason: 'Multi-category conflict resolved',
      },
      userId
    );
  }

  // ============================================
  // Requirement Waiver
  // ============================================

  async waiveRequirement(auditId: string, userId: string, waiveDto: WaiveRequirementDto) {
    const audit = await this.prisma.graduationAudit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw new NotFoundException('Audit not found');
    }

    return await this.prisma.graduationAudit.update({
      where: { id: auditId },
      data: {
        status: AuditStatus.WAIVED,
        waivedBy: userId,
        waivedAt: new Date(),
        waivedReason: waiveDto.reason,
      },
      include: {
        requirement: true,
        waivingUser: {
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
  // Audit Notes
  // ============================================

  async addNoteToAudit(auditId: string, noteDto: CreateAuditNoteDto, userId: string) {
    const audit = await this.prisma.graduationAudit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw new NotFoundException('Audit not found');
    }

    return await this.prisma.auditNote.create({
      data: {
        auditId,
        note: noteDto.note,
        isActionItem: noteDto.isActionItem ?? false,
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

  async completeActionItem(noteId: string, userId: string) {
    const note = await this.prisma.auditNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Audit note not found');
    }

    if (!note.isActionItem) {
      throw new BadRequestException('This note is not an action item');
    }

    return await this.prisma.auditNote.update({
      where: { id: noteId },
      data: {
        completed: true,
        completedBy: userId,
        completedAt: new Date(),
      },
      include: {
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

  async getAuditNotes(auditId: string) {
    return await this.prisma.auditNote.findMany({
      where: { auditId },
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ============================================
  // Bulk Operations
  // ============================================

  async bulkAudit(studentIds: string[], graduationYear: number, auditedBy?: string) {
    const results = [];

    for (const studentId of studentIds) {
      try {
        const auditResults = await this.runAudit(studentId, graduationYear, undefined, auditedBy);
        const summary = await this.getAuditSummary(studentId, graduationYear);
        results.push({
          studentId,
          success: true,
          summary,
        });
      } catch (error) {
        results.push({
          studentId,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      total: studentIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }
}
