import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseSequenceDto } from './dto/create-course-sequence.dto';
import { UpdateCourseSequenceDto } from './dto/update-course-sequence.dto';

@Injectable()
export class CourseSequencesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseSequenceDto: CreateCourseSequenceDto) {
    // Check if department and course exist
    const [department, course] = await Promise.all([
      this.prisma.department.findUnique({
        where: { id: createCourseSequenceDto.departmentId },
      }),
      this.prisma.course.findUnique({
        where: { id: createCourseSequenceDto.courseId },
      }),
    ]);

    if (!department || !course) {
      throw new BadRequestException('Department or course does not exist');
    }

    // Check if sequence already exists
    const existingSequence = await this.prisma.courseSequence.findUnique({
      where: {
        departmentId_courseId: {
          departmentId: createCourseSequenceDto.departmentId,
          courseId: createCourseSequenceDto.courseId,
        },
      },
    });

    if (existingSequence) {
      throw new BadRequestException('This course sequence already exists');
    }

    return this.prisma.courseSequence.create({
      data: createCourseSequenceDto,
      include: {
        department: true,
        course: true,
      },
    });
  }

  async findAll() {
    return this.prisma.courseSequence.findMany({
      include: {
        department: true,
        course: true,
      },
      orderBy: {
        sequenceOrder: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const sequence = await this.prisma.courseSequence.findUnique({
      where: { id },
      include: {
        department: true,
        course: true,
      },
    });

    if (!sequence) {
      throw new NotFoundException(`Course sequence with ID ${id} not found`);
    }

    return sequence;
  }

  async findByDepartment(departmentId: string) {
    return this.prisma.courseSequence.findMany({
      where: { departmentId },
      include: {
        department: true,
        course: true,
      },
      orderBy: {
        sequenceOrder: 'asc',
      },
    });
  }

  async update(id: string, updateCourseSequenceDto: UpdateCourseSequenceDto) {
    try {
      return await this.prisma.courseSequence.update({
        where: { id },
        data: updateCourseSequenceDto,
        include: {
          department: true,
          course: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Course sequence with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.courseSequence.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Course sequence with ID ${id} not found`);
    }
  }
} 