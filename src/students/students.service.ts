import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UserRole } from '@prisma/client';

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
            courseSections: {
              include: {
                course: true,
                room: true,
                timeBlock: true,
                teacher: true,
              },
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
}
