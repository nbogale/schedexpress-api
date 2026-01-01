import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoursePreferenceDto } from './dto/create-course-preference.dto';
import { AssignCoursePreferenceDto } from './dto/assign-course-preference.dto';
import { UpdateCoursePreferenceDto, CoursePreferenceStatus } from './dto/update-course-preference.dto';
import { PrerequisiteValidationService, ValidationResult } from './prerequisite-validation.service';
import { Prisma, PreferenceSource } from '@prisma/client';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

@Injectable()
export class CoursePreferencesService {
  constructor(
    private prisma: PrismaService,
    private validationService: PrerequisiteValidationService,
  ) {}

  async create(createDto: CreateCoursePreferenceDto, userId: string, options?: {
    source?: PreferenceSource;
    autoApprove?: boolean;
    createdBy?: string;
  }) {
    // Get student from user ID
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found for this user');
    }

    const studentId = student.id;
    const source = options?.source || PreferenceSource.STUDENT_INITIATED;
    const autoApprove = options?.autoApprove || false;
    const createdBy = options?.createdBy || null;

    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Verify academic cycle exists
    const academicCycle = await this.prisma.academicCycle.findUnique({
      where: { id: createDto.academicCycleId },
    });

    if (!academicCycle) {
      throw new NotFoundException('Academic cycle not found');
    }

