import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createRuleDto: CreateRuleDto) {
    // Check if rule with same name already exists
    const existingRule = await this.prisma.rule.findUnique({
      where: { name: createRuleDto.name },
    });

    if (existingRule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.RULC,
        `Rule with name '${createRuleDto.name}' already exists`
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    return this.prisma.rule.create({
      data: createRuleDto,
    });
  }

  async findAll() {
    return this.prisma.rule.findMany();
  }

  async findOne(id: string) {
    const rule = await this.prisma.rule.findUnique({
      where: { id },
    });

    if (!rule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.RULN,
        `Rule with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return rule;
  }

  async update(id: string, updateRuleDto: UpdateRuleDto) {
    const rule = await this.prisma.rule.findUnique({
      where: { id },
    });

    if (!rule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.RULN,
        `Rule with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // If name is being updated, check if it's unique
    if (updateRuleDto.name && updateRuleDto.name !== rule.name) {
      const existingRule = await this.prisma.rule.findUnique({
        where: { name: updateRuleDto.name },
      });

      if (existingRule) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.RULC,
          `Rule with name '${updateRuleDto.name}' already exists`
        )
          .withLogger(this.logger)
          .build();
        throw new ConflictException(errorResponse);
      }
    }

    return this.prisma.rule.update({
      where: { id },
      data: updateRuleDto,
    });
  }

  async remove(id: string) {
    const rule = await this.prisma.rule.findUnique({
      where: { id },
    });

    if (!rule) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.RULN,
        `Rule with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return this.prisma.rule.delete({
      where: { id },
    });
  }
}
