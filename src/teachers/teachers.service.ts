import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import { ApiErrorResponseBuilder } from "src/common/api-error-builder";
import { ErrorCode } from "src/common/error-codes";
import { ApiErrorResponse } from "src/common/api-error";
import { UserRole, Prisma, TeacherStatus, CycleType } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as Papa from "papaparse";
import * as XLSX from "xlsx";

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);
  constructor(private prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    return await this.prisma.$transaction(async (prisma) => {
      // check if the teacher already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: createTeacherDto.email },
      });

      if (existingUser) {
        const errorResponse: ApiErrorResponse = {
          errorCode: "STUA",
          errorMessage: "Email address already in use",
          timestamp: new Date().toISOString(),
        };
        throw new BadRequestException(errorResponse);
      }

      // check if the teacher already exists
      const existingTeacher = await prisma.teacher.findUnique({
        where: { email: createTeacherDto.email },
      });

      if (existingTeacher) {
        const errorResponse: ApiErrorResponse = {
          errorCode: "TCHB",
          errorMessage: "Email address already in use by another teacher",
          timestamp: new Date().toISOString(),
        };
        throw new BadRequestException(errorResponse);
      }

      // generate username from email if username is not provided
      const username = this.generateUsername(createTeacherDto.email);

      //Generate random temporary password
      const temporaryPassword = Math.random().toString(36).substring(2, 8);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email: createTeacherDto.email,
          firstName: createTeacherDto.firstName,
          lastName: createTeacherDto.lastName,
          username: username,
          role: UserRole.TEACHER,
          passwordHash: await bcrypt.hash(temporaryPassword, 10),
        },
      });

      // Validate that all courses belong to the teacher's department
      if (createTeacherDto.courseIds && createTeacherDto.courseIds.length > 0) {
        const courses = await prisma.course.findMany({
          where: {
            id: { in: createTeacherDto.courseIds },
          },
          select: {
            id: true,
            departmentId: true,
            code: true,
          },
        });

        const invalidCourses = courses.filter(
          course => course.departmentId !== createTeacherDto.departmentId
        );

        if (invalidCourses.length > 0) {
          const errorResponse: ApiErrorResponse = {
            errorCode: "TCHC",
            errorMessage: `Courses must belong to the teacher's department. Invalid courses: ${invalidCourses.map(c => c.code).join(', ')}`,
            timestamp: new Date().toISOString(),
          };
          throw new BadRequestException(errorResponse);
        }
      }

      const teacher = await prisma.teacher.create({
        data: {
          name: createTeacherDto.firstName + " " + createTeacherDto.lastName,
          email: createTeacherDto.email,
          departmentId: createTeacherDto.departmentId,
          roomId: createTeacherDto.roomId,
          maxCourses: createTeacherDto.maxCourses,
          status: createTeacherDto.status || 'ACTIVE',
          userId: user.id,
        } as Prisma.TeacherUncheckedCreateInput,
      });

      // Assign courses if provided
      if (createTeacherDto.courseIds && createTeacherDto.courseIds.length > 0) {
        await prisma.teacherCourse.createMany({
          data: createTeacherDto.courseIds.map(courseId => ({
            teacherId: teacher.id,
            courseId: courseId,
          })),
        });
      }

      return prisma.teacher.findUnique({
        where: { id: teacher.id },
        include: {
          department: true,
          room: true,
          teacherCourses: {
            include: {
              course: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        department: true,
        room: true,
        teacherCourses: {
          include: {
            course: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        sections: {
          include: {
            course: true,
            timeBlock: true,
            room: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        department: true,
        room: true,
        teacherCourses: {
          include: {
            course: true,
          },
        },
        sections: {
          include: {
            course: true,
            timeBlock: true,
            room: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    try {
      //get teacher by id
      const teacher = await this.prisma.teacher.findUnique({
        where: { id },
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }
      // get user by id
      const user = await this.prisma.user.findUnique({
        where: { id: teacher.userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${teacher.userId} not found`);
      }
      //run it with transaction
      const updatedTeacher = await this.prisma.$transaction(async (prisma) => {
        // compare first name and last name with user
        if (
          updateTeacherDto.firstName !== user.firstName ||
          updateTeacherDto.lastName !== user.lastName ||
          updateTeacherDto.email !== user.email
        ) {
          // update user
          await prisma.user.update({
            where: { id: user.id },
            data: {
              firstName: updateTeacherDto.firstName,
              lastName: updateTeacherDto.lastName,
              email: updateTeacherDto.email,
            },
          });
        }

        const updateData: Prisma.TeacherUncheckedUpdateInput = {
          name: updateTeacherDto.firstName + " " + updateTeacherDto.lastName,
          email: updateTeacherDto.email,
        };

        if (updateTeacherDto.departmentId !== undefined) {
          updateData.departmentId = updateTeacherDto.departmentId;
        }

        if (updateTeacherDto.roomId !== undefined) {
          updateData.roomId = updateTeacherDto.roomId;
        }

        if (updateTeacherDto.maxCourses !== undefined) {
          updateData.maxCourses = updateTeacherDto.maxCourses;
        }

        if (updateTeacherDto.status !== undefined) {
          updateData.status = updateTeacherDto.status;
        }

        const updatedTeacher = await prisma.teacher.update({
          where: { id },
          data: updateData,
        });

        // Update course assignments if provided
        if (updateTeacherDto.courseIds !== undefined) {
          // Determine the department to validate against (use updated department or existing one)
          const departmentId = updateTeacherDto.departmentId ?? teacher.departmentId;

          // Validate that all courses belong to the teacher's department
          if (updateTeacherDto.courseIds.length > 0) {
            const courses = await prisma.course.findMany({
              where: {
                id: { in: updateTeacherDto.courseIds },
              },
              select: {
                id: true,
                departmentId: true,
                code: true,
              },
            });

            const invalidCourses = courses.filter(
              course => course.departmentId !== departmentId
            );

            if (invalidCourses.length > 0) {
              const errorResponse: ApiErrorResponse = {
                errorCode: "TCHC",
                errorMessage: `Courses must belong to the teacher's department. Invalid courses: ${invalidCourses.map(c => c.code).join(', ')}`,
                timestamp: new Date().toISOString(),
              };
              throw new BadRequestException(errorResponse);
            }
          }

          // Delete existing course assignments
          await prisma.teacherCourse.deleteMany({
            where: { teacherId: id },
          });

          // Create new course assignments
          if (updateTeacherDto.courseIds.length > 0) {
            await prisma.teacherCourse.createMany({
              data: updateTeacherDto.courseIds.map(courseId => ({
                teacherId: id,
                courseId: courseId,
              })),
            });
          }
        }

        return prisma.teacher.findUnique({
          where: { id },
          include: {
            department: true,
            room: true,
            teacherCourses: {
              include: {
                course: true,
              },
            },
            sections: {
              include: {
                course: true,
                timeBlock: true,
                room: true,
              },
            },
          },
        });
      });

      return updatedTeacher;
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    // check if the teacher is used in course sections
    const courseSections = await this.prisma.courseSection.findMany({
      where: { teacherId: id },
    });
    if (courseSections.length > 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.TCHD,
        "Teacher is used in course sections"
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }
    try {
      return await this.prisma.teacher.delete({
        where: { id },
        /* include: {
          department: true,
          sections: {
            include: {
              course: true,
              timeBlock: true,
              room: true,
            },
          },
        }, */
      });
    } catch (error) {
      // if (error.code === 'P2025') {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.TCHB,
        `Teacher with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
      // }
      //   throw error;
    }
  }

  async getCoursesByTeacher(teacherId: string, academicCycleId?: string) {
    const where: any = { teacherId };

    // If academic cycle is provided, filter by it; otherwise return all
    if (academicCycleId) {
      where.academicCycleId = academicCycleId;
    }

    const sections = await this.prisma.courseSection.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
          },
        },
        timeBlock: true,
        academicCycle: true,
        room: true,
        _count: { select: { scheduleCourseSections: true } },
      },
      orderBy: [{ timeBlock: { startTime: "asc" } }, { sectionNumber: "asc" }],
    });

    // Ensure Planning course sections are included (workaround for potential query issues)
    const planningCourse = await this.prisma.course.findUnique({
      where: { code: "Planning" },
      select: { id: true },
    });

    if (planningCourse) {
      const directPlanningSections = await this.prisma.courseSection.findMany({
        where: {
          teacherId,
          courseId: planningCourse.id,
        },
        include: {
          course: {
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
            },
          },
          timeBlock: true,
          academicCycle: true,
          room: true,
          _count: { select: { scheduleCourseSections: true } },
        },
      });

      // Add any Planning sections that are missing from main results
      const missingFromMain = directPlanningSections.filter(
        (direct) => !sections.find((s) => s.id === direct.id)
      );

      if (missingFromMain.length > 0) {
        sections.push(...missingFromMain);
      }
    }

    // Always compute enrollment based on actual schedule enrollments (avoids stale currentEnrollment column)
    return (sections as any[]).map((section) => {
      const { _count, ...rest } = section;
      return {
        ...rest,
        currentEnrollment: _count?.scheduleCourseSections ?? rest.currentEnrollment ?? 0,
      };
    });
  }

  async getStudentsPerCourse(teacherId: string) {
    // Get all course sections for this teacher, including enrolled students via scheduleCourseSections
    return this.prisma.courseSection.findMany({
      where: { teacherId },
      include: {
        course: true,
        scheduleCourseSections: {
          include: {
            schedule: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getTeacherWorkload(academicYearId: string) {
    // Get Planning course ID for explicit inclusion
    const planningCourse = await this.prisma.course.findUnique({
      where: { code: "Planning" },
      select: { id: true },
    });

    // Get all teachers with their course sections for the given academic year
    const teachers = await this.prisma.teacher.findMany({
      where: {
        isActive: true,
        sections: {
          some: {
            academicCycleId: academicYearId,
            isActive: true,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        sections: {
          where: {
            academicCycleId: academicYearId,
            isActive: true,
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            timeBlock: {
              select: {
                id: true,
                name: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
              },
            },
            academicCycle: {
              select: {
                id: true,
                name: true,
                cycleType: true,
              },
            },
          },
        },
      },
    });

    // Ensure Planning sections are included for each teacher
    if (planningCourse) {
      for (const teacher of teachers) {
        const directPlanningSections = await this.prisma.courseSection.findMany({
          where: {
            teacherId: teacher.id,
            courseId: planningCourse.id,
            academicCycleId: academicYearId,
            isActive: true,
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            timeBlock: {
              select: {
                id: true,
                name: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
              },
            },
            academicCycle: {
              select: {
                id: true,
                name: true,
                cycleType: true,
              },
            },
          },
        });

        // Add any Planning sections that are missing from main results
        const missingFromMain = directPlanningSections.filter(
          (direct) => !teacher.sections.find((s) => s.id === direct.id)
        );

        if (missingFromMain.length > 0) {
          teacher.sections.push(...missingFromMain);
        }
      }
    }

    // Calculate statistics for each teacher
    return teachers.map((teacher) => {
      const allSections = teacher.sections;
      
      // Filter out Planning sections for statistics calculations
      const nonPlanningSections = allSections.filter(
        (section) => section.course.code.toUpperCase() !== 'PLANNING'
      );
      
      // Calculate statistics excluding Planning sections
      const totalSections = nonPlanningSections.length;
      const totalStudents = nonPlanningSections.reduce((sum, section) => sum + section.currentEnrollment, 0);
      const totalCapacity = nonPlanningSections.reduce((sum, section) => sum + section.maxEnrollment, 0);
      const averageEnrollment = totalSections > 0 ? Math.round(totalStudents / totalSections) : 0;
      const enrollmentPercentage = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

      // Group sections by course (excluding Planning for course count)
      const coursesMap = new Map<string, { course: typeof allSections[0]['course']; sections: typeof allSections }>();
      nonPlanningSections.forEach((section) => {
        const courseId = section.course.id;
        if (!coursesMap.has(courseId)) {
          coursesMap.set(courseId, { course: section.course, sections: [] });
        }
        coursesMap.get(courseId)!.sections.push(section);
      });

      return {
        id: teacher.id,
        teacherId: teacher.teacherId,
        name: teacher.name,
        email: teacher.email,
        maxCourses: teacher.maxCourses,
        department: teacher.department,
        user: teacher.user,
        sections: allSections.map((section) => {
          const isPlanning = section.course.code.toUpperCase() === 'PLANNING';
          return {
            id: section.id,
            sectionNumber: section.sectionNumber,
            course: section.course,
            timeBlock: section.timeBlock,
            room: section.room,
            currentEnrollment: section.currentEnrollment,
            maxEnrollment: section.maxEnrollment,
            enrollmentPercentage: isPlanning 
              ? null // Don't calculate percentage for Planning sections
              : (section.maxEnrollment > 0 
                  ? Math.round((section.currentEnrollment / section.maxEnrollment) * 100) 
                  : 0),
            academicCycle: section.academicCycle,
          };
        }),
        statistics: {
          totalSections,
          totalStudents,
          totalCapacity,
          averageEnrollment,
          enrollmentPercentage,
          courseLoad: totalSections, // Excludes Planning sections
          coursesCount: coursesMap.size, // Excludes Planning from course count
        },
      };
    });
  }

  async getStudentsForCourseSection(
    teacherId: string,
    courseSectionId: string
  ) {
    // Ensure the course section belongs to the teacher
    const section = await this.prisma.courseSection.findFirst({
      where: { id: courseSectionId, teacherId },
    });
    if (!section) {
      throw new Error("Course section not found for this teacher");
    }
    // Get students for this course section
    return this.prisma.scheduleCourseSection.findMany({
      where: { courseSectionId },
      include: {
        schedule: {
          include: {
            student: {
              include: {
                user: true,
                gradeLevel: true,
              },
            },
          },
        },
      },
    });
  }

  async getByUserId(userId: string) {
    return this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        department: true,
      },
    });
  }

  private generateUsername(email: string): string {
    // Extract username from email (before @)
    const username = email.split("@")[0];
    // Remove special characters and convert to lowercase
    return username.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  }

  /**
   * Get export data for teachers - returns one row per course section (assignment)
   * Only includes ACTIVE teachers who have at least one course section assignment
   */
  async getExportData() {
    // Get current academic year (SCHOOL_YEAR type)
    const currentAcademicYear = await this.prisma.academicCycle.findFirst({
      where: {
        cycleType: CycleType.SCHOOL_YEAR,
        isCurrent: true,
      },
    });

    // If no current academic year, get the most recent one
    const academicYear = currentAcademicYear || await this.prisma.academicCycle.findFirst({
      where: {
        cycleType: CycleType.SCHOOL_YEAR,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    if (!academicYear) {
      return [];
    }

    // Query course sections for active teachers in the current academic year
    const courseSections = await this.prisma.courseSection.findMany({
      where: {
        teacher: {
          status: TeacherStatus.ACTIVE,
        },
        academicCycleId: academicYear.id,
      },
      include: {
        teacher: {
          include: {
            department: true,
            room: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
          },
        },
        timeBlock: {
          select: {
            name: true,
            startTime: true,
            endTime: true,
          },
        },
        room: {
          select: {
            name: true,
            roomNo: true,
            capacity: true,
          },
        },
      },
      orderBy: [
        { teacher: { name: 'asc' } },
        { course: { code: 'asc' } },
        { sectionNumber: 'asc' },
      ],
    });

    // Transform to export format: one row per course section
    const exportRows: any[] = [];

    for (const section of courseSections) {
      const teacher = section.teacher;
      const teacherId = teacher.teacherId;
      const firstName = teacher.user?.firstName || "";
      const lastName = teacher.user?.lastName || "";
      const email = teacher.user?.email || teacher.email;
      const department = teacher.department?.name || "";
      const roomName = section.room?.name || teacher.room?.name || "";
      const roomNo = section.room?.roomNo || "";
      // Use maxEnrollment from course section for room_capacity
      const roomCapacity = section.maxEnrollment ? section.maxEnrollment.toString() : "";

      // Determine if this is a Planning course
      const isPlanning = section.course.code.toUpperCase() === 'PLANNING';

      // Format time block times
      const timeBlockName = section.timeBlock?.name || "";
      const startTime = section.timeBlock?.startTime 
        ? this.formatTimeForExport(section.timeBlock.startTime)
        : "";
      const endTime = section.timeBlock?.endTime
        ? this.formatTimeForExport(section.timeBlock.endTime)
        : "";

      // Format rotation day (extract letter, e.g., "A_DAY" -> "A", "B_DAY" -> "B")
      const rotationDay = section.rotationDay 
        ? section.rotationDay.split('_')[0]
        : "";

      exportRows.push({
        teacher_id: teacherId,
        teacher_first_name: firstName,
        teacher_last_name: lastName,
        email: email,
        course_id: section.course.code,
        course_name: section.course.name,
        course_credits: section.course.credits.toString(),
        department: department,
        room_id: roomNo,
        room_name: roomName,
        room_capacity: roomCapacity,
        time_block_name: timeBlockName,
        start_time: startTime,
        end_time: endTime,
        schedule_type: "Block",
        rotation_day: rotationDay,
        available: isPlanning ? "FALSE" : "TRUE",
        school_level: "HS",
      });
    }

    return exportRows;
  }

  /**
   * Format time for export (HH:mm format)
   */
  private formatTimeForExport(dateTime: Date): string {
    const hours = dateTime.getUTCHours().toString().padStart(2, '0');
    const minutes = dateTime.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Generate CSV export for teacher assignments
   */
  async generateCSVExport(): Promise<string> {
    const exportData = await this.getExportData();

    const headers = [
      "teacher_id",
      "teacher_first_name",
      "teacher_last_name",
      "email",
      "course_id",
      "course_name",
      "course_credits",
      "department",
      "room_id",
      "room_name",
      "room_capacity",
      "time_block_name",
      "start_time",
      "end_time",
      "schedule_type",
      "rotation_day",
      "available",
      "school_level",
    ];

    // Convert to array of arrays for Papa.unparse
    const rows = exportData.map((row) => [
      row.teacher_id,
      row.teacher_first_name,
      row.teacher_last_name,
      row.email,
      row.course_id,
      row.course_name,
      row.course_credits,
      row.department,
      row.room_id,
      row.room_name,
      row.room_capacity,
      row.time_block_name,
      row.start_time,
      row.end_time,
      row.schedule_type,
      row.rotation_day,
      row.available,
      row.school_level,
    ]);

    return Papa.unparse([headers, ...rows]);
  }

  /**
   * Generate Excel export for teacher assignments
   */
  async generateExcelExport(): Promise<Buffer> {
    const exportData = await this.getExportData();

    const headers = [
      "teacher_id",
      "teacher_first_name",
      "teacher_last_name",
      "email",
      "course_id",
      "course_name",
      "course_credits",
      "department",
      "room_id",
      "room_name",
      "room_capacity",
      "time_block_name",
      "start_time",
      "end_time",
      "schedule_type",
      "rotation_day",
      "available",
      "school_level",
    ];

    // Convert to array of arrays for XLSX
    const rows = exportData.map((row) => [
      row.teacher_id,
      row.teacher_first_name,
      row.teacher_last_name,
      row.email,
      row.course_id,
      row.course_name,
      row.course_credits,
      row.department,
      row.room_id,
      row.room_name,
      row.room_capacity,
      row.time_block_name,
      row.start_time,
      row.end_time,
      row.schedule_type,
      row.rotation_day,
      row.available,
      row.school_level,
    ]);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths for better readability
    const colWidths = [
      { wch: 15 }, // teacher_id
      { wch: 18 }, // teacher_first_name
      { wch: 18 }, // teacher_last_name
      { wch: 25 }, // email
      { wch: 15 }, // course_id
      { wch: 30 }, // course_name
      { wch: 12 }, // course_credits
      { wch: 20 }, // department
      { wch: 15 }, // room_id
      { wch: 20 }, // room_name
      { wch: 12 }, // room_capacity
      { wch: 18 }, // time_block_name
      { wch: 10 }, // start_time
      { wch: 10 }, // end_time
      { wch: 12 }, // schedule_type
      { wch: 12 }, // rotation_day
      { wch: 10 }, // available
      { wch: 12 }, // school_level
    ];
    worksheet["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teacher Assignments");

    // Convert to buffer
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }
}

