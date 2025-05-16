import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourseSectionsService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseSectionDto: CreateCourseSectionDto) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createCourseSectionDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if school year exists
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: { id: createCourseSectionDto.schoolYearId },
    });
    if (!schoolYear) {
      throw new NotFoundException('School year not found');
    }

    // Check if term exists
    const term = await this.prisma.term.findUnique({
      where: { id: createCourseSectionDto.termId },
    });
    if (!term) {
      throw new NotFoundException('Term not found');
    }

    // Check if time block exists
    const timeBlock = await this.prisma.timeBlock.findUnique({
      where: { id: createCourseSectionDto.timeBlockId },
    });
    if (!timeBlock) {
      throw new NotFoundException('Time block not found');
    }

    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: createCourseSectionDto.roomId },
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: createCourseSectionDto.teacherId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check for time block conflicts
    const existingSection = await this.prisma.courseSection.findFirst({
      where: {
        timeBlockId: createCourseSectionDto.timeBlockId,
        OR: [
          { roomId: createCourseSectionDto.roomId },
          { teacherId: createCourseSectionDto.teacherId },
        ],
      },
    });

    if (existingSection) {
      throw new BadRequestException('Time block conflict: Room or teacher is already assigned during this time');
    }

    return this.prisma.courseSection.create({
      data: createCourseSectionDto,
      include: {
        course: true,
        schoolYear: true,
        term: true,
        timeBlock: true,
        room: true,
        teacher: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CourseSectionWhereInput;
    orderBy?: Prisma.CourseSectionOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.courseSection.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        course: true,
        schoolYear: true,
        term: true,
        timeBlock: true,
        room: true,
        teacher: true,
      },
    });
  }

  async findOne(id: string) {
    const section = await this.prisma.courseSection.findUnique({
      where: { id },
      include: {
        course: true,
        schoolYear: true,
        term: true,
        timeBlock: true,
        room: true,
        teacher: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Course section not found');
    }

    return section;
  }

  async update(id: string, updateCourseSectionDto: UpdateCourseSectionDto) {
    // Check if section exists
    const section = await this.prisma.courseSection.findUnique({
      where: { id },
    });
    if (!section) {
      throw new NotFoundException('Course section not found');
    }

    // If updating time block, room, or teacher, check for conflicts
    if (updateCourseSectionDto.timeBlockId || updateCourseSectionDto.roomId || updateCourseSectionDto.teacherId) {
      const existingSection = await this.prisma.courseSection.findFirst({
        where: {
          id: { not: id },
          timeBlockId: updateCourseSectionDto.timeBlockId || section.timeBlockId,
          OR: [
            { roomId: updateCourseSectionDto.roomId || section.roomId },
            { teacherId: updateCourseSectionDto.teacherId || section.teacherId },
          ],
        },
      });

      if (existingSection) {
        throw new BadRequestException('Time block conflict: Room or teacher is already assigned during this time');
      }
    }

    return this.prisma.courseSection.update({
      where: { id },
      data: updateCourseSectionDto,
      include: {
        course: true,
        schoolYear: true,
        term: true,
        timeBlock: true,
        room: true,
        teacher: true,
      },
    });
  }

  async remove(id: string) {
    // Check if section exists
    const section = await this.prisma.courseSection.findUnique({
      where: { id },
    });
    if (!section) {
      throw new NotFoundException('Course section not found');
    }

    // Check if section has enrolled students
    if (section.currentEnrollment > 0) {
      throw new BadRequestException('Cannot delete section with enrolled students');
    }

    return this.prisma.courseSection.delete({
      where: { id },
    });
  }

  async incrementEnrollment(id: string) {
    const section = await this.prisma.courseSection.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Course section not found');
    }

    if (section.currentEnrollment >= section.maxEnrollment) {
      throw new BadRequestException('Section is already at maximum enrollment');
    }

    return this.prisma.courseSection.update({
      where: { id },
      data: {
        currentEnrollment: {
          increment: 1,
        },
      },
    });
  }

  async decrementEnrollment(id: string) {
    const section = await this.prisma.courseSection.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Course section not found');
    }

    if (section.currentEnrollment <= 0) {
      throw new BadRequestException('Section has no enrolled students');
    }

    return this.prisma.courseSection.update({
      where: { id },
      data: {
        currentEnrollment: {
          decrement: 1,
        },
      },
    });
  }
} 