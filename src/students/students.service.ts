import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateBulkStudentsDto } from './dto/create-bulk-students.dto';
import { FileParserService, ParsedStudentData } from '../common/file-parser.service';
import { CycleType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ApiErrorResponse } from 'src/common/api-error';
import { AcademicCyclesService } from 'src/academic-cycles/academic-cycles.service';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private fileParserService: FileParserService,
    private academicCyclesService: AcademicCyclesService,
  ) {}

  async findAll() {
    // Get all users who are students with their student profiles
    return this.prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
      },
      include: {
        student: true,
      },
    });
  }

  async findByCounselor(counselorId: string) {
    // First get the counselor details to get department
    const counselor = await this.prisma.user.findUnique({
      where: { id: counselorId, role: UserRole.COUNSELOR },
    });

    if (!counselor) {
      throw new NotFoundException(`Counselor with ID ${counselorId} not found`);
    }

    // Get students based on department match or other relevant criteria
    // This is a simplified example - your actual matching logic might differ
    return this.prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
      },
      include: {
        student: {
          include: {
            gradeLevel: true,
            changeRequests: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.user.findFirst({
      where: {
        id,
        role: UserRole.STUDENT,
      },
      include: {
        student: {
          include: {
            gradeLevel: true
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async create(createStudentDto: CreateStudentDto) {
    return await this.prisma.$transaction(async (prisma) => {
      // Check if the email address is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email: createStudentDto.email },
      });

      if (existingUser) {
        const errorResponse: ApiErrorResponse = {
          errorCode: 'STUA',
          errorMessage: 'Email address already in use',
          timestamp: new Date().toISOString(),
        };
        throw new BadRequestException(errorResponse);
      }

      //check if studentId is already in use
      const existingStudent = await prisma.student.findUnique({
        where: { studentId: createStudentDto.studentId },
      });

      if (existingStudent) {
        const errorResponse: ApiErrorResponse = {
          errorCode: 'STUB',
          errorMessage: 'Student ID already in use',
          timestamp: new Date().toISOString(),
        };
        throw new BadRequestException(errorResponse);
      }

      // generate username from email if username is not provided
      const username = createStudentDto.username? createStudentDto.username : this.generateUsername(createStudentDto.email);

      //Generate random temporary password
      const temporaryPassword = Math.random().toString(36).substring(2, 8);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email: createStudentDto.email,
          firstName: createStudentDto.firstName,
          lastName: createStudentDto.lastName,
          username: createStudentDto.username || username,
          role: UserRole.STUDENT,
          passwordHash: bcrypt.hashSync(temporaryPassword, 10),
        },
      });

      // Create the student record
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          studentId: createStudentDto.studentId,
          gradeLevelId: createStudentDto.gradeLevelId,
          graduationYear: createStudentDto.graduationYear || null,
        },
        include: {
          gradeLevel: true,
        },
      });

      return student;
    });
  }

  async createBulk(createBulkStudentsDto: CreateBulkStudentsDto) {
    const results = {
      success: [] as any[],
      errors: [] as any[],
      total: createBulkStudentsDto.students.length,
    };

    // Use transaction to ensure data consistency
    await this.prisma.$transaction(async (prisma) => {
      for (let i = 0; i < createBulkStudentsDto.students.length; i++) {
        const studentData = createBulkStudentsDto.students[i];
        
        try {
          // Check if email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: studentData.email },
          });

          if (existingUser) {
            results.errors.push({
              row: i + 1,
              email: studentData.email,
              error: 'Email address already in use',
              errorCode: 'STUE'
            });
            continue;
          }

          // Check if student ID already exists
          const existingStudent = await prisma.student.findUnique({
            where: { studentId: studentData.studentId },
          });

          if (existingStudent) {
            results.errors.push({
              row: i + 1,
              studentId: studentData.studentId,
              error: 'Student ID already in use',
              errorCode: 'STUF'
            });
            continue;
          }

          // Generate username from email
          const username = this.generateUsername(studentData.email);

          // Generate random temporary password
          const temporaryPassword = Math.random().toString(36).substring(2, 8);

          // Create the user
          const user = await prisma.user.create({
            data: {
              email: studentData.email,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              username: username,
              role: UserRole.STUDENT,
              passwordHash: bcrypt.hashSync(temporaryPassword, 10),
            },
          });

          // Create the student record
          const student = await prisma.student.create({
            data: {
              userId: user.id,
              studentId: studentData.studentId,
              gradeLevelId: studentData.gradeLevelId,
              graduationYear: studentData.graduationYear || null,
            },
            include: {
              gradeLevel: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                }
              }
            },
          });

          results.success.push({
            row: i + 1,
            student: {
              id: student.id,
              studentId: student.studentId,
              email: student.user.email,
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              gradeLevel: student.gradeLevel.name,
              graduationYear: student.graduationYear,
              temporaryPassword: temporaryPassword,
            }
          });

        } catch (error) {
          results.errors.push({
            row: i + 1,
            email: studentData.email,
            studentId: studentData.studentId,
            error: 'Failed to create student',
            errorCode: 'STUG'
          });
        }
      }
    });

    return results;
  }

  async createBulkFromParsedData(parsedStudents: ParsedStudentData[]) {
    const results = {
      success: [] as any[],
      errors: [] as any[],
      total: parsedStudents.length,
    };

    // Use transaction to ensure data consistency
    await this.prisma.$transaction(async (prisma) => {
      for (let i = 0; i < parsedStudents.length; i++) {
        const studentData = parsedStudents[i];
        
        try {
          // Check if email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: studentData.email },
          });

          if (existingUser) {
            results.errors.push({
              row: i + 1,
              email: studentData.email,
              error: 'Email address already in use',
              errorCode: 'STUE'
            });
            continue;
          }

          // Check if student ID already exists
          const existingStudent = await prisma.student.findUnique({
            where: { studentId: studentData.studentId },
          });

          if (existingStudent) {
            results.errors.push({
              row: i + 1,
              studentId: studentData.studentId,
              error: 'Student ID already in use',
              errorCode: 'STUF'
            });
            continue;
          }

          // Find grade level by level number
          const gradeLevel = await prisma.gradeLevel.findFirst({
            where: { level: studentData.level }
          });

          if (!gradeLevel) {
            results.errors.push({
              row: i + 1,
              level: studentData.level,
              error: `Grade level ${studentData.level} not found`,
              errorCode: 'STUG'
            });
            continue;
          }

          // Generate username from email
          const username = this.generateUsername(studentData.email);

          // Generate random temporary password
          const temporaryPassword = Math.random().toString(36).substring(2, 8);

          // Create the user
          const user = await prisma.user.create({
            data: {
              email: studentData.email,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              username: username,
              role: UserRole.STUDENT,
              passwordHash: bcrypt.hashSync(temporaryPassword, 10),
            },
          });

          // Create the student record
          const student = await prisma.student.create({
            data: {
              userId: user.id,
              studentId: studentData.studentId,
              gradeLevelId: gradeLevel.id,
              graduationYear: studentData.graduationYear || null,
            },
            include: {
              gradeLevel: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                }
              }
            },
          });

          results.success.push({
            row: i + 1,
            student: {
              id: student.id,
              studentId: student.studentId,
              email: student.user.email,
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              gradeLevel: student.gradeLevel.name,
              graduationYear: student.graduationYear,
              temporaryPassword: temporaryPassword,
            }
          });

        } catch (error) {
          results.errors.push({
            row: i + 1,
            email: studentData.email,
            studentId: studentData.studentId,
            error: 'Failed to create student',
            errorCode: 'STUG'
          });
        }
      }
    });

    return results;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    // Get the student first to ensure it exists
    const student = await this.findOne(id);

    // Update the user's name if provided
    if (updateStudentDto.firstName) {
      await this.prisma.user.update({
        where: { id },
        data: { firstName: updateStudentDto.firstName },
        include: {
          student: true
        }
      });
    }

    // Update the student info if grade level provided
    if (updateStudentDto.gradeLevelId) {
      await this.prisma.student.update({
        where: { userId: id },
        data: { gradeLevelId: updateStudentDto.gradeLevelId },
      });
    }

    // Get the updated student with all data
    return this.findOne(id);
  }

  async getStudentSchedule(id: string) {
    const currentAcademicCycle = await this.academicCyclesService.findCurrentCycle(CycleType.SCHOOL_YEAR);
    if(!currentAcademicCycle) {
      throw new NotFoundException(`Current academic cycle not found`);
    }

    const studentSchedule = await this.prisma.student.findUnique({
      where: { id },
      include: {
        gradeLevel: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        schedules: {
          where: {
            academicCycleId: currentAcademicCycle.id,
          },
          include: {
            scheduleCourseSections: {
              include: {
                courseSection: {
                  include: {
                    course: true,
                    room: true,
                    timeBlock: true,
                    teacher: true,
                  }
                }
              }
            },
            academicCycle: true,
          },
        },
      },
    });

    if (!studentSchedule) {
      throw new NotFoundException(`Student schedule with ID ${id} not found`);
    }

    return studentSchedule;
  }

  private generateUsername(email: string): string {
    // Extract username from email (before @)
    const username = email.split('@')[0];
    // Remove special characters and convert to lowercase
    return username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  /**
   * Get export data for all students
   */
  private async getExportData() {
    const students = await this.prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
      },
      include: {
        student: {
          include: {
            gradeLevel: true,
          },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    return students.map((user) => ({
      student_id: user.student?.studentId || '',
      first_name: user.firstName,
      last_name: user.lastName,
      grade_level: user.student?.gradeLevel?.name || 'N/A',
      email: user.email,
      graduation_year: user.student?.graduationYear || null,
    }));
  }

  /**
   * Generate CSV export for students
   */
  async generateCSVExport(): Promise<string> {
    const exportData = await this.getExportData();

    const headers = [
      'student_id',
      'first_name',
      'last_name',
      'grade_level',
      'email',
      'graduation_year',
    ];

    const rows = exportData.map((row) => [
      row.student_id,
      row.first_name,
      row.last_name,
      row.grade_level,
      row.email,
      row.graduation_year || '',
    ]);

    return Papa.unparse([headers, ...rows]);
  }

  /**
   * Generate Excel export for students
   */
  async generateExcelExport(): Promise<Buffer> {
    const exportData = await this.getExportData();

    const headers = [
      'student_id',
      'first_name',
      'last_name',
      'grade_level',
      'email',
      'graduation_year',
    ];

    // Convert to array of arrays for XLSX
    const rows = exportData.map((row) => [
      row.student_id,
      row.first_name,
      row.last_name,
      row.grade_level,
      row.email,
      row.graduation_year || '',
    ]);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths for better readability
    const colWidths = [
      { wch: 15 }, // student_id
      { wch: 18 }, // first_name
      { wch: 18 }, // last_name
      { wch: 12 }, // grade_level
      { wch: 30 }, // email
      { wch: 15 }, // graduation_year
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Roster');

    // Convert to buffer
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
