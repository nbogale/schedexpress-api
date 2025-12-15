import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { CourseSection, Prisma } from '@prisma/client';
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

    // Check room conflict for academicCycleId, timeblock and roomId
    const existingRoomSection = await this.prisma.courseSection.findFirst({
      where: {
        academicCycleId: createCourseSectionDto.academicCycleId,
        timeBlockId: createCourseSectionDto.timeBlockId,
        roomId: createCourseSectionDto.roomId,
      },
    });
    if (existingRoomSection) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSG,
        'Room conflict: Room is already assigned during this time'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }

    // Check for teacher conflict for academicCycleId, timeblock and teacherId
    const existingTeacherSection = await this.prisma.courseSection.findFirst({
      where: {
        academicCycleId: createCourseSectionDto.academicCycleId,
        timeBlockId: createCourseSectionDto.timeBlockId,
        teacherId: createCourseSectionDto.teacherId,
      },
    });
    if (existingTeacherSection) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSH,
        'Teacher conflict: Teacher is already assigned during this time'
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
    console.log('findAll params: ', JSON.stringify(params, null, 2));
    const { skip, take, where, orderBy } = params;
    return this.prisma.courseSection.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        course: true,
        academicCycle: {
          select: {
            id: true,
            name: true,
          },
        },
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
    if (updateCourseSectionDto.timeBlockId || updateCourseSectionDto.roomId || updateCourseSectionDto.teacherId) {
      const newTimeBlockId = updateCourseSectionDto.timeBlockId || section.timeBlockId;
      const newRoomId = updateCourseSectionDto.roomId || section.roomId;
      const newTeacherId = updateCourseSectionDto.teacherId || section.teacherId;

      const existingSection = await this.prisma.courseSection.findFirst({
        where: {
          id: { not: id },
          academicCycleId: section.academicCycleId,
          timeBlockId: newTimeBlockId,
          OR: [
            { roomId: newRoomId },
            { teacherId: newTeacherId },
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
        academicCycle: {
          select: {
            id: true,
            name: true,
          },
        },
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
        timeBlock: true,
        room: true,
        teacher: true,
      },
    });
  }

  async findAllByRoomId(roomId: string, where: Prisma.CourseSectionWhereInput) {
    return this.prisma.courseSection.findMany({
      where: { roomId, ...where },
      include: {
        course: true,
        timeBlock: true,
        room: true,
        teacher: true,
      },
    });
  }

  async checkConflictForAcademicCycle(academicCycleId: string) {

    const conflictedSections: ConflictedSection[] = [];
    const sections = await this.prisma.courseSection.findMany({
      where: { academicCycleId },
    });

    if (!sections) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CSSN,
        'Course sections not found'
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    for (const section of sections) {
      // Check the section has conflicts with other sections it might be timeblock, room or teacher
      const hasConflicts = await this.prisma.courseSection.findMany({
        where: { 
          academicCycleId: academicCycleId,
          timeBlockId: section.timeBlockId,
          OR: [
            { roomId: section.roomId },
            { teacherId: section.teacherId },
          ],
          id: { not: section.id },
        },
        include: {
          room: true,
          teacher: true,
          timeBlock: true,
          course: true,
        },
      });

      if (hasConflicts && hasConflicts.length > 0) {
        conflictedSections.push({ courseSection: section, conflictWithSections: hasConflicts });
      }
    }

    return {
      success: true,
      data: conflictedSections,
    };
  }

  async getStudentsForCourseSection(courseSectionId: string) {
    // Verify course section exists
    const section = await this.prisma.courseSection.findUnique({
      where: { id: courseSectionId },
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

    // Get students enrolled in this course section
    const scheduleCourseSections = await this.prisma.scheduleCourseSection.findMany({
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

    return scheduleCourseSections;
  }
} 

// Create type for conflictedSections
export type ConflictedSection = {
  courseSection: CourseSection;
  conflictWithSections: CourseSection[];
};

