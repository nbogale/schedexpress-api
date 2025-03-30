import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseRuleDto } from './dto/create-course-rule.dto';
import { UpdateCourseRuleDto } from './dto/update-course-rule.dto';

@Injectable()
export class CourseRulesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseRuleDto: CreateCourseRuleDto) {
    const { courseId, conflictingCourseId } = createCourseRuleDto;

    // Verify both courses exist
    await this.validateCourses(courseId, conflictingCourseId);

    // Check if rule already exists
    const existingRule = await this.prisma.courseRule.findFirst({
      where: {
        courseId,
        conflictingCourseId,
        type: createCourseRuleDto.type,
      },
    });

    if (existingRule) {
      throw new ConflictException('A similar rule already exists for these courses');
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
            courseCode: true,
          },
        },
        conflictingCourse: {
          select: {
            id: true,
            name: true,
            courseCode: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.courseRule.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            courseCode: true,
          },
        },
        conflictingCourse: {
          select: {
            id: true,
            name: true,
            courseCode: true,
          },
        },
      },
    });

    if (!rule) {
      throw new NotFoundException(`Course rule with ID ${id} not found`);
    }

    return rule;
  }

  async update(id: string, updateCourseRuleDto: UpdateCourseRuleDto) {
    // Check if rule exists
    await this.findOne(id);

    // Validate courses if they're being updated
    if (updateCourseRuleDto.courseId || updateCourseRuleDto.conflictingCourseId) {
      const courseId = updateCourseRuleDto.courseId || (await this.findOne(id)).courseId;
      const conflictingCourseId = 
        updateCourseRuleDto.conflictingCourseId || 
        (await this.findOne(id)).conflictingCourseId;
      
      await this.validateCourses(courseId, conflictingCourseId);
    }

    return this.prisma.courseRule.update({
      where: { id },
      data: updateCourseRuleDto,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            courseCode: true,
          },
        },
        conflictingCourse: {
          select: {
            id: true,
            name: true,
            courseCode: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if rule exists
    await this.findOne(id);

    return this.prisma.courseRule.delete({
      where: { id },
    });
  }

  private async validateCourses(courseId: string, conflictingCourseId: string) {
    // Verify primary course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Verify conflicting course exists
    const conflictingCourse = await this.prisma.course.findUnique({
      where: { id: conflictingCourseId },
    });

    if (!conflictingCourse) {
      throw new NotFoundException(`Conflicting course with ID ${conflictingCourseId} not found`);
    }
  }
}
