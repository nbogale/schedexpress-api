import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseRuleDto } from './dto/create-course-rule.dto';
import { UpdateCourseRuleDto } from './dto/update-course-rule.dto';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class CourseRulesService {
  private readonly logger = new Logger(CourseRulesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseRuleDto: CreateCourseRuleDto) {
    // Check if a similar rule already exists
    const existingRule = await this.prisma.courseRule.findFirst({
      where: {
        courseId: createCourseRuleDto.courseId,
        conflictingCourseId: createCourseRuleDto.conflictingCourseId,
      },
    });

    if (existingRule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRLC,
        'A similar rule already exists for these courses'
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    // Verify that both courses exist
    const course = await this.prisma.course.findUnique({
      where: { id: createCourseRuleDto.courseId },
    });

    if (!course) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRLN,
        `Course with ID ${createCourseRuleDto.courseId} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    const conflictingCourse = await this.prisma.course.findUnique({
      where: { id: createCourseRuleDto.conflictingCourseId },
    });

    if (!conflictingCourse) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRLN,
        `Conflicting course with ID ${createCourseRuleDto.conflictingCourseId} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return this.prisma.courseRule.create({
      data: createCourseRuleDto,
    });
  }

  async findAll() {
    return this.prisma.courseRule.findMany({
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        conflictingCourse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const courseRule = await this.prisma.courseRule.findUnique({
      where: { id },
    });

    if (!courseRule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRLN,
        `Course rule with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return courseRule;
  }

  async update(id: string, updateCourseRuleDto: UpdateCourseRuleDto) {
    const courseRule = await this.prisma.courseRule.findUnique({
      where: { id },
    });

    if (!courseRule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRLN,
        `Course rule with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // If course or conflicting course is being updated, verify they exist
    if (updateCourseRuleDto.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: updateCourseRuleDto.courseId },
      });

      if (!course) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.CRLN,
          `Course with ID ${updateCourseRuleDto.courseId} not found`
        )
          .withLogger(this.logger)
          .build();
        throw new NotFoundException(errorResponse);
      }
    }

    if (updateCourseRuleDto.conflictingCourseId) {
      const conflictingCourse = await this.prisma.course.findUnique({
        where: { id: updateCourseRuleDto.conflictingCourseId },
      });

      if (!conflictingCourse) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.CRLN,
          `Conflicting course with ID ${updateCourseRuleDto.conflictingCourseId} not found`
        )
          .withLogger(this.logger)
          .build();
        throw new NotFoundException(errorResponse);
      }
    }

    return this.prisma.courseRule.update({
      where: { id },
      data: updateCourseRuleDto,
    });
  }

  async remove(id: string) {
    const courseRule = await this.prisma.courseRule.findUnique({
      where: { id },
    });

    if (!courseRule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.CRLN,
        `Course rule with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return this.prisma.courseRule.delete({
      where: { id },
    });
  }
}
