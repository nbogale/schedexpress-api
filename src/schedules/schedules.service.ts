import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { studentId, courseIds, ...scheduleData } = createScheduleDto;

    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { schedule: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Check if student already has a schedule
    if (student.schedule) {
      throw new ConflictException(`Student already has a schedule`);
    }

    // Validate courses
    if (courseIds.length === 0) {
      throw new BadRequestException('Schedule must include at least one course');
    }

    // Check if all courses exist
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
    });

    if (courses.length !== courseIds.length) {
      throw new NotFoundException('One or more courses not found');
    }

    // Check capacity for each course
    const overCapacityCourses = courses.filter(
      course => course.currentEnrollment >= course.capacity
    );

    if (overCapacityCourses.length > 0) {
      throw new ConflictException(
        `Some courses are at capacity: ${overCapacityCourses.map(c => c.name).join(', ')}`
      );
    }

    // Check for period conflicts
    const periods = courses.map(course => course.period);
    const uniquePeriods = new Set(periods);
    
    if (periods.length !== uniquePeriods.size) {
      throw new ConflictException('Schedule has period conflicts');
    }

    // Get settings to check max course load
    const settings = await this.prisma.settings.findFirst();
    const maxCourseLoad = settings?.maxCourseLoad || 8;

    if (courseIds.length > maxCourseLoad) {
      throw new ConflictException(`Schedule exceeds maximum course load of ${maxCourseLoad}`);
    }

    // Create schedule with course connections
    return this.prisma.$transaction(async (prisma) => {
      // Create schedule
      const schedule = await prisma.schedule.create({
        data: {
          ...scheduleData,
          student: { connect: { id: studentId } },
          courses: {
            connect: courseIds.map(id => ({ id })),
          },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          courses: true,
        },
      });

      // Update course enrollments
      for (const course of courses) {
        await prisma.course.update({
          where: { id: course.id },
          data: { currentEnrollment: { increment: 1 } },
        });
      }

      return schedule;
    });
  }

  async findAll() {
    return this.prisma.schedule.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        courses: true,
      },
    });
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        courses: {
          orderBy: {
            period: 'asc',
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async findByStudent(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const schedule = await this.prisma.schedule.findUnique({
      where: { studentId },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        courses: {
          orderBy: {
            period: 'asc',
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule not found for student ID ${studentId}`);
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const { addCourseIds, removeCourseIds, ...scheduleData } = updateScheduleDto;

    // Check if schedule exists
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        courses: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    // Process course modifications
    let coursesToConnect = [];
    let coursesToDisconnect = [];

    if (addCourseIds && addCourseIds.length > 0) {
      // Check if courses exist
      const courses = await this.prisma.course.findMany({
        where: { id: { in: addCourseIds } },
      });

      if (courses.length !== addCourseIds.length) {
        throw new NotFoundException('One or more courses to add not found');
      }

      // Check for capacity
      const overCapacityCourses = courses.filter(
        course => course.currentEnrollment >= course.capacity
      );

      if (overCapacityCourses.length > 0) {
        throw new ConflictException(
          `Some courses are at capacity: ${overCapacityCourses.map(c => c.name).join(', ')}`
        );
      }

      // Check for period conflicts with existing courses
      const existingPeriods = schedule.courses.map(course => course.period);
      const newPeriods = courses.map(course => course.period);
      
      const allPeriods = [...existingPeriods];
      
      for (const period of newPeriods) {
        if (allPeriods.includes(period)) {
          throw new ConflictException(`Period conflict with course in period ${period}`);
        }
        allPeriods.push(period);
      }

      coursesToConnect = addCourseIds.map(id => ({ id }));
    }

    if (removeCourseIds && removeCourseIds.length > 0) {
      // Verify these courses are in the schedule
      const coursesToRemove = schedule.courses.filter(
        course => removeCourseIds.includes(course.id)
      );

      if (coursesToRemove.length !== removeCourseIds.length) {
        throw new BadRequestException('One or more courses to remove are not in the schedule');
      }

      coursesToDisconnect = removeCourseIds.map(id => ({ id }));
    }

    // Get settings to check max course load
    const settings = await this.prisma.settings.findFirst();
    const maxCourseLoad = settings?.maxCourseLoad || 8;

    // Calculate new total courses
    const newTotalCourses = 
      schedule.courses.length + 
      (coursesToConnect.length - coursesToDisconnect.length);

    if (newTotalCourses > maxCourseLoad) {
      throw new ConflictException(`Schedule exceeds maximum course load of ${maxCourseLoad}`);
    }

    if (newTotalCourses === 0) {
      throw new BadRequestException('Schedule must include at least one course');
    }

    // Update schedule
    return this.prisma.$transaction(async (prisma) => {
      // Update schedule data
      const updatedSchedule = await prisma.schedule.update({
        where: { id },
        data: {
          ...scheduleData,
          courses: {
            connect: coursesToConnect,
            disconnect: coursesToDisconnect,
          },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          courses: true,
        },
      });

      // Update course enrollments
      if (coursesToConnect.length > 0) {
        for (const course of coursesToConnect) {
          await prisma.course.update({
            where: { id: course.id },
            data: { currentEnrollment: { increment: 1 } },
          });
        }
      }

      if (coursesToDisconnect.length > 0) {
        for (const course of coursesToDisconnect) {
          await prisma.course.update({
            where: { id: course.id },
            data: { currentEnrollment: { decrement: 1 } },
          });
        }
      }

      return updatedSchedule;
    });
  }

  async remove(id: string) {
    // Check if schedule exists
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        courses: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    // Delete schedule and update course enrollments
    return this.prisma.$transaction(async (prisma) => {
      // Delete schedule
      await prisma.schedule.delete({
        where: { id },
      });

      // Update course enrollments
      for (const course of schedule.courses) {
        await prisma.course.update({
          where: { id: course.id },
          data: { currentEnrollment: { decrement: 1 } },
        });
      }

      return { id, deleted: true };
    });
  }
}
