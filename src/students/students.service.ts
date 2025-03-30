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
    const counselor = await this.prisma.counselor.findUnique({
      where: { id: counselorId },
      include: {
        user: true,
      },
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
        student: true,
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
        student: true,
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
    if (updateStudentDto.name) {
      await this.prisma.user.update({
        where: { id },
        data: { name: updateStudentDto.name },
        include: {
          student: true
        }
      });
    }

    // Update the student info if grade level provided
    if (updateStudentDto.gradeLevel) {
      await this.prisma.student.update({
        where: { userId: id },
        data: { gradeLevel: updateStudentDto.gradeLevel },
      });
    }

    // Get the updated student with all data
    return this.findOne(id);
  }
}
