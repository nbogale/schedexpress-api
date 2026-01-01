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
import * as XLSX from 'xlsx';
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
  roomName: string; // Keep for backward compatibility
  roomNo?: string; // New field for room number lookup
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

export interface ScheduleImportConfig {
  createMissingSections: boolean; // Default: true (fallback behavior)
  strictMode: boolean; // Default: false (if true, error on missing section)
}

@Injectable()
export class ScheduleImportService {
  private readonly logger = new Logger(ScheduleImportService.name);
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'schedule-imports');
  private readonly DEFAULT_CONFIG: ScheduleImportConfig = {
    createMissingSections: true, // Default: create sections if not found (fallback)
    strictMode: false, // Default: allow fallback creation
  };

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
    if (fileExtension !== '.csv' && fileExtension !== '.xlsx' && fileExtension !== '.xls') {
      throw new BadRequestException('Only CSV and Excel files (.xlsx, .xls) are supported');
    }

    // Parse file based on extension (academic cycle is provided during upload, not required in file)
    let parsedRows: ParsedScheduleRow[];
    if (fileExtension === '.csv') {
      const fileContent = file.buffer.toString('utf-8');
      parsedRows = this.parseCSV(fileContent);
    } else {
      // Excel file (.xlsx or .xls)
      parsedRows = this.parseExcel(file.buffer);
    }

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
    // Mark previous imports as SUPERSEDED and clean up their files
    const supersededImports = await this.prisma.scheduleImportFile.findMany({
      where: {
        academicCycleId,
        status: {
          in: [
            IMPORT_STATUS.COMPLETED_SUCCESS,
            IMPORT_STATUS.COMPLETED_WITH_ERRORS,
          ],
        },
      },
      select: { id: true, filePath: true },
    });

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

    // Clean up files for superseded imports
    for (const importFile of supersededImports) {
      if (importFile.filePath) {
        try {
          await fs.unlink(importFile.filePath);
          this.logger.log(`Cleaned up superseded file: ${importFile.filePath}`);
        } catch (error) {
          this.logger.warn(`Could not delete superseded file ${importFile.filePath}: ${error.message}`);
        }
      }
    }

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
        const roomNo = getStringValue(row.room_no);
        const roomName = getStringValue(row.room_name);
        const roomIdentifier = roomNo || roomName; // Prefer roomNo, fallback to roomName
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
          roomName: roomIdentifier, // Keep for backward compatibility
          roomNo: roomNo || undefined, // New field for room number lookup
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
   * Parse Excel file content (.xlsx or .xls)
   */
  private parseExcel(fileBuffer: Buffer): ParsedScheduleRow[] {
    try {
      // Read the Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new BadRequestException('Excel file must contain at least one sheet');
      }

      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Use array of arrays format
        defval: '', // Default value for empty cells
        raw: false, // Convert all values to strings
      });

      if (jsonData.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }

      // First row should be headers
      const headers = (jsonData[0] as any[]).map((h: any) => 
        String(h || '').trim().toLowerCase().replace(/\s+/g, '_')
      );

      const rows: ParsedScheduleRow[] = [];

      // Process data rows (skip header row)
      for (let i = 1; i < jsonData.length; i++) {
        try {
          const rowData = jsonData[i] as any[];
          
          // Convert array to object using headers
          const row: any = {};
          headers.forEach((header, index) => {
            const value = rowData[index];
            row[header] = value !== undefined && value !== null ? String(value).trim() : '';
          });

          // Helper to safely extract and trim string values
          const getStringValue = (value: any): string => {
            if (value === null || value === undefined || value === '') {
              return '';
            }
            return String(value).trim();
          };

          // Check if row is completely empty
          const hasAnyValue = Object.values(row).some((value: any) => {
            const str = getStringValue(value);
            return str.length > 0;
          });

          // Skip completely empty rows
          if (!hasAnyValue) {
            this.logger.debug(`Row ${i + 1}: Skipping empty row`);
            continue;
          }

          const studentId = getStringValue(row.student_id);
          const courseCode = getStringValue(row.course_code);
          // Detect planning schedules: empty student_id and course_code is "Planning" (case-insensitive)
          const isPlanning = !studentId && courseCode.toUpperCase() === 'PLANNING';

          // Map Excel headers to internal field names (support both new and old header names)
          const timeBlockName = getStringValue(row.period_start || row.time_block_name);
          const endTimeBlockNameValue = getStringValue(row.period_end || row.end_time_block_name);
          const endTimeBlockName = endTimeBlockNameValue || undefined;
          const roomName = getStringValue(row.room_no || row.room_name);
          const academicCycleName = getStringValue(row.academic_cycle_name);
          const sectionNumber = getStringValue(row.section_number);

          const parsedRow: ParsedScheduleRow = {
            studentId: studentId || undefined,
            academicCycleName: academicCycleName,
            courseCode: courseCode,
            sectionNumber: sectionNumber,
            timeBlockName: timeBlockName,
            endTimeBlockName: endTimeBlockName || undefined,
            roomName: roomName,
            teacherId: getStringValue(row.teacher_id) || undefined,
            teacherEmail: getStringValue(row.teacher_email)
              ? getStringValue(row.teacher_email).toLowerCase()
              : undefined,
            maxEnrollment: isPlanning 
              ? 0
              : parseInt(getStringValue(row.max_enrollment) || '30', 10),
            rotationDay: getStringValue(row.rotation_day)
              ? getStringValue(row.rotation_day).toUpperCase()
              : undefined,
            isPlanning: isPlanning,
          };

          // Validate required fields (same validation as CSV)
          const missingFields: string[] = [];
          
          if (!parsedRow.studentId && !isPlanning) {
            missingFields.push('student_id');
          }
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
          this.logger.warn(`Row ${i + 1}: ${error.message}`);
        }
      }

      return rows;
    } catch (error) {
      this.logger.error('Error parsing Excel file:', error);
      throw new BadRequestException(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Process rows asynchronously (runs in background)
   * Optimized version with batch processing and pre-loaded lookups
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

    // Pre-load all lookup data to avoid repeated queries
    this.logger.log('Pre-loading lookup data for optimization...');
    const lookupData = await this.preloadLookupData(academicCycleId);
    this.logger.log('Lookup data pre-loaded successfully');

    const transactionBatchSize = 50; // Process 50 rows per transaction
    const progressUpdateInterval = 50; // Update progress every 50 rows
    let processedRows = 0;
    let successfulRows = 0;
    let failedRows = 0;
    let skippedRows = 0;
    const errors: any[] = [];

    try {
      // Process rows in batches
      for (let batchStart = 0; batchStart < rows.length; batchStart += transactionBatchSize) {
        const batchEnd = Math.min(batchStart + transactionBatchSize, rows.length);
        const batch = rows.slice(batchStart, batchEnd);

        try {
          // Process batch in a single transaction
          const batchResults = await this.prisma.$transaction(async (tx) => {
            const results = [];
            for (let i = 0; i < batch.length; i++) {
              const row = batch[i];
              const rowNumber = batchStart + i + 2; // +2 for header row and 0-based index

              try {
                const result = await this.processRowOptimized(
                  row,
                  academicCycleId,
                  importFileId,
                  rowNumber,
                  lookupData,
                  tx,
                );
                results.push({ rowNumber, result, row });
              } catch (error) {
                results.push({
                  rowNumber,
                  result: {
                    status: ROW_STATUS.FAILED,
                    errorMessage: error.message || 'Unknown error',
                  },
                  row,
                });
              }
            }
            return results;
          });

          // Process batch results
          for (const { rowNumber, result, row } of batchResults) {
            processedRows++;

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
          }
        } catch (error) {
          // If entire batch fails, mark all rows as failed
          for (let i = 0; i < batch.length; i++) {
            processedRows++;
            failedRows++;
            errors.push({
              row: batchStart + i + 2,
              studentId: batch[i].studentId || 'N/A (Planning)',
              courseCode: batch[i].courseCode,
              error: error.message || 'Batch processing failed',
            });
          }
        }

        // Update progress less frequently to reduce database writes
        if (processedRows % progressUpdateInterval === 0 || batchEnd === rows.length) {
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

      // Clean up uploaded file after processing is complete
      await this.cleanupImportFile(importFileId);
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

      // Clean up uploaded file even if processing failed
      await this.cleanupImportFile(importFileId);
    }
  }

  /**
   * Clean up uploaded file after processing is complete
   */
  private async cleanupImportFile(importFileId: string) {
    try {
      const importFile = await this.prisma.scheduleImportFile.findUnique({
        where: { id: importFileId },
        select: { filePath: true },
      });

      if (importFile?.filePath) {
        try {
          await fs.unlink(importFile.filePath);
          this.logger.log(`Cleaned up file: ${importFile.filePath}`);
        } catch (error) {
          // File might not exist, log but don't fail
          this.logger.warn(`Could not delete file ${importFile.filePath}: ${error.message}`);
        }
      }
    } catch (error) {
      // Don't fail the import if cleanup fails
      this.logger.warn(`Error during file cleanup for import ${importFileId}: ${error.message}`);
    }
  }

  /**
   * Clean up orphaned files (files on disk not referenced in database)
   * This can be called periodically or manually to clean up old files
   */
  async cleanupOrphanedFiles(): Promise<{ deleted: number; errors: number }> {
    let deleted = 0;
    let errors = 0;

    try {
      // Get all file paths from database
      const importFiles = await this.prisma.scheduleImportFile.findMany({
        select: { filePath: true },
      });
      const dbFilePaths = new Set(importFiles.map((f) => f.filePath));

      // Get all files in upload directory
      const files = await fs.readdir(this.UPLOAD_DIR);

      // Delete files that are not in database
      for (const file of files) {
        const filePath = path.join(this.UPLOAD_DIR, file);
        if (!dbFilePaths.has(filePath)) {
          try {
            await fs.unlink(filePath);
            deleted++;
            this.logger.log(`Deleted orphaned file: ${filePath}`);
          } catch (error) {
            errors++;
            this.logger.warn(`Could not delete orphaned file ${filePath}: ${error.message}`);
          }
        }
      }

      this.logger.log(`Cleanup complete: ${deleted} files deleted, ${errors} errors`);
      return { deleted, errors };
    } catch (error) {
      this.logger.error('Error during orphaned file cleanup:', error);
      throw error;
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
   * Pre-load all lookup data to avoid repeated database queries
   * Now includes course sections for faster teacher assignment matching
   */
  private async preloadLookupData(academicCycleId: string) {
    const [students, courses, timeBlocks, rooms, teachers, courseSections] = await Promise.all([
      this.prisma.student.findMany({
        select: { id: true, studentId: true },
      }),
      this.prisma.course.findMany({
        select: { id: true, code: true },
      }),
      this.prisma.timeBlock.findMany({
        select: { id: true, name: true },
      }),
      this.prisma.room.findMany({
        select: { id: true, name: true, roomNo: true },
      }),
      this.prisma.teacher.findMany({
        select: { id: true, teacherId: true, user: { select: { email: true } } },
      }),
      this.prisma.courseSection.findMany({
        where: { academicCycleId },
        select: {
          id: true,
          courseId: true,
          sectionNumber: true,
          teacherId: true,
          timeBlockId: true,
          endTimeBlockId: true,
          roomId: true,
          rotationDay: true,
          maxEnrollment: true,
          currentEnrollment: true,
        },
      }),
    ]);

    // Create lookup maps for O(1) access
    const studentMap = new Map(students.map(s => [s.studentId, s]));
    const courseMap = new Map(courses.map(c => [c.code, c]));
    const timeBlockMap = new Map(timeBlocks.map(tb => [tb.name, tb]));
    // Create room maps: by roomNo (preferred) and by name (fallback)
    const roomByNoMap = new Map(rooms.map(r => [r.roomNo, r]));
    const roomByNameMap = new Map(rooms.map(r => [r.name, r]));
    const teacherByIdMap = new Map(teachers.map(t => [t.teacherId, t]));
    const teacherByEmailMap = new Map(
      teachers
        .filter(t => t.user?.email)
        .map(t => [t.user.email, t]),
    );

    // Create course section lookup map
    // Key format: `${courseId}-${sectionNumber}-${teacherId}-${timeBlockId}-${roomId}-${rotationDay || 'null'}`
    const courseSectionMap = new Map<string, typeof courseSections[0]>();
    courseSections.forEach(section => {
      const key = this.createCourseSectionKey({
        courseId: section.courseId,
        sectionNumber: section.sectionNumber,
        teacherId: section.teacherId,
        timeBlockId: section.timeBlockId,
        endTimeBlockId: section.endTimeBlockId,
        roomId: section.roomId,
        rotationDay: section.rotationDay,
      });
      // If multiple sections match, keep the first one (log warning later if needed)
      if (!courseSectionMap.has(key)) {
        courseSectionMap.set(key, section);
      }
    });

    return {
      students: studentMap,
      courses: courseMap,
      timeBlocks: timeBlockMap,
      roomsByNo: roomByNoMap,
      roomsByName: roomByNameMap,
      teachersById: teacherByIdMap,
      teachersByEmail: teacherByEmailMap,
      courseSections: courseSectionMap,
    };
  }

  /**
   * Create a lookup key for course section matching
   */
  private createCourseSectionKey(data: {
    courseId: string;
    sectionNumber: string;
    teacherId: string;
    timeBlockId: string;
    endTimeBlockId?: string | null;
    roomId: string;
    rotationDay?: RotationDay | null;
  }): string {
    return `${data.courseId}-${data.sectionNumber}-${data.teacherId}-${data.timeBlockId}-${data.endTimeBlockId || 'null'}-${data.roomId}-${data.rotationDay || 'null'}`;
  }

  /**
   * Optimized version of processRow that uses pre-loaded lookup data
   */
  private async processRowOptimized(
    row: ParsedScheduleRow,
    academicCycleId: string,
    importFileId: string,
    rowNumber: number,
    lookupData: any,
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

      // Regular student schedule processing using pre-loaded data
      if (!row.studentId) {
        throw new Error('Student ID is required for non-planning schedules');
      }

      const student = lookupData.students.get(row.studentId);
      if (!student) {
        throw new Error(`Student with ID ${row.studentId} not found`);
      }

      const course = lookupData.courses.get(row.courseCode);
      if (!course) {
        throw new Error(`Course with code ${row.courseCode} not found`);
      }

      const timeBlock = lookupData.timeBlocks.get(row.timeBlockName);
      if (!timeBlock) {
        throw new Error(`Time block "${row.timeBlockName}" not found`);
      }

      let endTimeBlock = null;
      if (row.endTimeBlockName) {
        endTimeBlock = lookupData.timeBlocks.get(row.endTimeBlockName);
        if (!endTimeBlock) {
          throw new Error(`End time block "${row.endTimeBlockName}" not found`);
        }
      }

      // Lookup room by roomNo first (preferred), then fallback to name
      let room = null;
      if (row.roomNo) {
        room = lookupData.roomsByNo.get(row.roomNo);
      }
      if (!room && row.roomName) {
        room = lookupData.roomsByName.get(row.roomName);
      }
      if (!room) {
        const identifier = row.roomNo || row.roomName;
        throw new Error(`Room "${identifier}" not found (roomNo: ${row.roomNo || 'N/A'}, name: ${row.roomName || 'N/A'})`);
      }

      // Lookup teacher using pre-loaded data
      let teacher = null;
      if (row.teacherId) {
        teacher = lookupData.teachersById.get(row.teacherId);
      } else if (row.teacherEmail) {
        teacher = lookupData.teachersByEmail.get(row.teacherEmail);
      }

      if (!teacher) {
        throw new Error(
          `Teacher not found (ID: ${row.teacherId || 'N/A'}, Email: ${row.teacherEmail || 'N/A'})`,
        );
      }

      // Rest of the processing logic (same as original processRow)
      // ... (continue with course section and schedule creation)
      // For now, delegate to original processRow for the complex logic
      // but with lookups already done
      return await this.processRowWithLookups(
        row,
        academicCycleId,
        importFileId,
        rowNumber,
        importDetail,
        {
          student,
          course,
          timeBlock,
          endTimeBlock,
          room,
          teacher,
        },
        lookupData,
        tx,
      );
    } catch (error) {
      await tx.scheduleImportDetail.update({
        where: { id: importDetail.id },
        data: {
          status: ROW_STATUS.FAILED as any,
          errorMessage: error.message,
        },
      });

      return {
        status: ROW_STATUS.FAILED as any,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Process row with pre-loaded lookup data
   * Updated to use teacher assignment matching
   */
  private async processRowWithLookups(
    row: ParsedScheduleRow,
    academicCycleId: string,
    importFileId: string,
    rowNumber: number,
    importDetail: any,
    lookups: {
      student: any;
      course: any;
      timeBlock: any;
      endTimeBlock: any;
      room: any;
      teacher: any;
    },
    lookupData: any,
    tx: any,
  ) {
    // Use the new lookup strategy that prioritizes teacher assignment matching
    const courseSection = await this.lookupOrCreateCourseSection(
      {
        courseId: lookups.course.id,
        sectionNumber: row.sectionNumber,
        timeBlockId: lookups.timeBlock.id,
        endTimeBlockId: lookups.endTimeBlock?.id,
        roomId: lookups.room.id,
        teacherId: lookups.teacher.id,
        maxEnrollment: row.maxEnrollment,
        academicCycleId,
        rotationDay: row.rotationDay ? (row.rotationDay as RotationDay) : null,
      },
      tx,
      lookupData,
      this.DEFAULT_CONFIG,
    );

    // Find or create schedule
    let schedule = await tx.schedule.findFirst({
      where: {
        studentId: lookups.student.id,
        academicCycleId,
      },
    });

    if (!schedule) {
      schedule = await tx.schedule.create({
        data: {
          studentId: lookups.student.id,
          academicCycleId,
        },
      });
    }

    // Check if schedule-course-section relationship already exists
    const existingRelation = await tx.scheduleCourseSection.findFirst({
      where: {
        scheduleId: schedule.id,
        courseSectionId: courseSection.id,
      },
    });

    if (existingRelation) {
      await tx.scheduleImportDetail.update({
        where: { id: importDetail.id },
        data: {
          status: ROW_STATUS.SKIPPED as any,
          errorMessage: 'Schedule-course-section relationship already exists',
        },
      });

      return {
        status: ROW_STATUS.SKIPPED as any,
        errorMessage: 'Schedule-course-section relationship already exists',
      };
    }

    // Create schedule-course-section relationship
    await tx.scheduleCourseSection.create({
      data: {
        scheduleId: schedule.id,
        courseSectionId: courseSection.id,
      },
    });

    // Update import detail as successful
    await tx.scheduleImportDetail.update({
      where: { id: importDetail.id },
      data: {
        status: ROW_STATUS.SUCCESS as any,
      },
    });

    return {
      status: ROW_STATUS.SUCCESS as any,
    };
  }

  /**
   * Process a single row (original method - kept for compatibility)
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

      // Lookup room by roomNo first (preferred), then fallback to name
      let room = null;
      if (row.roomNo) {
        room = await tx.room.findUnique({
          where: { roomNo: row.roomNo },
        });
      }
      if (!room && row.roomName) {
        room = await tx.room.findFirst({
          where: { name: row.roomName },
        });
      }
      if (!room) {
        const identifier = row.roomNo || row.roomName;
        throw new Error(`Room "${identifier}" not found (roomNo: ${row.roomNo || 'N/A'}, name: ${row.roomName || 'N/A'})`);
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

      // Lookup or create course section (using new teacher assignment matching)
      // Note: This method doesn't have pre-loaded lookup data, so it will use database queries
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
        undefined, // No pre-loaded lookup data for this path
        this.DEFAULT_CONFIG,
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
    // Lookup room by roomNo first (preferred), then fallback to name
    let room = null;
    if (row.roomNo) {
      room = await tx.room.findUnique({
        where: { roomNo: row.roomNo },
      });
    }
    if (!room && row.roomName) {
      room = await tx.room.findFirst({
        where: { name: row.roomName },
      });
    }
    if (!room) {
      const identifier = row.roomNo || row.roomName;
      throw new Error(`Room "${identifier}" not found (roomNo: ${row.roomNo || 'N/A'}, name: ${row.roomName || 'N/A'})`);
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
   * Lookup course section by teacher assignment criteria
   * Matches: courseId, sectionNumber, teacherId, timeBlockId, roomId, rotationDay
   */
  private lookupCourseSectionByAssignment(
    data: {
      courseId: string;
      sectionNumber: string;
      teacherId: string;
      timeBlockId: string;
      endTimeBlockId?: string | null;
      roomId: string;
      rotationDay?: RotationDay | null;
    },
    lookupData: any,
  ): any {
    const key = this.createCourseSectionKey(data);
    return lookupData.courseSections.get(key) || null;
  }

  /**
   * Lookup or create course section
   * Updated to prioritize teacher assignment matching
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
    lookupData?: any,
    config: ScheduleImportConfig = this.DEFAULT_CONFIG,
  ) {
    // First, try to find by teacher assignment criteria (if lookup data provided)
    if (lookupData?.courseSections) {
      const matchedSection = this.lookupCourseSectionByAssignment(
        {
          courseId: data.courseId,
          sectionNumber: data.sectionNumber,
          teacherId: data.teacherId,
          timeBlockId: data.timeBlockId,
          endTimeBlockId: data.endTimeBlockId,
          roomId: data.roomId,
          rotationDay: data.rotationDay,
        },
        lookupData,
      );

      if (matchedSection) {
        // Verify teacher matches (should always match if found via lookup)
        if (matchedSection.teacherId === data.teacherId) {
          return matchedSection;
        } else {
          // This shouldn't happen, but log warning if it does
          this.logger.warn(
            `Course section found but teacher mismatch: section ${matchedSection.id}, expected teacher ${data.teacherId}, found ${matchedSection.teacherId}`,
          );
        }
      }
    }

    // Fallback: Try to find existing course section by basic criteria
    const existingSection = await tx.courseSection.findFirst({
      where: {
        courseId: data.courseId,
        sectionNumber: data.sectionNumber,
        academicCycleId: data.academicCycleId,
        timeBlockId: data.timeBlockId,
        endTimeBlockId: data.endTimeBlockId || null,
        teacherId: data.teacherId, // Include teacher in lookup
        roomId: data.roomId, // Include room in lookup
        rotationDay: data.rotationDay || null,
      },
    });

    if (existingSection) {
      return existingSection;
    }

    // Section not found - handle based on configuration
    if (config.strictMode) {
      throw new Error(
        `Course section not found for teacher assignment. Please create the teacher assignment first. Course: ${data.courseId}, Section: ${data.sectionNumber}, Teacher: ${data.teacherId}`,
      );
    }

    // Create new course section (fallback behavior)
    if (!config.createMissingSections) {
      throw new Error(
        `Course section not found and creation is disabled. Please create the teacher assignment first.`,
      );
    }

    this.logger.log(
      `Creating course section as fallback: Course ${data.courseId}, Section ${data.sectionNumber}, Teacher ${data.teacherId}`,
    );

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

  /**
   * Generate Excel template file
   */
  generateExcelTemplate(): Buffer {
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

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 12 }, // student_id
      { wch: 20 }, // academic_cycle_name
      { wch: 12 }, // course_code
      { wch: 12 }, // section_number
      { wch: 15 }, // period_start
      { wch: 15 }, // period_end
      { wch: 12 }, // room_no
      { wch: 12 }, // teacher_id
      { wch: 15 }, // max_enrollment
      { wch: 12 }, // rotation_day
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule Import');

    // Convert to buffer
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

