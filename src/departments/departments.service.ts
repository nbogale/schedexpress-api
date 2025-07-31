import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    return this.prisma.department.create({
      data: createDepartmentDto,
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
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
      return await this.prisma.department.update({
        where: { id },
        data: updateDepartmentDto,
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