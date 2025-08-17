import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ApiErrorResponse } from 'src/common/api-error';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

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
          passwordHash: await bcrypt.hash(temporaryPassword, 10),
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
        schedule: {
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
}
