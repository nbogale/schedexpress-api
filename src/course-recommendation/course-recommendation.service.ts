import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CoursePreferenceStatus } from '@prisma/client';
import {
  RecommendationType,
  RecommendationStatus,
  StudentAction,
  CourseAvailabilityStatus,
} from './recommendation.constants';

export interface RequirementWithoutCourse {
  requirementId: string;
  requirementName: string;
  requirementType: string;
  missingCredits?: number;
  suggestedAlternatives?: Array<{
    courseId: string;
    courseCode: string;
    courseName: string;
    availabilityStatus: (typeof CourseAvailabilityStatus)[keyof typeof CourseAvailabilityStatus];
  }>;
}

@Injectable()
export class CourseRecommendationService {
  private readonly logger = new Logger(CourseRecommendationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Prisma delegate for CourseRecommendation (avoids TS errors when client is generated without this model) */
  private get repo() {
    const delegate = (this.prisma as any).courseRecommendation;
    if (!delegate) {
      this.logger.error('Prisma client missing courseRecommendation delegate. Run: npx prisma generate');
      throw new Error('Course recommendation service not available. Please run prisma generate.');
    }
    return delegate;
  }

  /** Serialize recommendation(s) for JSON response (convert Decimal confidence to number) */
  private serializeRecommendation<T>(rec: T): T {
    if (!rec || typeof rec !== 'object') return rec;
    const out = { ...(rec as any) };
    if (out.confidence != null && typeof out.confidence === 'object' && typeof (out.confidence as any).toNumber === 'function') {
      out.confidence = (out.confidence as any).toNumber();
    } else if (out.confidence != null) {
      out.confidence = Number(out.confidence);
    }
    return out as T;
  }

  private serializeRecommendations(recs: any[]): any[] {
    return recs.map((r) => this.serializeRecommendation(r));
  }

  // ============================================
  // Main Recommendation Generation
  // ============================================

  async generateRecommendations(
    studentId: string,
    academicCycleId: string,
    generatedBy?: string
  ) {
    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify academic cycle exists
    const academicCycle = await this.prisma.academicCycle.findUnique({
      where: { id: academicCycleId },
    });

    if (!academicCycle) {
      throw new NotFoundException('Academic cycle not found');
    }

    // Generate recommendations by priority
    const recommendations: any[] = [];

    // 1. GRADUATION_REQUIREMENT (highest priority)
    const graduationRecs = await this.generateGraduationRequirementRecommendations(
      studentId,
      academicCycleId
    );
    recommendations.push(...graduationRecs);

    // 2. PREREQUISITE
    const prerequisiteRecs = await this.generatePrerequisiteRecommendations(
      studentId,
      academicCycleId
    );
    recommendations.push(...prerequisiteRecs);

    // 3. CREDIT_RECOVERY
    const creditRecoveryRecs = await this.generateCreditRecoveryRecommendations(
      studentId,
      academicCycleId
    );
    recommendations.push(...creditRecoveryRecs);

    // 4. GAP_FILLER
    const gapFillerRecs = await this.generateGapFillerRecommendations(
      studentId,
      academicCycleId
    );
    recommendations.push(...gapFillerRecs);

    // 5. ADVANCEMENT
    const advancementRecs = await this.generateAdvancementRecommendations(
      studentId,
      academicCycleId
    );
    recommendations.push(...advancementRecs);

    // 6. INTEREST / ELECTIVE
    const interestRecs = await this.generateInterestBasedRecommendations(
      studentId,
      academicCycleId
    );
    recommendations.push(...interestRecs);

    // Filter by available courses
    const filteredRecs = await this.filterByAvailableCourses(
      recommendations,
      academicCycleId
    );

    // Deduplicate by courseId to avoid unique constraint (studentId, courseId, academicCycleId, generatedAt)
    const seenCourseIds = new Set<string>();
    const toCreate = filteredRecs.filter((rec) => {
      if (seenCourseIds.has(rec.courseId)) return false;
      seenCourseIds.add(rec.courseId);
      return true;
    });

    // Save recommendations to database
    const savedRecommendations: any[] = [];
    for (const rec of toCreate) {
      try {
        const created = await this.repo.create({
          data: {
            studentId,
            courseId: rec.courseId,
            academicCycleId,
            recommendationType: rec.recommendationType as any,
            reason: rec.reason ?? null,
            priority: rec.priority ?? 0,
            confidence: new Prisma.Decimal(Number(rec.confidence ?? 0)),
            requirementId: rec.requirementId ?? null,
            planCourseId: rec.planCourseId ?? null,
            generatedBy: generatedBy || 'SYSTEM',
            expiresAt: rec.expiresAt ?? null,
          },
          include: {
            course: {
              include: {
                department: true,
              },
            },
            requirement: true,
            planCourse: true,
          },
        });
        savedRecommendations.push(created);
      } catch (err) {
        this.logger.error(`Failed to create recommendation for course ${rec.courseId}: ${err instanceof Error ? err.message : String(err)}`);
        throw err;
      }
    }

    return this.serializeRecommendations(savedRecommendations);
  }

  async getRecommendations(
    studentId: string,
    academicCycleId?: string,
    status?: string
  ) {
    const where: any = { studentId };

    if (academicCycleId) {
      where.academicCycleId = academicCycleId;
    }

    if (status) {
      where.status = status;
    }

    const list = await this.repo.findMany({
      where,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        requirement: true,
        planCourse: true,
        academicCycle: true,
      },
      orderBy: [
        { priority: 'asc' },
        { confidence: 'desc' },
        { generatedAt: 'desc' },
      ],
    });
    const serialized = this.serializeRecommendations(list);
    if (academicCycleId) {
      for (const rec of serialized) {
        if (rec.courseId) {
          rec.availabilityStatus = await this.checkCourseAvailability(
            rec.courseId,
            academicCycleId,
          );
        }
      }
    }
    return serialized;
  }

