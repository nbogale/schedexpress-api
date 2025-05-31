import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';
import { ErrorCode } from 'src/common/error-codes';

@Injectable()
export class TimeBlocksService {
  private readonly logger = new Logger(TimeBlocksService.name);
  constructor(private prisma: PrismaService) {}

  async create(createTimeBlockDto: CreateTimeBlockDto) {
    return this.prisma.timeBlock.create({
      data: createTimeBlockDto,
    });
  }

  async findAll() {
    return this.prisma.timeBlock.findMany({
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const timeBlock = await this.prisma.timeBlock.findUnique({
      where: { id },
    });

    if (!timeBlock) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.TBDB,
        `Time block with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return timeBlock;
  }

  async update(id: string, updateTimeBlockDto: UpdateTimeBlockDto) {
    try {
      return await this.prisma.timeBlock.update({
        where: { id },
        data: updateTimeBlockDto,
      });
    } catch (error) {
      throw new NotFoundException(`Time block with ID ${id} not found`);
    }
  }

  async remove(id: string) {
 
      // check if the time block is active
      const timeBlock = await this.prisma.timeBlock.findUnique({
        where: { id },
      });

      if (!timeBlock) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.TBDB,
          `Time block with ID ${id} not found`
        )
          .withLogger(this.logger)
          .build();
        throw new NotFoundException(errorResponse);
      }

      // check if the time block is used in course sections 
      const courseSections = await this.prisma.courseSection.findMany({
        where: { timeBlockId: id },
      });
      
      if (courseSections.length > 0) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.TBDA,
          'Cannot delete time block that is used in course sections'
        )
          .withLogger(this.logger)
          .build();
        throw new ConflictException(errorResponse);
      }
      try {
      return await this.prisma.timeBlock.delete({
        where: { id },
      });
    } catch (error) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.TBDB,
       `Time block with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      
      throw new NotFoundException(errorResponse);
    }
  }

  async toggleStatus(id: string, isActive: boolean) {
    try {
      return await this.prisma.timeBlock.update({
        where: { id },
        data: { isActive },
      });
    } catch (error) {
      throw new NotFoundException(`Time block with ID ${id} not found`);
    }
  }
} 