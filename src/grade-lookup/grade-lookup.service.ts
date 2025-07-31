import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeLookupDto } from './dto/create-grade-lookup.dto';
import { UpdateGradeLookupDto } from './dto/update-grade-lookup.dto';

@Injectable()
export class GradeLookupService {
  constructor(private prisma: PrismaService) {}

  async create(createGradeLookupDto: CreateGradeLookupDto) {
    return this.prisma.gradeLookup.create({
      data: {
        grade: createGradeLookupDto.grade,
        gradePoints: createGradeLookupDto.gradePoints,
        description: createGradeLookupDto.description,
        isPassing: createGradeLookupDto.isPassing ?? true,
        isActive: createGradeLookupDto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.gradeLookup.findMany({
      orderBy: { grade: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.gradeLookup.findMany({
      where: { isActive: true },
      orderBy: { grade: 'asc' },
    });
  }

  async findPassingGrades() {
    return this.prisma.gradeLookup.findMany({
      where: { 
        isActive: true,
        isPassing: true 
      },
      orderBy: { grade: 'asc' },
    });
  }

  async findOne(id: string) {
    const gradeLookup = await this.prisma.gradeLookup.findUnique({
      where: { id },
    });

    if (!gradeLookup) {
      throw new NotFoundException(`Grade lookup with ID ${id} not found`);
    }

    return gradeLookup;
  }

  async findByGrade(grade: string) {
    const gradeLookup = await this.prisma.gradeLookup.findUnique({
      where: { grade },
    });

    if (!gradeLookup) {
      throw new NotFoundException(`Grade lookup for grade '${grade}' not found`);
    }

    return gradeLookup;
  }

  async update(id: string, updateGradeLookupDto: UpdateGradeLookupDto) {
    // Check if the record exists
    await this.findOne(id);

    return this.prisma.gradeLookup.update({
      where: { id },
      data: {
        grade: updateGradeLookupDto.grade,
        gradePoints: updateGradeLookupDto.gradePoints,
        description: updateGradeLookupDto.description,
        isPassing: updateGradeLookupDto.isPassing,
        isActive: updateGradeLookupDto.isActive,
      },
    });
  }

  async remove(id: string) {
    // Check if the record exists
    await this.findOne(id);

    return this.prisma.gradeLookup.delete({
      where: { id },
    });
  }

  async getGradePoints(grade: string): Promise<number> {
    try {
      const gradeLookup = await this.findByGrade(grade);
      return Number(gradeLookup.gradePoints);
    } catch (error) {
      // Return 0 for unknown grades
      return 0;
    }
  }

  async isPassingGrade(grade: string): Promise<boolean> {
    try {
      const gradeLookup = await this.findByGrade(grade);
      return gradeLookup.isPassing;
    } catch (error) {
      // Return false for unknown grades
      return false;
    }
  }

  async calculateGPA(studentId: string): Promise<number> {
    const courseHistory = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        grade: { not: null },
      },
      include: {
        course: true,
      },
    });

    if (courseHistory.length === 0) {
      return 0;
    }

    let totalGradePoints = 0;
    let totalCredits = 0;

    for (const record of courseHistory) {
      if (record.grade) {
        const gradePoints = await this.getGradePoints(record.grade);
        const credits = Number(record.course.credits);
        
        totalGradePoints += gradePoints * credits;
        totalCredits += credits;
      }
    }

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  }

  async calculateGPAByTerm(studentId: string, termId: string): Promise<number> {
    const courseHistory = await this.prisma.studentCourseHistory.findMany({
      where: {
        studentId,
        termId,
        grade: { not: null },
      },
      include: {
        course: true,
      },
    });

    if (courseHistory.length === 0) {
      return 0;
    }

    let totalGradePoints = 0;
    let totalCredits = 0;

    for (const record of courseHistory) {
      if (record.grade) {
        const gradePoints = await this.getGradePoints(record.grade);
        const credits = Number(record.course.credits);
        
        totalGradePoints += gradePoints * credits;
        totalCredits += credits;
      }
    }

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  }

  async seedDefaultGrades() {
    const defaultGrades = [
      { grade: 'A', gradePoints: 4.0, description: 'Excellent', isPassing: true },
      { grade: 'A-', gradePoints: 3.7, description: 'Excellent', isPassing: true },
      { grade: 'B+', gradePoints: 3.3, description: 'Good', isPassing: true },
      { grade: 'B', gradePoints: 3.0, description: 'Good', isPassing: true },
      { grade: 'B-', gradePoints: 2.7, description: 'Good', isPassing: true },
      { grade: 'C+', gradePoints: 2.3, description: 'Satisfactory', isPassing: true },
      { grade: 'C', gradePoints: 2.0, description: 'Satisfactory', isPassing: true },
      { grade: 'C-', gradePoints: 1.7, description: 'Satisfactory', isPassing: true },
      { grade: 'D+', gradePoints: 1.3, description: 'Poor', isPassing: true },
      { grade: 'D', gradePoints: 1.0, description: 'Poor', isPassing: true },
      { grade: 'D-', gradePoints: 0.7, description: 'Poor', isPassing: true },
      { grade: 'F', gradePoints: 0.0, description: 'Failing', isPassing: false },
      { grade: 'P', gradePoints: 0.0, description: 'Pass', isPassing: true },
      { grade: 'NP', gradePoints: 0.0, description: 'No Pass', isPassing: false },
      { grade: 'I', gradePoints: 0.0, description: 'Incomplete', isPassing: false },
      { grade: 'W', gradePoints: 0.0, description: 'Withdrawal', isPassing: false },
    ];

    const createdGrades = [];
    for (const gradeData of defaultGrades) {
      try {
        const grade = await this.prisma.gradeLookup.upsert({
          where: { grade: gradeData.grade },
          update: gradeData,
          create: gradeData,
        });
        createdGrades.push(grade);
      } catch (error) {
        console.error(`Error creating grade ${gradeData.grade}:`, error);
      }
    }

    return createdGrades;
  }
} 