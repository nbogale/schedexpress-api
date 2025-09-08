import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicCycleConfigDto } from './dto/create-academic-cycle-config.dto';
import { UpdateAcademicCycleConfigDto } from './dto/update-academic-cycle-config.dto';
import { CreateAcademicCycleRuleDto } from './dto/create-academic-cycle-rule.dto';
import { CreateAcademicCycleDto } from './dto/create-academic-cycle.dto';
import { UpdateAcademicCycleDto } from './dto/update-academic-cycle.dto';
import { ValidateAcademicCycleDto } from './dto/validate-academic-cycle.dto';
import { CycleType } from '@prisma/client';

@Injectable()
export class AcademicCyclesService {
  constructor(private prisma: PrismaService) {}

  // Academic Cycle Config Methods
  async createConfig(createConfigDto: CreateAcademicCycleConfigDto, userId: string) {
    const { isDefault, ...configData } = createConfigDto;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await this.prisma.academicCycleConfig.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    return this.prisma.academicCycleConfig.create({
      data: {
        ...configData,
        isDefault: isDefault || false,
        createdBy: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        cycleRules: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  }

  async findAllConfigs() {
    return this.prisma.academicCycleConfig.findMany({
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        cycleRules: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            academicCycles: true,
            cycleRules: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findConfigById(id: string) {
    const config = await this.prisma.academicCycleConfig.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        cycleRules: {
          orderBy: { sortOrder: 'asc' }
        },
        academicCycles: {
          include: {
            parent: true,
            children: true,
            validator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!config) {
      throw new NotFoundException('Academic cycle configuration not found');
    }

    return config;
  }

  async updateConfig(id: string, updateConfigDto: UpdateAcademicCycleConfigDto) {
    const { isDefault, ...configData } = updateConfigDto;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await this.prisma.academicCycleConfig.updateMany({
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    return this.prisma.academicCycleConfig.update({
      where: { id },
      data: {
        ...configData,
        ...(isDefault !== undefined && { isDefault })
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        cycleRules: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  }

  async removeConfig(id: string) {
    // Check if config is being used
    const config = await this.prisma.academicCycleConfig.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            academicCycles: true,
            cycleRules: true
          }
        }
      }
    });

    if (!config) {
      throw new NotFoundException('Academic cycle configuration not found');
    }

    if (config._count.academicCycles > 0) {
      throw new ConflictException('Cannot delete configuration that has associated academic cycles');
    }

    // Delete rules first
    await this.prisma.academicCycleRule.deleteMany({
      where: { configId: id }
    });

    return this.prisma.academicCycleConfig.delete({
      where: { id }
    });
  }

  // Academic Cycle Rule Methods
  async createRule(createRuleDto: CreateAcademicCycleRuleDto) {
    // Validate that config exists
    const config = await this.prisma.academicCycleConfig.findUnique({
      where: { id: createRuleDto.configId }
    });

    if (!config) {
      throw new NotFoundException('Academic cycle configuration not found');
    }

    return this.prisma.academicCycleRule.create({
      data: createRuleDto,
      include: {
        config: true
      }
    });
  }

  async findRulesByConfigId(configId: string) {
    return this.prisma.academicCycleRule.findMany({
      where: { configId },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async updateRule(id: string, updateRuleDto: Partial<CreateAcademicCycleRuleDto>) {
    return this.prisma.academicCycleRule.update({
      where: { id },
      data: updateRuleDto,
      include: {
        config: true
      }
    });
  }

  async removeRule(id: string) {
    return this.prisma.academicCycleRule.delete({
      where: { id }
    });
  }

  // Academic Cycle Methods
  async createCycle(createCycleDto: CreateAcademicCycleDto) {
    const { parentId, configId, ...cycleData } = createCycleDto;

    // Ensure dates are properly formatted as ISO DateTime strings
    if (cycleData.startDate && typeof cycleData.startDate === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(cycleData.startDate)) {
        cycleData.startDate = new Date(cycleData.startDate + 'T00:00:00.000Z').toISOString();
      }
    }

    if (cycleData.endDate && typeof cycleData.endDate === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(cycleData.endDate)) {
        cycleData.endDate = new Date(cycleData.endDate + 'T23:59:59.999Z').toISOString();
      }
    }

    // Validate parent cycle if provided
    if (parentId) {
      const parent = await this.prisma.academicCycle.findUnique({
        where: { id: parentId }
      });
      if (!parent) {
        throw new NotFoundException('Parent academic cycle not found');
      }
    }

    // Validate config if provided
    if (configId) {
      const config = await this.prisma.academicCycleConfig.findUnique({
        where: { id: configId }
      });
      if (!config) {
        throw new NotFoundException('Academic cycle configuration not found');
      }
    }

    // If this is set as current, unset other current cycles of the same type
    if (cycleData.isCurrent) {
      await this.prisma.academicCycle.updateMany({
        where: { 
          cycleType: cycleData.cycleType,
          isCurrent: true
        },
        data: { isCurrent: false }
      });
    }

    return this.prisma.academicCycle.create({
      data: {
        ...cycleData,
        parentId,
        configId
      } as any,
      include: {
        parent: true,
        children: true,
        config: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  async findAllCycles() {
    return this.prisma.academicCycle.findMany({
      include: {
        parent: true,
        children: true,
        config: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            grades: true,
            children: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });
  }

  async findCycleById(id: string) {
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            validator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { startDate: 'asc' }
        },
        config: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        grades: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            course: true
          }
        }
      }
    });

    if (!cycle) {
      throw new NotFoundException('Academic cycle not found');
    }

    return cycle;
  }

  async findCyclesByType(cycleType: CycleType) {
    return this.prisma.academicCycle.findMany({
      where: { cycleType },
      include: {
        parent: true,
        children: true,
        config: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });
  }

  async findCurrentCycle(cycleType?: CycleType) {
    const where: any = { isCurrent: true };
    if (cycleType) {
      where.cycleType = cycleType;
    }

    return this.prisma.academicCycle.findFirst({
      where,
      include: {
        parent: true,
        children: true,
        config: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  async updateCycle(id: string, updateCycleDto: UpdateAcademicCycleDto) {
    const { isCurrent, ...cycleData } = updateCycleDto;

    // Ensure dates are properly formatted as ISO DateTime strings
    if (cycleData.startDate && typeof cycleData.startDate === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(cycleData.startDate)) {
        cycleData.startDate = new Date(cycleData.startDate + 'T00:00:00.000Z').toISOString();
      }
    }

    if (cycleData.endDate && typeof cycleData.endDate === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(cycleData.endDate)) {
        cycleData.endDate = new Date(cycleData.endDate + 'T23:59:59.999Z').toISOString();
      }
    }

    // If this is set as current, unset other current cycles of the same type
    if (isCurrent) {
      const currentCycle = await this.prisma.academicCycle.findUnique({
        where: { id },
        select: { cycleType: true }
      });

      if (currentCycle) {
        await this.prisma.academicCycle.updateMany({
          where: { 
            cycleType: currentCycle.cycleType,
            isCurrent: true,
            id: { not: id }
          },
          data: { isCurrent: false }
        });
      }
    }

    return this.prisma.academicCycle.update({
      where: { id },
      data: {
        ...cycleData,
        ...(isCurrent !== undefined && { isCurrent })
      } as any,
      include: {
        parent: true,
        children: true,
        config: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  async validateCycle(validateCycleDto: ValidateAcademicCycleDto, userId: string) {
    const { id, validationNotes } = validateCycleDto;

    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id }
    });

    if (!cycle) {
      throw new NotFoundException('Academic cycle not found');
    }

    return this.prisma.academicCycle.update({
      where: { id },
      data: {
        isValidated: true,
        validatedBy: userId,
        validatedAt: new Date(),
        validationNotes
      },
      include: {
        parent: true,
        children: true,
        config: true,
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  async removeCycle(id: string) {
    // Check if cycle has children
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            grades: true
          }
        }
      }
    });

    if (!cycle) {
      throw new NotFoundException('Academic cycle not found');
    }

    if (cycle._count.children > 0) {
      throw new ConflictException('Cannot delete cycle that has child cycles');
    }

    if (cycle._count.grades > 0) {
      throw new ConflictException('Cannot delete cycle that has associated grades');
    }

    return this.prisma.academicCycle.delete({
      where: { id }
    });
  }

  // Validation Methods
  async validateCycleStructure(cycleId: string) {
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: cycleId },
      include: {
        config: {
          include: {
            cycleRules: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        children: {
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!cycle || !cycle.config) {
      return { isValid: false, errors: ['Cycle or configuration not found'] };
    }

    const errors: string[] = [];
    const config = cycle.config;

    // Check if cycle type is allowed by config
    const allowedTypes = [];
    if (config.hasSemesters) allowedTypes.push(CycleType.SEMESTER);
    if (config.hasQuarters) allowedTypes.push(CycleType.QUARTER);
    if (config.hasTrimesters) allowedTypes.push(CycleType.TRIMESTER);
    if (config.hasSessions) allowedTypes.push(CycleType.SESSION);

    if (!allowedTypes.includes(cycle.cycleType) && cycle.cycleType !== CycleType.SCHOOL_YEAR) {
      errors.push(`Cycle type ${cycle.cycleType} is not allowed by this configuration`);
    }

    // Check date validity
    if (cycle.startDate >= cycle.endDate) {
      errors.push('Start date must be before end date');
    }

    // Check parent-child relationships
    if (cycle.parentId) {
      const parent = await this.prisma.academicCycle.findUnique({
        where: { id: cycle.parentId }
      });

      if (!parent) {
        errors.push('Parent cycle not found');
      } else if (parent.startDate > cycle.startDate || parent.endDate < cycle.endDate) {
        errors.push('Cycle dates must be within parent cycle dates');
      }
    }

    // Check for overlapping children
    if (cycle.children.length > 1) {
      for (let i = 0; i < cycle.children.length - 1; i++) {
        const current = cycle.children[i];
        const next = cycle.children[i + 1];

        if (current.endDate > next.startDate && !config.allowCustomCycles) {
          errors.push(`Child cycles ${current.name} and ${next.name} overlap`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
