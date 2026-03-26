import { BadRequestException, Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      // Check for duplicate name
      const existingName = await this.prisma.department.findFirst({
        where: {
          name: {
            equals: createDepartmentDto.name,
            mode: 'insensitive',
          },
        },
      });

      if (existingName) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.DEPC,
          'A department with this name already exists'
        )
          .withLogger(this.logger)
          .build();
        throw new ConflictException(errorResponse);
      }

      // Check for duplicate code
      const existingCode = await this.prisma.department.findFirst({
        where: {
          code: {
            equals: createDepartmentDto.code,
            mode: 'insensitive',
          },
        },
      });

      if (existingCode) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.DEPC,
          'A department with this code already exists'
        )
          .withLogger(this.logger)
          .build();
        throw new ConflictException(errorResponse);
      }

      return await this.prisma.department.create({
        data: {
          ...createDepartmentDto,
          code: createDepartmentDto.code.toUpperCase(),
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error('Error creating department:', error);
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.DEPC,
        'Failed to create department'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }
  }

  async findAll() {
    return this.prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            courses: true,
            teachers: true,
          },
        },
      },
    });
  }

  async findOne(id: string, options?: { includeCourses?: boolean; includeTeachers?: boolean }) {
    const include: any = {
      _count: {
        select: {
          courses: true,
          teachers: true,
        },
      },
    };

    // Conditionally include courses if requested
    if (options?.includeCourses) {
      include.courses = {
        include: {
          _count: {
            select: {
              sections: true,
            },
          },
          courseLevel: true,
          minGradeLevel: true,
        },
      };
    }

    // Conditionally include teachers if requested
    if (options?.includeTeachers) {
      include.teachers = {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      };
    }

    const department = await this.prisma.department.findUnique({
      where: { id },
      include,
    });

    if (!department) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.DEPN,
        `Department with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    try {
      // Check if department exists
      const existingDepartment = await this.prisma.department.findUnique({
        where: { id },
      });

      if (!existingDepartment) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.DEPN,
          `Department with ID ${id} not found`
        )
          .withLogger(this.logger)
          .build();
        throw new NotFoundException(errorResponse);
      }

      // Check for duplicate name (if name is being updated)
      if (updateDepartmentDto.name) {
        const existingName = await this.prisma.department.findFirst({
          where: {
            name: {
              equals: updateDepartmentDto.name,
              mode: 'insensitive',
            },
            id: {
              not: id,
            },
          },
        });

        if (existingName) {
          const errorResponse = ApiErrorResponseBuilder.create(
            ErrorCode.DEPC,
            'A department with this name already exists'
          )
            .withLogger(this.logger)
            .build();
          throw new ConflictException(errorResponse);
        }
      }

      // Check for duplicate code (if code is being updated)
      if (updateDepartmentDto.code) {
        const existingCode = await this.prisma.department.findFirst({
          where: {
            code: {
              equals: updateDepartmentDto.code,
              mode: 'insensitive',
            },
            id: {
              not: id,
            },
          },
        });

        if (existingCode) {
          const errorResponse = ApiErrorResponseBuilder.create(
            ErrorCode.DEPC,
            'A department with this code already exists'
          )
            .withLogger(this.logger)
            .build();
          throw new ConflictException(errorResponse);
        }
      }

      return await this.prisma.department.update({
        where: { id },
        data: {
          ...updateDepartmentDto,
          ...(updateDepartmentDto.code && { code: updateDepartmentDto.code.toUpperCase() }),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error('Error updating department:', error);
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.DEPC,
        'Failed to update department'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }
  }

  async remove(id: string) {
   
      const department = await this.prisma.department.findUnique({
        where: { id },
        include: { courses: true, teachers: true },
      });

      if (!department) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.DEPN,
          `Department with ID ${id} not found`
        )
          .withLogger(this.logger)
          .build();
        throw new NotFoundException(errorResponse);
      }
      
      if(department.courses.length > 0 || department.teachers.length > 0) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.DEPC,
          'Department has courses or teachers'
        )
          .withLogger(this.logger)
          .build();
        throw new BadRequestException(errorResponse);
      }
      try {
      return await this.prisma.department.delete({
        where: { id },
      });
    } catch (error) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.DEPN,
        `Department with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }
  }
} 