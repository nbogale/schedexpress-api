import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async create(createRuleDto: CreateRuleDto) {
    // Check if rule with same name already exists
    const existingRule = await this.prisma.rule.findFirst({
      where: {
        name: createRuleDto.name,
      },
    });

    if (existingRule) {
      throw new ConflictException(`Rule with name '${createRuleDto.name}' already exists`);
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
      throw new NotFoundException(`Rule with ID ${id} not found`);
    }

    return rule;
  }

  async update(id: string, updateRuleDto: UpdateRuleDto) {
    // Check if rule exists
    await this.findOne(id);

    // Check for name uniqueness if name is being updated
    if (updateRuleDto.name) {
      const existingRule = await this.prisma.rule.findFirst({
        where: {
          name: updateRuleDto.name,
          id: { not: id },
        },
      });

      if (existingRule) {
        throw new ConflictException(`Rule with name '${updateRuleDto.name}' already exists`);
      }
    }

    return this.prisma.rule.update({
      where: { id },
      data: updateRuleDto,
    });
  }

  async remove(id: string) {
    // Check if rule exists
    await this.findOne(id);

    return this.prisma.rule.delete({
      where: { id },
    });
  }
}
