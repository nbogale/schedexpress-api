import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { Prisma } from '@prisma/client';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class CourseSectionsService {
  private readonly logger = new Logger(CourseSectionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseSectionDto: CreateCourseSectionDto) {
    console.log('createCourseSectionDto', JSON.stringify(createCourseSectionDto, null, 2));
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createCourseSectionDto.courseId },
    });
    if (!course) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Course not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Check if academic cycle exists
    const academicCycle = await this.prisma.academicCycle.findUnique({
      where: { id: createCourseSectionDto.academicCycleId },
    });
    if (!academicCycle) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Academic cycle not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Check if time block exists
    const timeBlock = await this.prisma.timeBlock.findUnique({
      where: { id: createCourseSectionDto.timeBlockId },
    });
    if (!timeBlock) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Time block not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: createCourseSectionDto.roomId },
    });
    if (!room) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Room not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Check if teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: createCourseSectionDto.teacherId },
    });
    if (!teacher) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Teacher not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Check for time block conflicts
    const existingSection = await this.prisma.courseSection.findFirst({
      where: {
        academicCycleId: createCourseSectionDto.academicCycleId,
        timeBlockId: createCourseSectionDto.timeBlockId,
        AND: [
          {
            OR: [
              // Same rotation day
              { rotationDay: createCourseSectionDto.rotationDay },
              // If either section has no rotation day, they conflict (both run every day)
              { rotationDay: null },
              ...(createCourseSectionDto.rotationDay === null ? [{ rotationDay: null }] : []),
            ],
          },
          {
            OR: [
              { roomId: createCourseSectionDto.roomId },
              { teacherId: createCourseSectionDto.teacherId },
            ],
          },
        ],
      },
    });

    if (existingSection) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSB,
        'Time block conflict: Room or teacher is already assigned during this time'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }

    return this.prisma.courseSection.create({
      data: createCourseSectionDto,
      include: {
        course: true,
        academicCycle: true,
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
        academicCycle: true,
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
        academicCycle: true,
        timeBlock: true,
        room: true,
        teacher: true,
      },
    });

    if (!section) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        `Course section with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return section;
  }

  async update(id: string, updateCourseSectionDto: UpdateCourseSectionDto) {
    // Check if section exists
    const section = await this.prisma.courseSection.findUnique({
      where: { id },
    });
    if (!section) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Course section not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // If updating time block, room, teacher, or rotation day, check for conflicts
    if (updateCourseSectionDto.timeBlockId || updateCourseSectionDto.roomId || updateCourseSectionDto.teacherId || updateCourseSectionDto.rotationDay !== undefined) {
      const newTimeBlockId = updateCourseSectionDto.timeBlockId || section.timeBlockId;
      const newRoomId = updateCourseSectionDto.roomId || section.roomId;
      const newTeacherId = updateCourseSectionDto.teacherId || section.teacherId;
      const newRotationDay = updateCourseSectionDto.rotationDay !== undefined ? updateCourseSectionDto.rotationDay : section.rotationDay;

      const existingSection = await this.prisma.courseSection.findFirst({
        where: {
          id: { not: id },
          academicCycleId: section.academicCycleId,
          timeBlockId: newTimeBlockId,
          AND: [
            {
              OR: [
                // Same rotation day
                { rotationDay: newRotationDay },
                // If either section has no rotation day, they conflict (both run every day)
                { rotationDay: null },
                ...(newRotationDay === null ? [{ rotationDay: null }] : []),
              ],
            },
            {
              OR: [
                { roomId: newRoomId },
                { teacherId: newTeacherId },
              ],
            },
          ],
        },
      });

      if (existingSection) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.CSSC,
          'Time block conflict: Room or teacher is already assigned during this time'
        )
          .withLogger(this.logger)
          .build();
        throw new BadRequestException(errorResponse);
      }
    }

    return this.prisma.courseSection.update({
      where: { id },
      data: updateCourseSectionDto,
      include: {
        course: true,
        academicCycle: true,
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
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Course section not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Check if section has enrolled students
    if (section.currentEnrollment > 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSD,
        'Cannot delete section with enrolled students'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
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
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Course section not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    if (section.currentEnrollment >= section.maxEnrollment) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSE,
        'Section is already at maximum enrollment'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
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
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Course section not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    if (section.currentEnrollment <= 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSF,
        'Section has no enrolled students'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
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

  async findAllByCourseId(courseId: string, where: Prisma.CourseSectionWhereInput) {
    return this.prisma.courseSection.findMany({
      where: { courseId, ...where },
      include: {
        course: true,
        academicCycle: true,
        timeBlock: true,
        room: true,
        teacher: true,
      },
    });
  }
} 