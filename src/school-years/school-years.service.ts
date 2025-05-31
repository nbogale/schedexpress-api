import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class SchoolYearsService {
  private readonly logger = new Logger(SchoolYearsService.name);
  constructor(private prisma: PrismaService) {}

  async create(createSchoolYearDto: CreateSchoolYearDto) {
    return this.prisma.schoolYear.create({
      data: createSchoolYearDto,
      include: {
        terms: true,
      },
    });
  }

  async findAll() {
    return this.prisma.schoolYear.findMany({
      orderBy: {
        startDate: 'desc',
      },
      include: {
        terms: {
          orderBy: {
            startDate: 'asc',
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: { id },
      include: {
        terms: {
          orderBy: {
            startDate: 'asc',
          },
        },
      },
    });

    if (!schoolYear) {
      throw new NotFoundException(`School year with ID ${id} not found`);
    }

    return schoolYear;
  }

  async update(id: string, updateSchoolYearDto: UpdateSchoolYearDto) {
    try {
      return await this.prisma.schoolYear.update({
        where: { id },
        data: updateSchoolYearDto,
        include: {
          terms: {
            orderBy: {
              startDate: 'asc',
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`School year with ID ${id} not found`);
    }
  }

  async remove(id: string) {

    // check if the school year is used in course sections
    const courseSections = await this.prisma.courseSection.findMany({
      where: { schoolYearId: id },
    });
    if (courseSections.length > 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.SCYA,
        'School year is used in course sections'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }
    try {
      return await this.prisma.schoolYear.delete({
        where: { id },
        /* include: {
          terms: true,
        }, */
      });
    } catch (error) {
      throw new NotFoundException(`School year with ID ${id} not found`);
    }
  }

  async toggleStatus(id: string, isCurrent: boolean) {
    try {
      // If setting this school year as current, unset any other current school years
      if (isCurrent) {
        await this.prisma.schoolYear.updateMany({
          where: {
            isCurrent: true,
            id: { not: id },
          },
          data: {
            isCurrent: false,
          },
        });
      }

      return await this.prisma.schoolYear.update({
        where: { id },
        data: { isCurrent },
        include: {
          terms: {
            orderBy: {
              startDate: 'asc',
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`School year with ID ${id} not found`);
    }
  }

  async getCurrent() {
    const currentSchoolYear = await this.prisma.schoolYear.findFirst({
      where: { isCurrent: true },
      include: {
        terms: {
          orderBy: {
            startDate: 'asc',
          },
        },
      },
    });

    if (!currentSchoolYear) {
      throw new NotFoundException('No current school year found');
    }

    return currentSchoolYear;
  }
} 