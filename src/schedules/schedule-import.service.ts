import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CycleType, RotationDay } from '@prisma/client';
// Note: ScheduleImportStatus and ScheduleImportRowStatus will be available after Prisma client regeneration
// Using string literals for now
type ScheduleImportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED_SUCCESS' | 'COMPLETED_WITH_ERRORS' | 'FAILED' | 'CANCELLED' | 'SUPERSEDED';
type ScheduleImportRowStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'WARNING';

// Helper constants for status values (until Prisma enum is available)
const IMPORT_STATUS = {
  PENDING: 'PENDING' as const,
  PROCESSING: 'PROCESSING' as const,
  COMPLETED_SUCCESS: 'COMPLETED_SUCCESS' as const,
  COMPLETED_WITH_ERRORS: 'COMPLETED_WITH_ERRORS' as const,
  FAILED: 'FAILED' as const,
  CANCELLED: 'CANCELLED' as const,
  SUPERSEDED: 'SUPERSEDED' as const,
};

const ROW_STATUS = {
  PENDING: 'PENDING' as const,
  SUCCESS: 'SUCCESS' as const,
  FAILED: 'FAILED' as const,
  SKIPPED: 'SKIPPED' as const,
  WARNING: 'WARNING' as const,
};
import * as Papa from 'papaparse';
import * as path from 'path';
import * as fs from 'fs/promises';

// Interfaces for parsed CSV data
export interface ParsedScheduleRow {
  studentId?: string; // Optional for planning schedules
  academicCycleName?: string; // Optional - provided during upload
  courseCode: string;
  sectionNumber: string;
  timeBlockName: string;
  endTimeBlockName?: string;
  roomName: string;
  teacherId?: string;
  teacherEmail?: string;
  maxEnrollment: number;
  rotationDay?: string;
  isPlanning?: boolean; // Flag to indicate this is a planning schedule
}

export interface ScheduleImportResult {
  importFileId: string;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  skippedRows: number;
  status: ScheduleImportStatus;
  errors?: any[];
  warnings?: any[];
}

