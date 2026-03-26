import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RuleType } from '@prisma/client';

export interface ValidationIssue {
  type: 'PREREQUISITE' | 'SEQUENCE' | 'COURSE_SEQUENCE';
  severity: 'ERROR' | 'WARNING';
  message: string;
  requiredCourseId: string;
  requiredCourseCode: string;
  requiredCourseName: string;
  isOverridable: boolean;
  ruleId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  canProceed: boolean; // true if all issues are warnings/overridable
  issues: ValidationIssue[];
  missingPrerequisites: ValidationIssue[];
  sequenceViolations: ValidationIssue[];
}

@Injectable()
export class PrerequisiteValidationService {
  private readonly logger = new Logger(PrerequisiteValidationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Validate all prerequisite and sequential rules for a course
   */
  async validateAllRules(studentId: string, courseId: string): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Get student's completed courses (from course history)
    const studentCourseHistory = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        isPassed: true, // Only count passed courses
      },
      select: {
        courseId: true,
      },
    });

    const completedCourseIds = new Set(studentCourseHistory.map(h => h.courseId));

    // Validate CourseRule prerequisites
    const prerequisiteIssues = await this.validatePrerequisites(studentId, courseId, completedCourseIds);
    issues.push(...prerequisiteIssues);

    // Validate CourseRule sequences
    const sequenceIssues = await this.validateSequentialRules(studentId, courseId, completedCourseIds);
    issues.push(...sequenceIssues);

    // Validate CourseSequence model
    const courseSequenceIssues = await this.validateCourseSequence(studentId, courseId, completedCourseIds);
    issues.push(...courseSequenceIssues);

    // Categorize issues
    const missingPrerequisites = issues.filter(i => i.type === 'PREREQUISITE');
    const sequenceViolations = issues.filter(i => i.type === 'SEQUENCE' || i.type === 'COURSE_SEQUENCE');

    // Determine if student can proceed
    // Can proceed if all issues are warnings (overridable) or if no issues
    const hasErrors = issues.some(i => i.severity === 'ERROR');
    const canProceed = !hasErrors;

    return {
      isValid: issues.length === 0,
      canProceed,
      issues,
      missingPrerequisites,
      sequenceViolations,
    };
  }

  /**
   * Validate PREREQUISITE type CourseRules
   */
  private async validatePrerequisites(
    studentId: string,
    courseId: string,
    completedCourseIds: Set<string>,
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Find all PREREQUISITE rules for this course
    const prerequisiteRules = await this.prisma.courseRule.findMany({
      where: {
        courseId,
        type: RuleType.PREREQUISITE,
        isActive: true,
      },
      include: {
        conflictingCourse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    for (const rule of prerequisiteRules) {
      const requiredCourseId = rule.conflictingCourseId;
      
      // Check if student has completed the prerequisite
      if (!completedCourseIds.has(requiredCourseId)) {
        const severity = rule.isOverridable ? 'WARNING' : 'ERROR';
        
        issues.push({
          type: 'PREREQUISITE',
          severity,
          message: rule.isOverridable
            ? `This course requires ${rule.conflictingCourse.name} (${rule.conflictingCourse.code}) as a prerequisite. This requirement can be overridden with counselor approval.`
            : `This course requires ${rule.conflictingCourse.name} (${rule.conflictingCourse.code}) as a prerequisite. You must complete it first.`,
          requiredCourseId,
          requiredCourseCode: rule.conflictingCourse.code,
          requiredCourseName: rule.conflictingCourse.name,
          isOverridable: rule.isOverridable,
          ruleId: rule.id,
        });
      }
    }

    return issues;
  }

  /**
   * Validate SEQUENCE type CourseRules
   */
  private async validateSequentialRules(
    studentId: string,
    courseId: string,
    completedCourseIds: Set<string>,
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Find all SEQUENCE rules for this course
    const sequenceRules = await this.prisma.courseRule.findMany({
      where: {
        courseId,
        type: RuleType.SEQUENCE,
        isActive: true,
      },
      include: {
        conflictingCourse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    for (const rule of sequenceRules) {
      const requiredCourseId = rule.conflictingCourseId;
      
      // Check if student has completed the prerequisite course in sequence
      if (!completedCourseIds.has(requiredCourseId)) {
        const severity = rule.isOverridable ? 'WARNING' : 'ERROR';
        
        issues.push({
          type: 'SEQUENCE',
          severity,
          message: rule.isOverridable
            ? `This course must be taken after ${rule.conflictingCourse.name} (${rule.conflictingCourse.code}) in sequence. This requirement can be overridden with counselor approval.`
            : `This course must be taken after ${rule.conflictingCourse.name} (${rule.conflictingCourse.code}) in sequence. Please complete the prerequisite course first.`,
          requiredCourseId,
          requiredCourseCode: rule.conflictingCourse.code,
          requiredCourseName: rule.conflictingCourse.name,
          isOverridable: rule.isOverridable,
          ruleId: rule.id,
        });
      }
    }

    return issues;
  }

  /**
   * Validate CourseSequence model (sequential ordering within department)
   */
  private async validateCourseSequence(
    studentId: string,
    courseId: string,
    completedCourseIds: Set<string>,
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Get the course to find its department
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        departmentId: true,
      },
    });

    if (!course) {
      return issues;
    }

    // Find the CourseSequence for this course
    const courseSequence = await this.prisma.courseSequence.findUnique({
      where: {
        departmentId_courseId: {
          departmentId: course.departmentId,
          courseId: courseId,
        },
      },
    });

    if (!courseSequence) {
      // No sequence defined for this course, skip validation
      return issues;
    }

    // Get all courses in the same department with lower sequence order
    const previousCoursesInSequence = await this.prisma.courseSequence.findMany({
      where: {
        departmentId: course.departmentId,
        sequenceOrder: {
          lt: courseSequence.sequenceOrder,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        sequenceOrder: 'asc',
      },
    });

    // Check if student has completed ALL previous courses in sequence
    const missingCourses: Array<{ id: string; code: string; name: string }> = [];
    
    for (const seq of previousCoursesInSequence) {
      if (!completedCourseIds.has(seq.courseId)) {
        missingCourses.push({
          id: seq.courseId,
          code: seq.course.code,
          name: seq.course.name,
        });
      }
    }

    if (missingCourses.length > 0) {
      const courseList = missingCourses.map(c => `${c.name} (${c.code})`).join(', ');
      
      issues.push({
        type: 'COURSE_SEQUENCE',
        severity: 'ERROR', // Sequential rules are typically strict
        message: `You must complete all previous courses in the sequence before taking this course. Missing: ${courseList}`,
        requiredCourseId: missingCourses[0].id, // First missing course
        requiredCourseCode: missingCourses[0].code,
        requiredCourseName: missingCourses[0].name,
        isOverridable: false, // Sequential rules are typically not overridable
      });
    }

    return issues;
  }

  /**
   * Validate multiple courses at once (for bulk validation)
   */
  async validateMultipleCourses(
    studentId: string,
    courseIds: string[],
  ): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    // Get student's completed courses once
    const studentCourseHistory = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        isPassed: true,
      },
      select: {
        courseId: true,
      },
    });

    const completedCourseIds = new Set(studentCourseHistory.map(h => h.courseId));

    // Validate each course
    for (const courseId of courseIds) {
      const issues: ValidationIssue[] = [];

      // Validate prerequisites
      const prerequisiteIssues = await this.validatePrerequisites(studentId, courseId, completedCourseIds);
      issues.push(...prerequisiteIssues);

      // Validate sequences
      const sequenceIssues = await this.validateSequentialRules(studentId, courseId, completedCourseIds);
      issues.push(...sequenceIssues);

      // Validate course sequence
      const courseSequenceIssues = await this.validateCourseSequence(studentId, courseId, completedCourseIds);
      issues.push(...courseSequenceIssues);

      const missingPrerequisites = issues.filter(i => i.type === 'PREREQUISITE');
      const sequenceViolations = issues.filter(i => i.type === 'SEQUENCE' || i.type === 'COURSE_SEQUENCE');
      const hasErrors = issues.some(i => i.severity === 'ERROR');
      const canProceed = !hasErrors;

      results.set(courseId, {
        isValid: issues.length === 0,
        canProceed,
        issues,
        missingPrerequisites,
        sequenceViolations,
      });
    }

    return results;
  }
}