    // Check if preference already exists
    const existing = await this.prisma.coursePreference.findUnique({
      where: {
        studentId_courseId_academicCycleId: {
          studentId,
          courseId: createDto.courseId,
          academicCycleId: createDto.academicCycleId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Course preference already exists for this student and academic cycle');
    }

    // Validate prerequisites and sequential rules
    const validationResult = await this.validationService.validateAllRules(studentId, createDto.courseId);
    
    // If validation fails with non-overridable errors, block creation
    if (!validationResult.canProceed) {
      const errorMessages = validationResult.issues
        .filter(i => i.severity === 'ERROR')
        .map(i => i.message)
        .join('; ');
      throw new BadRequestException(`Cannot create preference: ${errorMessages}`);
    }

    // Determine priority: use provided priority or auto-assign next available
    let priority = createDto.priority;
    
    if (!priority) {
      // Auto-assign: find the highest priority for this student/academic cycle and add 1
      const existingPreferences = await this.prisma.coursePreference.findMany({
        where: {
          studentId,
          academicCycleId: createDto.academicCycleId,
        },
        orderBy: {
          priority: 'desc',
        },
        take: 1,
      });

      if (existingPreferences.length > 0 && existingPreferences[0].priority !== null) {
        priority = existingPreferences[0].priority! + 1;
      } else {
        priority = 1; // First preference
      }
    } else {
      // Check if priority is already taken
      const existingPriority = await this.prisma.coursePreference.findFirst({
        where: {
          studentId,
          academicCycleId: createDto.academicCycleId,
          priority,
        },
      });

      if (existingPriority) {
        throw new BadRequestException(`Priority ${priority} is already assigned to another course preference`);
      }
    }

    // Determine initial status: APPROVED if autoApprove is true, otherwise DRAFT
    let initialStatus = CoursePreferenceStatus.DRAFT;
    let reviewedById = null;
    let reviewedAt = null;
    let submittedAt = null;

    if (autoApprove) {
      initialStatus = CoursePreferenceStatus.APPROVED;
      reviewedById = createdBy;
      reviewedAt = new Date();
      submittedAt = new Date();
    }

    // Create preference
    return this.prisma.coursePreference.create({
      data: {
        studentId,
        courseId: createDto.courseId,
        academicCycleId: createDto.academicCycleId,
        reason: createDto.reason,
        priority,
        status: initialStatus,
        source,
        createdBy,
        autoApproved: autoApprove,
        reviewedById,
        reviewedAt,
        submittedAt,
      },
      include: {
        course: {
          include: {
            department: true,
            courseLevel: true,
            minGradeLevel: true,
          },
        },
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
  }

  async assignCourseForStudent(
    studentId: string,
    assignDto: AssignCoursePreferenceDto,
    counselorUserId: string,
  ) {
    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: assignDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Verify academic cycle exists
    const academicCycle = await this.prisma.academicCycle.findUnique({
      where: { id: assignDto.academicCycleId },
    });

    if (!academicCycle) {
      throw new NotFoundException('Academic cycle not found');
    }

    // Check if preference already exists
    const existing = await this.prisma.coursePreference.findUnique({
      where: {
        studentId_courseId_academicCycleId: {
          studentId,
          courseId: assignDto.courseId,
          academicCycleId: assignDto.academicCycleId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Course preference already exists for this student and academic cycle');
    }

    // Validate prerequisites and sequential rules (counselors can override with reason)
    const validationResult = await this.validationService.validateAllRules(studentId, assignDto.courseId);
    
    // For counselor assignments, we allow warnings but still block non-overridable errors
    if (!validationResult.canProceed) {
      const errorMessages = validationResult.issues
        .filter(i => i.severity === 'ERROR')
        .map(i => i.message)
        .join('; ');
      
      // If there are errors and no reason provided, require reason for override
      if (!assignDto.reason) {
        throw new BadRequestException(
          `Cannot assign course: ${errorMessages}. Please provide a reason to override.`
        );
      }
    }

    // Determine priority: use provided priority or auto-assign next available
    let priority = assignDto.priority;
    
    if (!priority) {
      // Auto-assign: find the highest priority for this student/academic cycle and add 1
      const existingPreferences = await this.prisma.coursePreference.findMany({
        where: {
          studentId,
          academicCycleId: assignDto.academicCycleId,
        },
        orderBy: {
          priority: 'desc',
        },
        take: 1,
      });

      if (existingPreferences.length > 0 && existingPreferences[0].priority !== null) {
        priority = existingPreferences[0].priority! + 1;
      } else {
        priority = 1; // First preference
      }
    } else {
      // Check if priority is already taken
      const existingPriority = await this.prisma.coursePreference.findFirst({
        where: {
          studentId,
          academicCycleId: assignDto.academicCycleId,
          priority,
        },
      });

      if (existingPriority) {
        throw new BadRequestException(`Priority ${priority} is already assigned to another course preference`);
      }
    }

    // Determine initial status: APPROVED if autoApprove is true, otherwise SUBMITTED
    const autoApprove = assignDto.autoApprove !== undefined ? assignDto.autoApprove : true;
    let initialStatus = CoursePreferenceStatus.SUBMITTED;
    let reviewedById = null;
    let reviewedAt = null;
    let submittedAt = new Date();

    if (autoApprove) {
      initialStatus = CoursePreferenceStatus.APPROVED;
      reviewedById = counselorUserId;
      reviewedAt = new Date();
    }

    // Create preference
    return this.prisma.coursePreference.create({
      data: {
        studentId,
        courseId: assignDto.courseId,
        academicCycleId: assignDto.academicCycleId,
        reason: assignDto.reason,
        priority,
        status: initialStatus,
        source: PreferenceSource.COUNSELOR_INITIATED,
        createdBy: counselorUserId,
        autoApproved: autoApprove,
        reviewedById,
        reviewedAt,
        submittedAt,
      },
      include: {
        course: {
          include: {
            department: true,
            courseLevel: true,
            minGradeLevel: true,
          },
        },
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
            gradeLevel: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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

  async findAll(params: {
    studentId?: string;
    academicCycleId?: string;
    status?: CoursePreferenceStatus;
    skip?: number;
    take?: number;
  }) {
    const { studentId, academicCycleId, status, skip, take } = params;

    const where: Prisma.CoursePreferenceWhereInput = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (academicCycleId) {
      where.academicCycleId = academicCycleId;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.coursePreference.findMany({
      where,
      skip,
      take,
      include: {
        course: {
          include: {
            department: true,
            courseLevel: true,
            minGradeLevel: true,
          },
        },
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
            gradeLevel: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
        {
          priority: 'asc', // Sort by priority first (1st choice, 2nd choice, etc.)
        },
        {
          createdAt: 'desc', // Then by creation date
        },
      ],
    });
  }

  async findOne(id: string) {
    const preference = await this.prisma.coursePreference.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            department: true,
            courseLevel: true,
            minGradeLevel: true,
          },
        },
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
            gradeLevel: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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

    if (!preference) {
      throw new NotFoundException('Course preference not found');
    }

    return preference;
  }

  async update(id: string, updateDto: UpdateCoursePreferenceDto, userId: string, userRole: string) {
    const preference = await this.findOne(id);

    // Students can only update their own preferences if status is DRAFT
    if (userRole === 'STUDENT') {
      if (preference.student.user.id !== userId) {
        throw new ForbiddenException('You can only update your own preferences');
      }

      if (preference.status !== CoursePreferenceStatus.DRAFT) {
        throw new BadRequestException('You can only update preferences that are in DRAFT status');
      }

      // Students can only update courseId, academicCycleId, reason, and priority
      // They cannot change status or counselorNotes
      const { status, counselorNotes, ...studentUpdateData } = updateDto;
      
      // If courseId is being updated, validate prerequisites
      if (studentUpdateData.courseId && studentUpdateData.courseId !== preference.courseId) {
        const validationResult = await this.validationService.validateAllRules(
          preference.studentId,
          studentUpdateData.courseId,
        );
        
        // If validation fails with non-overridable errors, block update
        if (!validationResult.canProceed) {
          const errorMessages = validationResult.issues
            .filter(i => i.severity === 'ERROR')
            .map(i => i.message)
            .join('; ');
          throw new BadRequestException(`Cannot update preference: ${errorMessages}`);
        }
      }
      
      // If priority is being updated, check for conflicts
      if (studentUpdateData.priority !== undefined) {
        const existingPriority = await this.prisma.coursePreference.findFirst({
          where: {
            studentId: preference.studentId,
            academicCycleId: preference.academicCycleId,
            priority: studentUpdateData.priority,
            id: { not: id }, // Exclude current preference
          },
        });

        if (existingPriority) {
          throw new BadRequestException(`Priority ${studentUpdateData.priority} is already assigned to another course preference`);
        }
      }
      
      return this.prisma.coursePreference.update({
        where: { id },
        data: studentUpdateData,
        include: {
          course: {
            include: {
              department: true,
              courseLevel: true,
              minGradeLevel: true,
            },
          },
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
    }

    // Counselors/Admins can update all fields
    const updateData: any = { ...updateDto };

    // If priority is being updated, check for conflicts
    if (updateDto.priority !== undefined) {
      const existingPriority = await this.prisma.coursePreference.findFirst({
        where: {
          studentId: preference.studentId,
          academicCycleId: preference.academicCycleId,
          priority: updateDto.priority,
          id: { not: id }, // Exclude current preference
        },
      });

      if (existingPriority) {
        throw new BadRequestException(`Priority ${updateDto.priority} is already assigned to another course preference`);
      }
    }

    // If status is being changed to APPROVED or REJECTED, set reviewedAt and reviewedById
    if (updateDto.status === CoursePreferenceStatus.APPROVED || 
        updateDto.status === CoursePreferenceStatus.REJECTED) {
      updateData.reviewedAt = new Date();
      updateData.reviewedById = userId;
    }

    // If status is being changed to SUBMITTED, set submittedAt
    if (updateDto.status === CoursePreferenceStatus.SUBMITTED) {
      updateData.submittedAt = new Date();
    }

    return this.prisma.coursePreference.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          include: {
            department: true,
            courseLevel: true,
            minGradeLevel: true,
          },
        },
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
            gradeLevel: true,
          },
        },
        reviewer: {
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

  async remove(id: string, userId: string, userRole: string) {
    const preference = await this.findOne(id);

    // Students can only delete their own preferences if status is DRAFT
    if (userRole === 'STUDENT') {
      if (preference.student.user.id !== userId) {
        throw new ForbiddenException('You can only delete your own preferences');
      }

      if (preference.status !== CoursePreferenceStatus.DRAFT) {
        throw new BadRequestException('You can only delete preferences that are in DRAFT status');
      }
    }

    return this.prisma.coursePreference.delete({
      where: { id },
    });
  }

  async submitPreference(id: string, userId: string) {
    const preference = await this.findOne(id);

    // Get student from user ID
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found for this user');
    }

    // Verify student owns this preference
    if (preference.studentId !== student.id) {
      throw new ForbiddenException('You can only submit your own preferences');
    }

    // Only DRAFT preferences can be submitted
    if (preference.status !== CoursePreferenceStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT preferences can be submitted');
    }

    return this.prisma.coursePreference.update({
      where: { id },
      data: {
        status: CoursePreferenceStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        course: {
          include: {
            department: true,
            courseLevel: true,
            minGradeLevel: true,
          },
        },
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
  }

  /**
   * Get export data for course preferences
   */
  private async getExportData(academicCycleId?: string) {
    const preferences = await this.prisma.coursePreference.findMany({
      where: academicCycleId ? { academicCycleId } : undefined,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });

    return preferences.map((pref) => ({
      student_id: pref.student.studentId || pref.student.id,
      course_id: pref.course.code,
      course_name: pref.course.name,
    }));
  }

  /**
   * Generate CSV export for course preferences
   */
  async generateCSVExport(academicCycleId?: string): Promise<string> {
    const exportData = await this.getExportData(academicCycleId);

    const headers = ['student_id', 'course_id', 'course_name'];

    const rows = exportData.map((row) => [
      row.student_id,
      row.course_id,
      row.course_name,
    ]);

    return Papa.unparse([headers, ...rows]);
  }

  /**
   * Generate Excel export for course preferences
   */
  async generateExcelExport(academicCycleId?: string): Promise<Buffer> {
    const exportData = await this.getExportData(academicCycleId);

    const headers = ['student_id', 'course_id', 'course_name'];

    // Convert to array of arrays for XLSX
    const rows = exportData.map((row) => [
      row.student_id,
      row.course_id,
      row.course_name,
    ]);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths for better readability
    const colWidths = [
      { wch: 15 }, // student_id
      { wch: 15 }, // course_id
      { wch: 40 }, // course_name
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Course Preferences');

    // Convert to buffer
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