@Injectable()
export class ScheduleImportService {
  private readonly logger = new Logger(ScheduleImportService.name);
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'schedule-imports');

  constructor(private readonly prisma: PrismaService) {
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create upload directory', error);
    }
  }

  /**
   * Check for existing completed imports for an academic cycle
   */
  async checkExistingImports(academicCycleId: string) {
    const existingImports = await this.prisma.scheduleImportFile.findMany({
      where: {
        academicCycleId,
        status: {
          in: [
            IMPORT_STATUS.COMPLETED_SUCCESS,
            IMPORT_STATUS.COMPLETED_WITH_ERRORS,
          ],
        },
      },
      include: {
        uploadedByUser: {
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

    return existingImports.map((importFile) => ({
      id: importFile.id,
      fileName: importFile.originalFileName,
      uploadedAt: importFile.createdAt,
      uploadedBy: importFile.uploadedByUser
        ? `${importFile.uploadedByUser.firstName} ${importFile.uploadedByUser.lastName}`
        : 'Unknown',
      status: importFile.status,
      totalRows: importFile.totalRows,
      successfulRows: importFile.successfulRows,
      failedRows: importFile.failedRows,
    }));
  }

  /**
   * Process schedule import from CSV file
   */
  async processScheduleImport(
    file: any,
    academicCycleName: string,
    uploadedBy: string,
    overrideExisting: boolean = false,
  ): Promise<ScheduleImportResult> {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    console.log('academicCycleName:', academicCycleName);

    console.log('overrideExisting:', overrideExisting);

    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== '.csv') {
      throw new BadRequestException('Only CSV files are supported');
    }

    // Parse CSV (academic cycle is provided during upload, not required in CSV)
    const fileContent = file.buffer.toString('utf-8');
    const parsedRows = this.parseCSV(fileContent);

    if (parsedRows.length === 0) {
      throw new BadRequestException('No valid rows found in CSV file');
    }

    // Lookup academic cycle by name
    const academicCycle = await this.prisma.academicCycle.findFirst({
      where: { name: academicCycleName , cycleType: CycleType.SCHOOL_YEAR},
    });

    if (!academicCycle) {
      throw new NotFoundException(
        `Academic cycle "${academicCycleName}" not found`,
      );
    }

    // Check for existing imports
    if (!overrideExisting) {
      const existingImports = await this.checkExistingImports(academicCycle.id);
      if (existingImports.length > 0) {
        // Return a special error response that frontend can handle
        const error = new BadRequestException({
          message: 'Existing imports found for this academic cycle',
          existingImports,
          errorCode: 'SCHIMP001',
        });
        (error as any).existingImports = existingImports;
        throw error;
      }
    }

    // Save file to disk
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, file.buffer);

    // Create import file record
    const importFile = await this.prisma.scheduleImportFile.create({
      data: {
        fileName,
        originalFileName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        academicCycleId: academicCycle.id,
        academicCycleName,
        status: 'PENDING' as any,
        uploadedBy,
        totalRows: parsedRows.length,
      },
    });

    // Handle override if needed
    if (overrideExisting) {
      await this.handleOverrideExisting(academicCycle.id, importFile.id);
    }

    // Process rows asynchronously (in background)
    this.processRowsAsync(importFile.id, parsedRows, academicCycle.id);

    return {
      importFileId: importFile.id,
      totalRows: parsedRows.length,
      processedRows: 0,
      successfulRows: 0,
      failedRows: 0,
      skippedRows: 0,
      status: IMPORT_STATUS.PROCESSING as any,
    };
  }

  /**
   * Handle overriding existing schedule data
   */
  private async handleOverrideExisting(
    academicCycleId: string,
    importFileId: string,
  ) {
    // Mark previous imports as SUPERSEDED
    await this.prisma.scheduleImportFile.updateMany({
      where: {
        academicCycleId,
        status: {
          in: [
            IMPORT_STATUS.COMPLETED_SUCCESS,
            IMPORT_STATUS.COMPLETED_WITH_ERRORS,
          ],
        },
      },
      data: {
        status: IMPORT_STATUS.SUPERSEDED as any,
      },
    });

    // Delete existing schedules for this academic cycle
    const existingSchedules = await this.prisma.schedule.findMany({
      where: { academicCycleId },
      include: {
        scheduleCourseSections: true,
      },
    });

    // Delete all schedule course sections first (cascade should handle this, but being explicit)
    for (const schedule of existingSchedules) {
      await this.prisma.scheduleCourseSection.deleteMany({
        where: { scheduleId: schedule.id },
      });
    }

    // Delete schedules
    await this.prisma.schedule.deleteMany({
      where: { academicCycleId },
    });

    this.logger.log(
      `Deleted ${existingSchedules.length} existing schedules for academic cycle ${academicCycleId}`,
    );
  }

  /**
   * Parse CSV file content
   */
  private parseCSV(fileContent: string): ParsedScheduleRow[] {
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: 'greedy', // More aggressive empty line skipping
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      transform: (value: string) => {
        // Trim whitespace from all values
        return typeof value === 'string' ? value.trim() : value;
      },
    });

    const rows: ParsedScheduleRow[] = [];

    parsed.data.forEach((row: any, index: number) => {
      try {
        // Helper to safely extract and trim string values from CSV
        const getStringValue = (value: any): string => {
          if (value === null || value === undefined || value === '') {
            return '';
          }
          return String(value).trim();
        };

        // Check if row is completely empty (all fields are empty/null/undefined)
        const hasAnyValue = Object.values(row).some((value: any) => {
          const str = getStringValue(value);
          return str.length > 0;
        });

        // Skip completely empty rows
        if (!hasAnyValue) {
          this.logger.debug(`Row ${index + 2}: Skipping empty row`);
          return;
        }

        const studentId = getStringValue(row.student_id);
        const courseCode = getStringValue(row.course_code);
        // Detect planning schedules: empty student_id and course_code is "Planning" (case-insensitive)
        const isPlanning = !studentId && courseCode.toUpperCase() === 'PLANNING';

        // Map CSV headers to internal field names (support both new and old header names)
        const timeBlockName = getStringValue(row.period_start || row.time_block_name);
        const endTimeBlockNameValue = getStringValue(row.period_end || row.end_time_block_name);
        const endTimeBlockName = endTimeBlockNameValue || undefined;
        const roomName = getStringValue(row.room_no || row.room_name);
        const academicCycleName = getStringValue(row.academic_cycle_name);
        const sectionNumber = getStringValue(row.section_number);

        const parsedRow: ParsedScheduleRow = {
          studentId: studentId || undefined, // Only set if not empty
          academicCycleName: academicCycleName,
          courseCode: courseCode,
          sectionNumber: sectionNumber,
          // Map new CSV headers to internal field names
          timeBlockName: timeBlockName,
          endTimeBlockName: endTimeBlockName || undefined,
          roomName: roomName,
          teacherId: getStringValue(row.teacher_id) || undefined,
          teacherEmail: getStringValue(row.teacher_email)
            ? getStringValue(row.teacher_email).toLowerCase()
            : undefined,
          maxEnrollment: isPlanning 
            ? 0 // Planning schedules have no enrollment
            : parseInt(row.max_enrollment || '30', 10),
          rotationDay: getStringValue(row.rotation_day)
            ? getStringValue(row.rotation_day).toUpperCase()
            : undefined,
          isPlanning: isPlanning,
        };

        // Validate required fields
        // For planning schedules, student_id is optional
        const missingFields: string[] = [];
        
        if (!parsedRow.studentId && !isPlanning) {
          missingFields.push('student_id');
        }
        // academic_cycle_name is optional - provided during upload
        if (!parsedRow.courseCode) {
          missingFields.push('course_code');
        }
        if (!parsedRow.sectionNumber) {
          missingFields.push('section_number');
        }
        if (!parsedRow.timeBlockName) {
          missingFields.push('period_start');
        }
        if (!parsedRow.roomName) {
          missingFields.push('room_no');
        }

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate teacher identification
        if (!parsedRow.teacherId && !parsedRow.teacherEmail) {
          throw new Error('Either teacher_id or teacher_email is required');
        }

        // Additional validation for planning schedules
        if (isPlanning && parsedRow.courseCode.toUpperCase() !== 'PLANNING') {
          throw new Error('Planning schedule must have course_code="Planning"');
        }

        rows.push(parsedRow);
      } catch (error) {
        this.logger.warn(`Row ${index + 2}: ${error.message}`);
      }
    });

    return rows;
  }

  /**
   * Process rows asynchronously (runs in background)
   */
  private async processRowsAsync(
    importFileId: string,
    rows: ParsedScheduleRow[],
    academicCycleId: string,
  ) {
    // Update status to PROCESSING
    await this.prisma.scheduleImportFile.update({
      where: { id: importFileId },
      data: {
        status: IMPORT_STATUS.PROCESSING as any,
        processingStartedAt: new Date(),
      },
    });

    const batchSize = 100;
    let processedRows = 0;
    let successfulRows = 0;
    let failedRows = 0;
    let skippedRows = 0;
    const errors: any[] = [];

    try {
      // Process rows individually (each in its own transaction)
      // This prevents one failed row from aborting the entire batch
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 for header row and 0-based index

        try {
          // Process each row in its own transaction
          const result = await this.prisma.$transaction(async (tx) => {
            return await this.processRow(
              row,
              academicCycleId,
              importFileId,
              rowNumber,
              tx,
            );
          });

          if (result.status === ROW_STATUS.SUCCESS) {
            successfulRows++;
          } else if (result.status === ROW_STATUS.SKIPPED) {
            skippedRows++;
          } else {
            failedRows++;
            errors.push({
              row: rowNumber,
              studentId: row.studentId || 'N/A (Planning)',
              courseCode: row.courseCode,
              error: (result as any).errorMessage || 'Unknown error',
            });
          }
        } catch (error) {
          failedRows++;
          errors.push({
            row: rowNumber,
            studentId: row.studentId,
            courseCode: row.courseCode,
            error: error.message || 'Unknown error',
          });
        }

        processedRows++;

        // Update progress every 10 rows to avoid too many writes
        if (processedRows % 10 === 0) {
          await this.prisma.scheduleImportFile.update({
            where: { id: importFileId },
            data: {
              processedRows,
              successfulRows,
              failedRows,
              skippedRows,
            },
          });
        }
      }

      // Final progress update
      await this.prisma.scheduleImportFile.update({
        where: { id: importFileId },
        data: {
          processedRows,
          successfulRows,
          failedRows,
          skippedRows,
        },
      });

      // Mark as completed
      const finalStatus =
        failedRows === 0
          ? IMPORT_STATUS.COMPLETED_SUCCESS
          : IMPORT_STATUS.COMPLETED_WITH_ERRORS;

      await this.prisma.scheduleImportFile.update({
        where: { id: importFileId },
        data: {
          status: finalStatus,
          processingCompletedAt: new Date(),
          errors: errors.length > 0 ? errors : null,
        },
      });

      this.logger.log(
        `Import ${importFileId} completed: ${successfulRows} successful, ${failedRows} failed, ${skippedRows} skipped`,
      );
    } catch (error) {
      this.logger.error(`Import ${importFileId} failed:`, error);
      await this.prisma.scheduleImportFile.update({
        where: { id: importFileId },
        data: {
          status: IMPORT_STATUS.FAILED as any,
          processingCompletedAt: new Date(),
          errors: [{ message: error.message }],
        },
      });
    }
  }

  /**
   * Ensure Planning course exists, create if it doesn't
   */
  private async ensurePlanningCourse(tx: any) {
    let planningCourse = await tx.course.findUnique({
      where: { code: 'Planning' },
    });

    if (!planningCourse) {
      // Get default department, course level, and grade level
      const department = await tx.department.findFirst({
        orderBy: { name: 'asc' },
      });

      const courseLevel = await tx.courseLevel.findFirst({
        orderBy: { rank: 'asc' },
      });

      const gradeLevel = await tx.gradeLevel.findFirst({
        orderBy: { level: 'asc' },
      });

      if (!department || !courseLevel || !gradeLevel) {
        throw new Error(
          'Cannot create Planning course: missing required department, course level, or grade level',
        );
      }

      planningCourse = await tx.course.create({
        data: {
          code: 'Planning',
          name: 'Planning Period',
          description: 'Teacher planning period - no student enrollment',
          departmentId: department.id,
          courseLevelId: courseLevel.id,
          minGradeLevelId: gradeLevel.id,
          credits: 0,
          maxStudents: 0,
          isElective: false,
          isCore: false,
          isActive: true,
        },
      });

      this.logger.log('Created Planning course for planning periods');
    }

    return planningCourse;
  }

  /**
   * Process a single row
   */
  private async processRow(
    row: ParsedScheduleRow,
    academicCycleId: string,
    importFileId: string,
    rowNumber: number,
    tx: any,
  ) {
    let importDetail;
    
    try {
      // Create import detail record
      importDetail = await tx.scheduleImportDetail.create({
        data: {
          importFileId,
          rowNumber,
          studentId: row.studentId,
          courseCode: row.courseCode,
          sectionNumber: row.sectionNumber,
          status: ROW_STATUS.PENDING as any,
        },
      });
    } catch (createError) {
      // If we can't even create the detail record, return error
      this.logger.error(`Failed to create import detail for row ${rowNumber}:`, createError);
      return {
        status: ROW_STATUS.FAILED as any,
        errorMessage: `Failed to create import detail: ${createError.message}`,
      };
    }

    try {
      // Handle planning schedules (no student enrollment)
      if (row.isPlanning) {
        return await this.processPlanningRow(
          row,
          academicCycleId,
          importFileId,
          rowNumber,
          importDetail,
          tx,
        );
      }

      // Regular student schedule processing
      // Lookup student
      if (!row.studentId) {
        throw new Error('Student ID is required for non-planning schedules');
      }

      const student = await tx.student.findUnique({
        where: { studentId: row.studentId },
      });

      if (!student) {
        throw new Error(`Student with ID ${row.studentId} not found`);
      }

      // Lookup course
      const course = await tx.course.findUnique({
        where: { code: row.courseCode },
      });

      if (!course) {
        throw new Error(`Course with code ${row.courseCode} not found`);
      }

      // Lookup time block
      const timeBlock = await tx.timeBlock.findFirst({
        where: { name: row.timeBlockName },
      });

      if (!timeBlock) {
        throw new Error(`Time block "${row.timeBlockName}" not found`);
      }

      // Lookup end time block if provided
      let endTimeBlock = null;
      if (row.endTimeBlockName) {
        endTimeBlock = await tx.timeBlock.findFirst({
          where: { name: row.endTimeBlockName },
        });

        if (!endTimeBlock) {
          throw new Error(`End time block "${row.endTimeBlockName}" not found`);
        }
      }

      // Lookup room
      const room = await tx.room.findFirst({
        where: { name: row.roomName },
      });

      if (!room) {
        throw new Error(`Room "${row.roomName}" not found`);
      }

      // Lookup teacher
      let teacher = null;
      if (row.teacherId) {
        teacher = await tx.teacher.findFirst({
          where: { teacherId: row.teacherId },
        });
      }

      if (!teacher && row.teacherEmail) {
        teacher = await tx.teacher.findUnique({
          where: { email: row.teacherEmail },
        });
      }

      if (!teacher) {
        throw new Error(
          `Teacher not found (teacher_id: ${row.teacherId}, teacher_email: ${row.teacherEmail})`,
        );
      }

      // Lookup or create course section
      const courseSection = await this.lookupOrCreateCourseSection(
        {
          courseId: course.id,
          sectionNumber: row.sectionNumber,
          timeBlockId: timeBlock.id,
          endTimeBlockId: endTimeBlock?.id,
          roomId: room.id,
          teacherId: teacher.id,
          maxEnrollment: row.maxEnrollment,
          academicCycleId,
          rotationDay: row.rotationDay
            ? (row.rotationDay as RotationDay)
            : null,
        },
        tx,
      );

      // Lookup or create schedule
      const schedule = await this.lookupOrCreateSchedule(
        student.id,
        academicCycleId,
        tx,
      );

      // Check if schedule course section already exists
      const existingScheduleCourseSection =
        await tx.scheduleCourseSection.findFirst({
          where: {
            scheduleId: schedule.id,
            courseSectionId: courseSection.id,
          },
        });

      if (existingScheduleCourseSection) {
        await tx.scheduleImportDetail.update({
          where: { id: importDetail.id },
          data: {
            status: ROW_STATUS.SKIPPED as any,
            warningMessage: 'Schedule course section already exists',
            scheduleId: schedule.id,
            courseSectionId: courseSection.id,
            scheduleCourseSectionId: existingScheduleCourseSection.id,
            processedAt: new Date(),
          },
        });

        return {
          status: ROW_STATUS.SKIPPED as any,
          errorMessage: 'Already enrolled in this section',
        };
      }

      // Create schedule course section
      const scheduleCourseSection = await tx.scheduleCourseSection.create({
        data: {
          scheduleId: schedule.id,
          courseSectionId: courseSection.id,
        },
      });

      // Update course section enrollment
      await tx.courseSection.update({
        where: { id: courseSection.id },
        data: {
          currentEnrollment: {
            increment: 1,
          },
        },
      });

      // Update import detail
      await tx.scheduleImportDetail.update({
        where: { id: importDetail.id },
        data: {
          status: ROW_STATUS.SUCCESS as any,
          scheduleId: schedule.id,
          courseSectionId: courseSection.id,
          scheduleCourseSectionId: scheduleCourseSection.id,
          processedAt: new Date(),
        },
      });

      return {
        status: ROW_STATUS.SUCCESS as any,
      };
    } catch (error) {
      // Try to update the import detail record with error status
      // If the transaction is already aborted, this will fail silently
      try {
        await tx.scheduleImportDetail.update({
          where: { id: importDetail.id },
          data: {
            status: ROW_STATUS.FAILED as any,
            errorMessage: error.message || 'Unknown error',
            processedAt: new Date(),
          },
        });
      } catch (updateError) {
        // If update fails (e.g., transaction aborted), log it but don't throw
        // The error information is already captured above
        this.logger.warn(
          `Failed to update import detail for row ${rowNumber} after error:`,
          updateError.message || updateError,
        );
      }

      return {
        status: ROW_STATUS.FAILED as any,
        errorMessage: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Process a planning schedule row (no student enrollment)
   */
  private async processPlanningRow(
    row: ParsedScheduleRow,
    academicCycleId: string,
    importFileId: string,
    rowNumber: number,
    importDetail: any,
    tx: any,
  ) {
    // Ensure Planning course exists
    const planningCourse = await this.ensurePlanningCourse(tx);

    // Verify course code is Planning (case-insensitive)
    if (row.courseCode.toUpperCase() !== 'PLANNING') {
      throw new Error(
        `Planning schedule must have course_code="Planning". Found: ${row.courseCode}`,
      );
    }

    // Lookup time block
    const timeBlock = await tx.timeBlock.findFirst({
      where: { name: row.timeBlockName },
    });

    if (!timeBlock) {
      throw new Error(`Time block "${row.timeBlockName}" not found`);
    }

    // Lookup end time block if provided
    let endTimeBlock = null;
    if (row.endTimeBlockName) {
      endTimeBlock = await tx.timeBlock.findFirst({
        where: { name: row.endTimeBlockName },
      });

      if (!endTimeBlock) {
        throw new Error(`End time block "${row.endTimeBlockName}" not found`);
      }
    }

    // Lookup room
    const room = await tx.room.findFirst({
      where: { name: row.roomName },
    });

    if (!room) {
      throw new Error(`Room "${row.roomName}" not found`);
    }

    // Lookup teacher
    let teacher = null;
    if (row.teacherId) {
      teacher = await tx.teacher.findFirst({
        where: { teacherId: row.teacherId },
      });
    }

    if (!teacher && row.teacherEmail) {
      teacher = await tx.teacher.findUnique({
        where: { email: row.teacherEmail },
      });
    }

    if (!teacher) {
      throw new Error(
        `Teacher not found (teacher_id: ${row.teacherId}, teacher_email: ${row.teacherEmail})`,
      );
    }

    // Lookup or create course section for planning period
    const courseSection = await this.lookupOrCreateCourseSection(
      {
        courseId: planningCourse.id,
        sectionNumber: row.sectionNumber,
        timeBlockId: timeBlock.id,
        endTimeBlockId: endTimeBlock?.id,
        roomId: room.id,
        teacherId: teacher.id,
        maxEnrollment: 0, // Planning periods have no enrollment
        academicCycleId,
        rotationDay: row.rotationDay
          ? (row.rotationDay as RotationDay)
          : null,
      },
      tx,
    );

    // Update import detail - no Schedule or ScheduleCourseSection for planning
    await tx.scheduleImportDetail.update({
      where: { id: importDetail.id },
      data: {
        status: ROW_STATUS.SUCCESS as any,
        courseSectionId: courseSection.id,
        warningMessage: 'Planning period created - no student enrollment',
        processedAt: new Date(),
      },
    });

    return {
      status: ROW_STATUS.SUCCESS as any,
    };
  }

  /**
   * Lookup or create course section
   */
  private async lookupOrCreateCourseSection(
    data: {
      courseId: string;
      sectionNumber: string;
      timeBlockId: string;
      endTimeBlockId?: string | null;
      roomId: string;
      teacherId: string;
      maxEnrollment: number;
      academicCycleId: string;
      rotationDay: RotationDay | null;
    },
    tx: any,
  ) {
    // Try to find existing course section
    const existingSection = await tx.courseSection.findFirst({
      where: {
        courseId: data.courseId,
        sectionNumber: data.sectionNumber,
        academicCycleId: data.academicCycleId,
        timeBlockId: data.timeBlockId,
        endTimeBlockId: data.endTimeBlockId || null,
      },
    });

    if (existingSection) {
      return existingSection;
    }

    // Create new course section
    return tx.courseSection.create({
      data: {
        courseId: data.courseId,
        sectionNumber: data.sectionNumber,
        timeBlockId: data.timeBlockId,
        endTimeBlockId: data.endTimeBlockId || null,
        roomId: data.roomId,
        teacherId: data.teacherId,
        maxEnrollment: data.maxEnrollment,
        currentEnrollment: 0,
        academicCycleId: data.academicCycleId,
        rotationDay: data.rotationDay,
        isActive: true,
      },
    });
  }

  /**
   * Lookup or create schedule
   * Uses composite unique constraint on [studentId, academicCycleId]
   */
  private async lookupOrCreateSchedule(
    studentId: string,
    academicCycleId: string,
    tx: any,
  ) {
    // Use findUnique with the composite unique constraint
    let schedule = await tx.schedule.findUnique({
      where: {
        studentId_academicCycleId: {
          studentId,
          academicCycleId,
        },
      },
    });

    if (!schedule) {
      // Create new schedule if it doesn't exist
      schedule = await tx.schedule.create({
        data: {
          studentId,
          academicCycleId,
        },
      });
    }

    return schedule;
  }

  /**
   * Get import history
   */
  async getImportHistory(filters?: {
    academicCycleId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.academicCycleId) {
      where.academicCycleId = filters.academicCycleId;
    }
    if (filters?.status) {
      where.status = filters.status as any;
    }

    const [imports, total] = await Promise.all([
      this.prisma.scheduleImportFile.findMany({
        where,
        include: {
          uploadedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          academicCycle: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.scheduleImportFile.count({ where }),
    ]);

    return {
      data: imports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get import details (row-level data)
   */
  async getImportDetails(importId: string, page?: number, limit?: number) {
    const pageNum = page || 1;
    const limitNum = limit || 100;
    const skip = (pageNum - 1) * limitNum;

    const [details, total] = await Promise.all([
      this.prisma.scheduleImportDetail.findMany({
        where: { importFileId: importId },
        orderBy: { rowNumber: 'asc' },
        skip,
        take: limitNum,
      }),
      this.prisma.scheduleImportDetail.count({
        where: { importFileId: importId },
      }),
    ]);

    return {
      data: details,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get import file by ID
   */
  async getImportFileById(importId: string) {
    const importFile = await this.prisma.scheduleImportFile.findUnique({
      where: { id: importId },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        academicCycle: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!importFile) {
      throw new NotFoundException(`Import file with ID ${importId} not found`);
    }

    return importFile;
  }

  /**
   * Generate CSV template
   * Note: academic_cycle_name is optional - it's provided during upload
   */
  generateCSVTemplate(): string {
    const headers = [
      'student_id',
      'academic_cycle_name', // Optional - provided during upload
      'course_code',
      'section_number',
      'period_start',
      'period_end',
      'room_no',
      'teacher_id',
      'max_enrollment',
      'rotation_day',
    ];

    const sampleRows = [
      [
        'STU001',
        '', // academic_cycle_name is optional
        'MATH101',
        '001',
        'Period 1',
        '',
        'Room 101',
        'TCH001',
        '30',
        'A_DAY',
      ],
      [
        'STU001',
        '', // academic_cycle_name is optional
        'ENG101',
        '001',
        'Period 2',
        '',
        'Room 205',
        'TCH002',
        '25',
        'A_DAY',
      ],
      [
        'STU001',
        '', // academic_cycle_name is optional
        'SCI101',
        '001',
        'Period 3',
        'Period 4',
        'Room 301',
        'TCH003',
        '28',
        'B_DAY',
      ],
      [
        '', // Empty for planning periods
        '', // academic_cycle_name is optional
        'Planning',
        '001',
        'Period 4',
        '',
        'Room 101',
        'TCH001',
        '0',
        '',
      ],
    ];

    return Papa.unparse([headers, ...sampleRows]);
  }
}