  async getRecommendation(recommendationId: string) {
    const rec = await this.repo.findUnique({
      where: { id: recommendationId },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        requirement: true,
        planCourse: true,
        academicCycle: true,
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
      },
    });
    return rec ? this.serializeRecommendation(rec) : null;
  }

  async acceptRecommendation(
    recommendationId: string,
    options?: { userId?: string; role?: string },
  ) {
    const recommendation = await this.repo.findUnique({
      where: { id: recommendationId },
      include: { student: true },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }

    if (options?.role === 'STUDENT' && options?.userId && recommendation.student.userId !== options.userId) {
      throw new UnauthorizedException('Can only accept your own recommendations');
    }

    // Students set preference only (studentAction); counselors/staff set official status.
    // Treat caller as student when they are the recommendation owner, so we don't set status to ACCEPTED when a student clicks "I'm interested".
    const isRecommendationOwner = options?.userId && recommendation.student.userId === options.userId;
    const isStudent = options?.role === 'STUDENT' || isRecommendationOwner;
    const updateData = isStudent
      ? { studentAction: StudentAction.ACCEPTED as any, actionDate: new Date() }
      : { status: RecommendationStatus.ACCEPTED as any, studentAction: StudentAction.ACCEPTED as any, actionDate: new Date() };

    const updated = await this.repo.update({
      where: { id: recommendationId },
      data: updateData,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        requirement: true,
        planCourse: true,
      },
    });
    return this.serializeRecommendation(updated);
  }

  async rejectRecommendation(
    recommendationId: string,
    options?: { userId?: string; role?: string },
  ) {
    const recommendation = await this.repo.findUnique({
      where: { id: recommendationId },
      include: { student: true },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }

    if (options?.role === 'STUDENT' && options?.userId && recommendation.student.userId !== options.userId) {
      throw new UnauthorizedException('Can only reject your own recommendations');
    }

    // Students set preference only (studentAction); counselors/staff set official status.
    const isRecommendationOwner = options?.userId && recommendation.student.userId === options.userId;
    const isStudent = options?.role === 'STUDENT' || isRecommendationOwner;
    const updateData = isStudent
      ? { studentAction: StudentAction.REJECTED as any, actionDate: new Date() }
      : { status: RecommendationStatus.REJECTED as any, studentAction: StudentAction.REJECTED as any, actionDate: new Date() };

    const updated = await this.repo.update({
      where: { id: recommendationId },
      data: updateData,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        requirement: true,
        planCourse: true,
      },
    });
    return this.serializeRecommendation(updated);
  }

  // ============================================
  // Recommendation Algorithms
  // ============================================

  async generateGraduationRequirementRecommendations(
    studentId: string,
    academicCycleId: string
  ) {
    const recommendations: any[] = [];

    // Get student's graduation year
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { graduationYear: true },
    });

    if (!student?.graduationYear) {
      return recommendations;
    }

    // Get audit deficiencies
    const deficiencies = await this.prisma.graduationAudit.findMany({
      where: {
        studentId,
        graduationYear: student.graduationYear,
        status: { in: ['NOT_MET', 'PARTIAL'] },
      },
      include: {
        requirement: {
          include: {
            requiredCourse: true,
          },
        },
      },
    });

    for (const deficiency of deficiencies) {
      const req = deficiency.requirement;
      if (!req) continue;

      // Handle COURSE_REQUIRED
      if (req.requirementType === 'COURSE_REQUIRED' && req.requiredCourseId) {
        // Check if student already has this course
        const hasCourse = await this.hasCourseCompleted(studentId, req.requiredCourseId);
        
        if (!hasCourse) {
          recommendations.push({
            courseId: req.requiredCourseId,
            recommendationType: RecommendationType.GRADUATION_REQUIREMENT,
            reason: `Required course for graduation: ${req.name}`,
            priority: 1,
            confidence: 1.0,
            requirementId: req.id,
          });
        }
      }

      // Handle COURSE_ONE_OF
      if (req.requirementType === 'COURSE_ONE_OF' && req.alternativeCourseIds != null) {
        let alternativeIds: string[] = [];
        try {
          alternativeIds = Array.isArray(req.alternativeCourseIds)
            ? (req.alternativeCourseIds as string[])
            : (typeof req.alternativeCourseIds === 'string' ? JSON.parse(req.alternativeCourseIds) : []);
        } catch {
          this.logger.warn(`Invalid alternativeCourseIds for requirement ${req.id}`);
        }
        // Check which alternatives student hasn't taken
        for (const courseId of alternativeIds) {
          const hasCourse = await this.hasCourseCompleted(studentId, courseId);
          
          if (!hasCourse) {
            const course = await this.prisma.course.findUnique({
              where: { id: courseId },
            });

            if (course) {
              recommendations.push({
                courseId,
                recommendationType: RecommendationType.GRADUATION_REQUIREMENT,
                reason: `One of the required courses for: ${req.name}`,
                priority: 1,
                confidence: 0.9,
                requirementId: req.id,
              });
            }
          }
        }
      }

      // Handle CREDIT_BY_SUBJECT
      if (req.requirementType === 'CREDIT_BY_SUBJECT' && req.requiredCredits) {
        const missingCredits = Number(deficiency.deficiency ?? 0);
        
        if (missingCredits > 0) {
          // Find courses in this subject that student hasn't taken
          const courses = await this.findCoursesForSubject(
            req.requirementCategory || '',
            studentId
          );

          for (const course of courses.slice(0, 3)) { // Limit to top 3
            recommendations.push({
              courseId: course.id,
              recommendationType: RecommendationType.GRADUATION_REQUIREMENT,
              reason: `Fulfills ${missingCredits} missing ${req.requirementCategory} credits for: ${req.name}`,
              priority: 1,
              confidence: 0.85,
              requirementId: req.id,
            });
          }
        }
      }
    }

    return recommendations;
  }

  async generatePrerequisiteRecommendations(
    studentId: string,
    academicCycleId: string
  ) {
    const recommendations: any[] = [];

    // Get student's active graduation plan
    const activePlan = await this.prisma.graduationPlan.findFirst({
      where: {
        studentId,
        status: { in: ['ACTIVE', 'APPROVED', 'DRAFT'] },
      },
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
          },
        },
      },
      orderBy: { version: 'desc' },
    });

    if (!activePlan) {
      return recommendations;
    }

    // Check prerequisites for planned courses
    for (const planCourse of activePlan.planCourses) {
      if (planCourse.plannedAcademicCycleId === academicCycleId) {
        const course = planCourse.course;
        
        if (course.prerequisites && course.prerequisites.length > 0) {
          for (const prereq of course.prerequisites) {
            const prereqCourseId = prereq.prerequisiteCourseId;
            const hasPrereq = await this.hasCourseCompleted(studentId, prereqCourseId);
            
            if (!hasPrereq) {
              const prereqCourse = await this.prisma.course.findUnique({
                where: { id: prereqCourseId },
              });

              if (prereqCourse) {
                recommendations.push({
                  courseId: prereqCourseId,
                  recommendationType: RecommendationType.PREREQUISITE,
                  reason: `Prerequisite for ${course.code} - ${course.name}`,
                  priority: 2,
                  confidence: 0.95,
                  planCourseId: planCourse.id,
                });
              }
            }
          }
        }
      }
    }

    return recommendations;
  }

  async generateCreditRecoveryRecommendations(
    studentId: string,
    academicCycleId: string
  ) {
    const recommendations: any[] = [];

    // Find failed courses
    const failedCourses = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        isPassed: false,
      },
      include: {
        course: true,
      },
    });

    for (const failedCourse of failedCourses) {
      // Check if course is still active
      if (failedCourse.course.isActive) {
        recommendations.push({
          courseId: failedCourse.courseId,
          recommendationType: RecommendationType.CREDIT_RECOVERY,
          reason: `Credit recovery for failed course: ${failedCourse.course.code}`,
          priority: 3,
          confidence: 0.9,
        });
      }
    }

    return recommendations;
  }

  async generateGapFillerRecommendations(
    studentId: string,
    academicCycleId: string
  ) {
    const recommendations: any[] = [];

    // Get student's current schedule/preferences for this cycle
    const preferences = await this.prisma.coursePreference.findMany({
      where: {
        studentId,
        academicCycleId,
        status: { in: [CoursePreferenceStatus.APPROVED, CoursePreferenceStatus.SUBMITTED] },
      },
    });

    // Get student's grade level
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        gradeLevel: true,
      },
    });

    if (!student) {
      return recommendations;
    }

    // If student has fewer than 6 courses, suggest electives
    if (preferences.length < 6) {
      const electives = await this.prisma.course.findMany({
        where: {
          isElective: true,
          isActive: true,
          minGradeLevel: {
            id: { lte: student.gradeLevelId },
          },
        },
        take: 5,
      });

      for (const elective of electives) {
        // Check if already in preferences
        const alreadyPreferred = preferences.some(
          p => p.courseId === elective.id
        );

        if (!alreadyPreferred) {
          recommendations.push({
            courseId: elective.id,
            recommendationType: RecommendationType.GAP_FILLER,
            reason: `Elective to fill schedule gap`,
            priority: 5,
            confidence: 0.6,
          });
        }
      }
    }

    return recommendations;
  }

  async generateAdvancementRecommendations(
    studentId: string,
    academicCycleId: string
  ) {
    const recommendations: any[] = [];

    // Get student's completed courses by department
    const completedCourses = await this.prisma.studentCourseHistory.findMany({
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

    // Group completed courses by department
    const coursesByDept = new Map<string, any[]>();
    for (const completed of completedCourses) {
      const deptId = completed.course.departmentId;
      if (!coursesByDept.has(deptId)) {
        coursesByDept.set(deptId, []);
      }
      coursesByDept.get(deptId)!.push(completed.course);
    }

    // For each department, find next courses in sequence
    for (const [deptId, courses] of coursesByDept.entries()) {
      // Get all sequences for this department
      const sequences = await this.prisma.courseSequence.findMany({
        where: {
          departmentId: deptId,
        },
        include: {
          course: true,
        },
        orderBy: {
          sequenceOrder: 'asc',
        },
      });

      // Find the highest sequence order course the student has completed
      let maxCompletedOrder = -1;
      for (const completedCourse of courses) {
        const seq = sequences.find(s => s.courseId === completedCourse.id);
        if (seq && seq.sequenceOrder > maxCompletedOrder) {
          maxCompletedOrder = seq.sequenceOrder;
        }
      }

      // Recommend the next course in sequence
      if (maxCompletedOrder >= 0) {
        const nextSequence = sequences.find(s => s.sequenceOrder === maxCompletedOrder + 1);
        if (nextSequence) {
          const hasNext = await this.hasCourseCompleted(studentId, nextSequence.courseId);
          
          if (!hasNext && nextSequence.course.isActive) {
            recommendations.push({
              courseId: nextSequence.courseId,
              recommendationType: RecommendationType.ADVANCEMENT,
              reason: `Next course in ${completedCourses[0].course.department.name} sequence`,
              priority: 4,
              confidence: 0.8,
            });
          }
        }
      }
    }

    return recommendations;
  }

  async generateInterestBasedRecommendations(
    studentId: string,
    academicCycleId: string
  ) {
    const recommendations: any[] = [];

    // Get student's graduation plan goals/interests
    const plan = await this.prisma.graduationPlan.findFirst({
      where: {
        studentId,
        status: { in: ['ACTIVE', 'APPROVED', 'DRAFT'] },
      },
      orderBy: { version: 'desc' },
    });

    if (!plan || !plan.goals) {
      return recommendations;
    }

    // Parse goals (assuming JSON structure)
    const goals = typeof plan.goals === 'string' 
      ? JSON.parse(plan.goals) 
      : plan.goals;

    // This is a simplified version - in production, you'd have more sophisticated
    // matching logic based on course descriptions, tags, etc.
    // For now, we'll suggest electives that might align with interests

    const electives = await this.prisma.course.findMany({
      where: {
        isElective: true,
        isActive: true,
      },
      take: 10,
    });

    for (const elective of electives.slice(0, 3)) {
      recommendations.push({
        courseId: elective.id,
        recommendationType: RecommendationType.INTEREST,
        reason: `Suggested elective based on your academic goals`,
        priority: 6,
        confidence: 0.5,
      });
    }

    return recommendations;
  }

  // ============================================
  // Helper Methods
  // ============================================

  async checkCourseAvailability(
    courseId: string,
    academicCycleId: string
  ): Promise<(typeof CourseAvailabilityStatus)[keyof typeof CourseAvailabilityStatus]> {
    // Check if course has sections in this academic cycle
    const sections = await this.prisma.courseSection.findMany({
      where: {
        courseId,
        academicCycleId,
        isActive: true,
      },
    });

    if (sections.length > 0) {
      return CourseAvailabilityStatus.AVAILABLE;
    }

    // Check if course is active
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isActive) {
      return CourseAvailabilityStatus.NOT_OFFERED;
    }

    // For now, return NOT_OFFERED if no sections
    // In production, you might check district-wide, online, dual enrollment options
    return CourseAvailabilityStatus.NOT_OFFERED;
  }

  async filterByAvailableCourses(
    recommendations: any[],
    academicCycleId: string
  ) {
    const filtered: any[] = [];

    for (const rec of recommendations) {
      const availability = await this.checkCourseAvailability(
        rec.courseId,
        academicCycleId
      );

      // Only include if available or if it's a graduation requirement (still show even if not offered)
      if (
        availability === CourseAvailabilityStatus.AVAILABLE ||
        rec.recommendationType === RecommendationType.GRADUATION_REQUIREMENT
      ) {
        filtered.push({
          ...rec,
          availabilityStatus: availability,
        });
      }
    }

    return filtered;
  }

  async flagRequirementsWithoutCourses(
    studentId: string,
    academicCycleId: string
  ): Promise<RequirementWithoutCourse[]> {
    const flags: RequirementWithoutCourse[] = [];

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { graduationYear: true },
    });

    if (!student?.graduationYear) {
      return flags;
    }

    const deficiencies = await this.prisma.graduationAudit.findMany({
      where: {
        studentId,
        graduationYear: student.graduationYear,
        status: { in: ['NOT_MET', 'PARTIAL'] },
      },
      include: {
        requirement: {
          include: {
            requiredCourse: true,
          },
        },
      },
    });

    for (const deficiency of deficiencies) {
      const req = deficiency.requirement;

      if (req.requirementType === 'COURSE_REQUIRED' && req.requiredCourseId) {
        const availability = await this.checkCourseAvailability(
          req.requiredCourseId,
          academicCycleId
        );

        if (availability === CourseAvailabilityStatus.NOT_OFFERED) {
          flags.push({
            requirementId: req.id,
            requirementName: req.name,
            requirementType: req.requirementType,
            suggestedAlternatives: await this.getAlternativeCourseOptions(req.id),
          });
        }
      }
    }

    return flags;
  }

  async getAlternativeCourseOptions(requirementId: string) {
    const requirement = await this.prisma.graduationRequirement.findUnique({
      where: { id: requirementId },
      include: {
        requiredCourse: true,
      },
    });

    if (!requirement) {
      return [];
    }

    // For now, return empty array
    // In production, you'd query district-wide, online, dual enrollment courses
    return [];
  }

  private async hasCourseCompleted(studentId: string, courseId: string): Promise<boolean> {
    const history = await this.prisma.studentCourseHistory.findFirst({
      where: {
        studentId,
        courseId,
        isPassed: true,
      },
    });

    return !!history;
  }

  private async findCoursesForSubject(
    category: string,
    studentId: string
  ) {
    // Find department by category name
    const department = await this.prisma.department.findFirst({
      where: {
        name: { contains: category, mode: 'insensitive' },
      },
    });

    if (!department) {
      return [];
    }

    // Get courses in this department that student hasn't completed
    const completedCourseIds = (
      await this.prisma.studentCourseHistory.findMany({
        where: {
          studentId,
          isPassed: true,
        },
        select: { courseId: true },
      })
    ).map(h => h.courseId);

    return this.prisma.course.findMany({
      where: {
        departmentId: department.id,
        isActive: true,
        id: { notIn: completedCourseIds },
      },
      take: 10,
    });
  }
}
