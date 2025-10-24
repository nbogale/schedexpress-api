import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentCourseHistoryDto } from './dto/create-student-course-history.dto';
import { UpdateStudentCourseHistoryDto } from './dto/update-student-course-history.dto';
import { CreateBulkStudentCourseHistoryDto, StudentGradeData } from './dto/create-bulk-student-course-history.dto';
import { GradeLookupService } from '../grade-lookup/grade-lookup.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class StudentCourseHistoryService {
  constructor(
    private prisma: PrismaService,
    private gradeLookupService: GradeLookupService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createStudentCourseHistoryDto: CreateStudentCourseHistoryDto) {
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

    // Process each student in parallel for better performance
    const promises = students.map(async (studentData: StudentGradeData) => {
      try {
        // Check if record already exists
        const existingRecord = await this.prisma.studentCourseHistory.findFirst({
          where: {
            studentId: studentData.studentId,
            courseId,
            academicCycleId,
          },
        });

        if (existingRecord) {
          results.errors.push({
            studentId: studentData.studentId,
            error: 'Record already exists for this student, course, school year, and term',
          });
          results.summary.failed++;
          return;
        }

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

        const createdRecord = await this.prisma.studentCourseHistory.create({
          data: {
            studentId: studentData.studentId,
            courseId,
            academicCycleId,
            grade: studentData.grade,
            isPassed,
            creditEarned: studentData.creditEarned ?? 1.0,
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
} 