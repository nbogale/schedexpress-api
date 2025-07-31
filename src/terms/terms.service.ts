import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';
import { ErrorCode } from 'src/common/error-codes';

@Injectable()
export class TermsService {
  private readonly logger = new Logger(TermsService.name);
  constructor(private prisma: PrismaService) {}

  async create(createTermDto: CreateTermDto) {
    return this.prisma.term.create({
      data: createTermDto,
      include: {
        schoolYear: true,
      },
    });
  }

  async findAll() {
    return this.prisma.term.findMany({
      orderBy: {
        startDate: 'desc',
      },
      include: {
        schoolYear: true,
      },
    });
  }

  async findOne(id: string) {
    const term = await this.prisma.term.findUnique({
      where: { id },
      include: {
        schoolYear: true,
      },
    });

    if (!term) {
      throw new NotFoundException(`Term with ID ${id} not found`);
    }

    return term;
  }

  async update(id: string, updateTermDto: UpdateTermDto) {
    try {
      return await this.prisma.term.update({
        where: { id },
        data: updateTermDto,
        include: {
          schoolYear: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Term with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    // check if the term is used in course sections
    const courseSections = await this.prisma.courseSection.findMany({
      where: { termId: id },
    });
    if (courseSections.length > 0) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.TRMA,
        'Term is used in course sections'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }
    try {
      return await this.prisma.term.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Term with ID ${id} not found`);
    }
  }

  async toggleStatus(id: string, isCurrent: boolean) {
    try {
      // If setting this term as current, unset any other current terms
      if (isCurrent) {
        await this.prisma.term.updateMany({
          where: {
            isCurrent: true,
            id: { not: id },
          },
          data: {
            isCurrent: false,
          },
        });
      }

      return await this.prisma.term.update({
        where: { id },
        data: { isCurrent },
        include: {
          schoolYear: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Term with ID ${id} not found`);
    }
  }

  async findBySchoolYear(schoolYearId: string) {
    return this.prisma.term.findMany({
      where: { schoolYearId },
      orderBy: {
        startDate: 'asc',
      },
      include: {
        schoolYear: true,
      },
    });
  }
} 