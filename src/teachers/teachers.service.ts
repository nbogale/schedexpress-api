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
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

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

      return prisma.teacher.create({
        data: {
          name: createTeacherDto.firstName + " " + createTeacherDto.lastName,
          email: createTeacherDto.email,
          departmentId: createTeacherDto.departmentId,
          maxCourses: createTeacherDto.maxCourses,
          userId: user.id,
        },
        include: {
          department: true,
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

        const updatedTeacher = await prisma.teacher.update({
          where: { id },
          data: {
            name: updateTeacherDto.firstName + " " + updateTeacherDto.lastName,
            email: updateTeacherDto.email,
            departmentId: updateTeacherDto.departmentId,
            maxCourses: updateTeacherDto.maxCourses,
          },
          include: {
            department: true,
            sections: {
              include: {
                course: true,
                timeBlock: true,
                room: true,
              },
            },
          },
        });

        return updatedTeacher;
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

    return sections;
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
}
