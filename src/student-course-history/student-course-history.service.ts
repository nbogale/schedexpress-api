import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentCourseHistoryDto } from './dto/create-student-course-history.dto';
import { UpdateStudentCourseHistoryDto } from './dto/update-student-course-history.dto';
import { CreateBulkStudentCourseHistoryDto, StudentGradeData } from './dto/create-bulk-student-course-history.dto';
import { GradeLookupService } from '../grade-lookup/grade-lookup.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AcademicPeriodBusinessRulesService } from '../academic-cycles/academic-period-business-rules.service';
import { ErrorCode } from '../common/error-codes';
import { ApiErrorResponseBuilder } from '../common/api-error-builder';
import { GradeType, Prisma } from '@prisma/client';

@Injectable()
export class StudentCourseHistoryService {
  private readonly logger = new Logger(StudentCourseHistoryService.name);

  constructor(
    private prisma: PrismaService,
    private gradeLookupService: GradeLookupService,
    private notificationsService: NotificationsService,
    private businessRulesService: AcademicPeriodBusinessRulesService,
  ) {}

  async create(createStudentCourseHistoryDto: CreateStudentCourseHistoryDto) {
    // If grade is provided, validate grading is allowed based on business rules
    if (createStudentCourseHistoryDto.grade && createStudentCourseHistoryDto.academicCycleId) {
      // Find course section to get info for validation
      const courseSection = await this.prisma.courseSection.findFirst({
        where: {
          courseId: createStudentCourseHistoryDto.courseId,
          academicCycleId: createStudentCourseHistoryDto.academicCycleId,
        },
        select: { id: true, teacherId: true },
      });

      // Validate grading is allowed
      if (courseSection) {
        const gradingValidation = await this.businessRulesService.canSubmitGrades(
          courseSection.teacherId,
          courseSection.id,
        );

        if (!gradingValidation.allowed) {
          const errorCode = gradingValidation.errorCode || ErrorCode.SCHB;
          const errorResponse = ApiErrorResponseBuilder.create(
            errorCode,
            gradingValidation.reason || 'Grading is not allowed at this time.'
          )
            .withLogger(this.logger)
            .build();
          throw new BadRequestException(errorResponse);
        }
      }
    }

    // If grade is provided, determine if it's passing based on grade lookup
    let isPassed = createStudentCourseHistoryDto.isPassed ?? true;
    if (createStudentCourseHistoryDto.grade) {
      try {
        isPassed = await this.gradeLookupService.isPassingGrade(createStudentCourseHistoryDto.grade);
      } catch (error) {
        // If grade not found in lookup, use the provided value or default to true
        isPassed = createStudentCourseHistoryDto.isPassed ?? true;
      }
    }

    const createdRecord = await this.prisma.studentCourseHistory.create({
      data: {
        studentId: createStudentCourseHistoryDto.studentId,
        courseId: createStudentCourseHistoryDto.courseId,
        academicCycleId: createStudentCourseHistoryDto.academicCycleId,
        grade: createStudentCourseHistoryDto.grade,
        isPassed,
        creditEarned: createStudentCourseHistoryDto.creditEarned ?? 1.0,
        gradeType: createStudentCourseHistoryDto.gradeType ?? GradeType.INTERIM,
        isFinal: createStudentCourseHistoryDto.gradeType === GradeType.FINAL,
        submittedBy: createStudentCourseHistoryDto.submittedBy,
        notes: createStudentCourseHistoryDto.notes,
        submissionDate: new Date(),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
        submittedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send email notification to student if grade is provided
    if (createStudentCourseHistoryDto.grade && createdRecord.student?.user?.email) {
      try {
        await this.notificationsService.sendGradeNotification({
          studentEmail: createdRecord.student.user.email,
          studentName: `${createdRecord.student.user.firstName} ${createdRecord.student.user.lastName}`,
          courseName: createdRecord.course.name,
          grade: createdRecord.grade,
          isPassed: createdRecord.isPassed,
        });
      } catch (error) {
        // Log error but don't fail the grade creation
        console.error('Failed to send grade notification:', error);
      }
    }

    return createdRecord;
  }

  async createBulk(createBulkStudentCourseHistoryDto: CreateBulkStudentCourseHistoryDto) {
    const { courseId, academicCycleId, students } = createBulkStudentCourseHistoryDto;
    
    const results = {
      created: [] as any[],
      errors: [] as any[],
      summary: {
        total: students.length,
        successful: 0,
        failed: 0,
      },
    };

    // Get teacher ID from course section if available (for submittedBy)
    const courseSection = await this.prisma.courseSection.findFirst({
      where: {
        courseId,
        academicCycleId,
      },
      select: { teacherId: true },
    });

    // Process each student in parallel for better performance
    const promises = students.map(async (studentData: StudentGradeData) => {
      try {
        // Determine if it's passing based on grade lookup
        let isPassed = studentData.isPassed ?? true;
        if (studentData.grade) {
          try {
            isPassed = await this.gradeLookupService.isPassingGrade(studentData.grade);
          } catch (error) {
            // If grade not found in lookup, use the provided value or default to true
            isPassed = studentData.isPassed ?? true;
          }
        }

        // Allow multiple submissions - create new record as INTERIM grade
        const createdRecord = await this.prisma.studentCourseHistory.create({
          data: {
            studentId: studentData.studentId,
            courseId,
            academicCycleId,
            grade: studentData.grade,
            isPassed,
            creditEarned: studentData.creditEarned ?? 1.0,
            gradeType: GradeType.INTERIM,
            isFinal: false,
            submittedBy: courseSection?.teacherId,
            submissionDate: new Date(),
          },
          include: {
            student: {
              include: {
                user: true,
              },
            },
            course: true,
            submittedByUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        results.created.push(createdRecord);
        results.summary.successful++;
      } catch (error) {
        results.errors.push({
          studentId: studentData.studentId,
          error: error.message || 'Unknown error occurred',
        });
        results.summary.failed++;
      }
    });

    await Promise.all(promises);

    return results;
  }

  async findAll() {
    return this.prisma.studentCourseHistory.findMany({
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
  }

  async findByStudent(studentId: string) {
    return this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
  }

  async findByCourse(courseId: string) {
    return this.prisma.studentCourseHistory.findMany({
      where: {
        courseId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
  }

  async findByAcademicCycle(academicCycleId: string) {
    return this.prisma.studentCourseHistory.findMany({
      where: {
        academicCycleId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
  }

  async findByTerm(academicCycleId: string) {
    return this.prisma.studentCourseHistory.findMany({
      where: {
        academicCycleId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
  }

  async findOne(id: string) {
    const studentCourseHistory = await this.prisma.studentCourseHistory.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });

    if (!studentCourseHistory) {
      throw new NotFoundException(`Student course history with ID ${id} not found`);
    }

    return studentCourseHistory;
  }

  async update(id: string, updateStudentCourseHistoryDto: UpdateStudentCourseHistoryDto) {
    // Check if the record exists
    await this.findOne(id);

    // If grade is being updated, determine if it's passing based on grade lookup
    let isPassed = updateStudentCourseHistoryDto.isPassed;
    if (updateStudentCourseHistoryDto.grade) {
      try {
        isPassed = await this.gradeLookupService.isPassingGrade(updateStudentCourseHistoryDto.grade);
      } catch (error) {
        // If grade not found in lookup, keep the existing isPassed value
        const existingRecord = await this.findOne(id);
        isPassed = isPassed ?? existingRecord.isPassed;
      }
    }

    return this.prisma.studentCourseHistory.update({
      where: { id },
      data: {
        studentId: updateStudentCourseHistoryDto.studentId,
        courseId: updateStudentCourseHistoryDto.courseId,
        academicCycleId: updateStudentCourseHistoryDto.academicCycleId,
        grade: updateStudentCourseHistoryDto.grade,
        isPassed,
        creditEarned: updateStudentCourseHistoryDto.creditEarned,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
  }

  async remove(id: string) {
    // Check if the record exists
    await this.findOne(id);

    return this.prisma.studentCourseHistory.delete({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
  }

  async getStudentTranscript(studentId: string) {
    return this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
      },
      include: {
        course: {
          include: {
            department: true,
            courseLevel: true,
          },
        },
        academicCycle: true,
      },
      orderBy: [
      ],
    });
  }

  async getStudentCreditsByTerm(studentId: string, academicCycleId: string) {
    const records = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        academicCycleId,
        isPassed: true,
      },
    });

    return records.reduce((total, record) => {
      return total + Number(record.creditEarned);
    }, 0);
  }

  async getStudentTotalCredits(studentId: string) {
    const records = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        isPassed: true,
      },
    });

    return records.reduce((total, record) => {
      return total + Number(record.creditEarned);
    }, 0);
  }

  /**
   * Get all grade submissions (history) for a student/course/cycle
   */
  async getGradeHistory(
    studentId: string,
    courseId: string,
    academicCycleId: string
  ) {
    return this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        courseId,
        academicCycleId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
        academicCycle: true,
        submittedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        submissionDate: 'desc',
      },
    });
  }

  /**
   * Get the current (latest) grade for a student/course/cycle
   */
  async getCurrentGrade(
    studentId: string,
    courseId: string,
    academicCycleId: string
  ) {
    return this.prisma.studentCourseHistory.findFirst({
      where: {
        studentId,
        courseId,
        academicCycleId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
        academicCycle: true,
        submittedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        submissionDate: 'desc',
      },
    });
  }

  /**
   * Create an interim grade submission
   */
  async createInterimGrade(
    studentId: string,
    courseId: string,
    academicCycleId: string,
    grade: string,
    submittedBy: string,
    notes?: string
  ) {
    // Validate grading is allowed
    const courseSection = await this.prisma.courseSection.findFirst({
      where: {
        courseId,
        academicCycleId,
      },
      select: { id: true, teacherId: true },
    });

    if (courseSection) {
      const gradingValidation = await this.businessRulesService.canSubmitGrades(
        courseSection.teacherId,
        courseSection.id,
      );

      if (!gradingValidation.allowed) {
        const errorCode = gradingValidation.errorCode || ErrorCode.SCHB;
        const errorResponse = ApiErrorResponseBuilder.create(
          errorCode,
          gradingValidation.reason || 'Grading is not allowed at this time.'
        )
          .withLogger(this.logger)
          .build();
        throw new BadRequestException(errorResponse);
      }
    }

    // Determine if it's passing
    let isPassed = true;
    try {
      isPassed = await this.gradeLookupService.isPassingGrade(grade);
    } catch (error) {
      this.logger.warn(`Grade ${grade} not found in lookup, defaulting to passing`);
    }

    // Get course credits for creditEarned
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { credits: true },
    });

    return this.prisma.studentCourseHistory.create({
      data: {
        studentId,
        courseId,
        academicCycleId,
        grade,
        isPassed,
        creditEarned: course?.credits ? Number(course.credits) : 1.0,
        gradeType: GradeType.INTERIM,
        isFinal: false,
        submittedBy,
        notes,
        submissionDate: new Date(),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
        submittedByUser: {
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

  /**
   * Calculate and set final grade based on interim grades
   */
  async calculateFinalGrade(
    studentId: string,
    courseId: string,
    academicCycleId: string,
    calculationMethod: 'AVERAGE' | 'WEIGHTED' | 'LATEST' | 'MANUAL' = 'AVERAGE',
    manualGrade?: string
  ) {
    // Check if final grade already exists
    const existingFinal = await this.prisma.studentCourseHistory.findFirst({
      where: {
        studentId,
        courseId,
        academicCycleId,
        gradeType: GradeType.FINAL,
      },
    });

    if (existingFinal) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(
          ErrorCode.SCHB,
          'Final grade already exists for this student/course/cycle.'
        )
          .withLogger(this.logger)
          .build()
      );
    }

    // Get all interim grades
    const interimGrades = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        courseId,
        academicCycleId,
        gradeType: GradeType.INTERIM,
      },
      orderBy: {
        submissionDate: 'asc',
      },
    });

    if (interimGrades.length === 0) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(
          ErrorCode.SCHB,
          'No interim grades found to calculate final grade from.'
        )
          .withLogger(this.logger)
          .build()
      );
    }

    let finalGrade: string;
    const gradeIds = interimGrades.map(g => g.id);

    if (calculationMethod === 'MANUAL' && manualGrade) {
      finalGrade = manualGrade;
    } else if (calculationMethod === 'LATEST') {
      // Use the most recent interim grade
      finalGrade = interimGrades[interimGrades.length - 1].grade || '';
    } else {
      // Calculate average - convert grades to points, then find closest grade
      const gradePointsPromises = interimGrades.map(async (grade) => {
        if (!grade.grade) return null;
        try {
          return {
            grade: grade.grade,
            points: await this.gradeLookupService.getGradePoints(grade.grade),
          };
        } catch {
          return null;
        }
      });

      const gradeData = (await Promise.all(gradePointsPromises)).filter(
        (gd): gd is { grade: string; points: number } => gd !== null
      );

      if (gradeData.length === 0) {
        throw new BadRequestException(
          ApiErrorResponseBuilder.create(
            ErrorCode.SCHB,
            'Unable to calculate final grade - invalid grade values.'
          )
            .withLogger(this.logger)
            .build()
        );
      }

      const averagePoints = gradeData.reduce((sum, gd) => sum + gd.points, 0) / gradeData.length;
      
      // Get all grade lookups to find the closest match
      const allGradeLookups = await this.prisma.gradeLookup.findMany({
        where: { isActive: true },
        orderBy: { gradePoints: 'asc' },
      });

      // Find the closest grade by points
      let closestGrade = allGradeLookups[0]?.grade || gradeData[0].grade;
      let minDifference = Math.abs(Number(allGradeLookups[0]?.gradePoints || 0) - averagePoints);

      for (const lookup of allGradeLookups) {
        const difference = Math.abs(Number(lookup.gradePoints) - averagePoints);
        if (difference < minDifference) {
          minDifference = difference;
          closestGrade = lookup.grade;
        }
      }

      finalGrade = closestGrade;
    }

    if (!finalGrade) {
      throw new BadRequestException(
        ApiErrorResponseBuilder.create(
          ErrorCode.SCHB,
          'Unable to determine final grade.'
        )
          .withLogger(this.logger)
          .build()
      );
    }

    // Determine if passing
    let isPassed = true;
    try {
      isPassed = await this.gradeLookupService.isPassingGrade(finalGrade);
    } catch (error) {
      this.logger.warn(`Final grade ${finalGrade} not found in lookup, defaulting to passing`);
    }

    // Get course credits
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { credits: true },
    });

    // Create final grade record
    const finalRecord = await this.prisma.studentCourseHistory.create({
      data: {
        studentId,
        courseId,
        academicCycleId,
        grade: finalGrade,
        isPassed,
        creditEarned: course?.credits ? Number(course.credits) : 1.0,
        gradeType: GradeType.FINAL,
        isFinal: true,
        calculatedFrom: JSON.stringify(gradeIds),
        calculationMethod,
        submissionDate: new Date(),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
        submittedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return finalRecord;
  }
} 