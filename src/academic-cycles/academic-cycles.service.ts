import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicCycleConfigDto } from './dto/create-academic-cycle-config.dto';
import { UpdateAcademicCycleConfigDto } from './dto/update-academic-cycle-config.dto';
import { CreateAcademicCycleRuleDto } from './dto/create-academic-cycle-rule.dto';
import { CreateAcademicCycleDto } from './dto/create-academic-cycle.dto';
import { UpdateAcademicCycleDto } from './dto/update-academic-cycle.dto';
import { ValidateAcademicCycleDto } from './dto/validate-academic-cycle.dto';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';
import { CycleType, AcademicPeriodStatus, AcademicPeriodType } from '@prisma/client';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class AcademicCyclesService {
  private readonly logger = new Logger(AcademicCyclesService.name);

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

    // Automatically mark as current if today's date falls between start and end dates
    // This applies to SCHOOL_YEAR, SEMESTER, and QUARTER cycle types
    // Get today's date as YYYY-MM-DD string for comparison (avoid timezone issues)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD in UTC
    
    // Extract date part from startDate and endDate (they may be ISO strings or date strings)
    let startDateStr: string;
    let endDateStr: string;
    
    if (typeof cycleData.startDate === 'string') {
      // Extract date part (YYYY-MM-DD) from ISO string or use as-is if already date-only
      startDateStr = cycleData.startDate.split('T')[0];
    } else {
      startDateStr = new Date(cycleData.startDate).toISOString().split('T')[0];
    }
    
    if (typeof cycleData.endDate === 'string') {
      // Extract date part (YYYY-MM-DD) from ISO string or use as-is if already date-only
      endDateStr = cycleData.endDate.split('T')[0];
    } else {
      endDateStr = new Date(cycleData.endDate).toISOString().split('T')[0];
    }

    // Compare dates as strings (YYYY-MM-DD format allows string comparison)
    const isDateInRange = todayStr >= startDateStr && todayStr <= endDateStr;
    const isApplicableCycleType = 
      cycleData.cycleType === CycleType.SCHOOL_YEAR ||
      cycleData.cycleType === CycleType.SEMESTER ||
      cycleData.cycleType === CycleType.QUARTER;
    
    // Debug logging
    this.logger.debug(
      `Checking if cycle "${cycleData.name}" (${cycleData.cycleType}) should be current: ` +
      `today=${todayStr}, ` +
      `start=${startDateStr}, ` +
      `end=${endDateStr}, ` +
      `inRange=${isDateInRange}, ` +
      `applicableType=${isApplicableCycleType}, ` +
      `isCurrent=${cycleData.isCurrent}, ` +
      `isCurrentType=${typeof cycleData.isCurrent}, ` +
      `willSet=${(cycleData.isCurrent === undefined || cycleData.isCurrent === null || cycleData.isCurrent === true) && isDateInRange && isApplicableCycleType}`
    );
    
    // Only auto-set isCurrent if:
    // 1. isCurrent is undefined, null, or true (not explicitly set to false)
    // 2. Today's date is within the cycle's date range
    // 3. The cycle type is SCHOOL_YEAR, SEMESTER, or QUARTER
    const shouldSetCurrent = (cycleData.isCurrent === undefined || cycleData.isCurrent === null || cycleData.isCurrent === true) 
      && isDateInRange 
      && isApplicableCycleType;
    
    if (shouldSetCurrent) {
      cycleData.isCurrent = true;
      this.logger.log(
        `Automatically marking ${cycleData.cycleType} cycle "${cycleData.name}" as current (today's date ${todayStr} is within cycle range ${startDateStr} to ${endDateStr})`
      );
    } else if (isDateInRange && isApplicableCycleType && cycleData.isCurrent === false) {
      this.logger.debug(
        `Skipping auto-marking ${cycleData.cycleType} cycle "${cycleData.name}" as current because isCurrent is explicitly set to false`
      );
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

  // Academic Period Methods
  async createPeriod(createPeriodDto: CreateAcademicPeriodDto, userId: string) {
    // Validate that the cycle exists
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: createPeriodDto.cycleId }
    });

    if (!cycle) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.ACCE,
        `Academic cycle with ID ${createPeriodDto.cycleId} not found`
      )
        .withLogger(this.logger)
        .build();

      throw new NotFoundException(errorResponse);
    }

    // Validate dates are within cycle dates
    // Normalize dates to compare only the date part (without time)
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };

    const startDate = normalizeDate(new Date(createPeriodDto.startDate));
    const endDate = normalizeDate(new Date(createPeriodDto.endDate));
    const cycleStart = normalizeDate(new Date(cycle.startDate));
    const cycleEnd = normalizeDate(new Date(cycle.endDate));

    const formatDateForMessage = (date: Date | string) => {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return date.toString().split('T')[0];
    };

    if (startDate < cycleStart) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.ACCB,
        `Period start date (${createPeriodDto.startDate.split('T')[0]}) cannot be before the cycle start date (${formatDateForMessage(cycle.startDate)})`
      )
        .withLogger(this.logger)
        .build();

      throw new BadRequestException(errorResponse);
    }

    if (endDate > cycleEnd) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.ACCB,
        `Period end date (${createPeriodDto.endDate.split('T')[0]}) cannot be after the cycle end date (${formatDateForMessage(cycle.endDate)})`
      )
        .withLogger(this.logger)
        .build();

      throw new BadRequestException(errorResponse);
    }

    if (startDate >= endDate) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.ACCC,
        'Start date must be before end date'
      )
        .withLogger(this.logger)
        .build();

      throw new BadRequestException(errorResponse);
    }

    // Check for overlapping periods with smart rules for BREAK periods
    const overlappingPeriods = await this.prisma.academicPeriod.findMany({
      where: {
        cycleId: createPeriodDto.cycleId,
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } }
            ]
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } }
            ]
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } }
            ]
          }
        ]
      }
    });

    if (overlappingPeriods.length > 0) {
      // Smart overlap rules: BREAK periods can overlap with INSTRUCTION, EXAM, GRADING, REVIEW
      // But BREAK cannot overlap with other BREAK periods or other period types
      const isCreatingBreak = createPeriodDto.periodType === AcademicPeriodType.BREAK;
      
      if (isCreatingBreak) {
        // For BREAK periods: filter out periods that BREAK can overlap with
        const allowedOverlapTypes = [
          AcademicPeriodType.INSTRUCTION,
          AcademicPeriodType.EXAM,
          AcademicPeriodType.GRADING,
          AcademicPeriodType.REVIEW
        ];
        
        // Find periods that BREAK cannot overlap with (other BREAKs or non-allowed types)
        const conflictingPeriods = overlappingPeriods.filter(p => {
          // BREAK cannot overlap with another BREAK
          if (p.periodType === AcademicPeriodType.BREAK) {
            return true;
          }
          // BREAK cannot overlap with periods not in the allowed list
          const isAllowedType = allowedOverlapTypes.some(type => type === p.periodType);
          if (!isAllowedType) {
            return true;
          }
          return false;
        });

        if (conflictingPeriods.length > 0) {
          const conflictingNames = conflictingPeriods.map(p => p.name).join(', ');
          const errorResponse = ApiErrorResponseBuilder.create(
            ErrorCode.ACCF,
            `Break period overlaps with incompatible period(s): ${conflictingNames}. Break periods can only overlap with Instruction, Exam, Grading, or Review periods.`
          )
            .withLogger(this.logger)
            .build();

          throw new ConflictException(errorResponse);
        }
        // If we get here, all overlapping periods are allowed (INSTRUCTION, EXAM, GRADING, or REVIEW)
        // Allow the overlap to proceed
      } else {
        // For non-BREAK periods: check if any overlapping period is a BREAK
        const overlappingBreaks = overlappingPeriods.filter(p => p.periodType === AcademicPeriodType.BREAK);
        const overlappingNonBreaks = overlappingPeriods.filter(p => p.periodType !== AcademicPeriodType.BREAK);
        
        // Non-BREAK periods cannot overlap with other non-BREAK periods
        if (overlappingNonBreaks.length > 0) {
          const conflictingNames = overlappingNonBreaks.map(p => p.name).join(', ');
          const errorResponse = ApiErrorResponseBuilder.create(
            ErrorCode.ACCF,
            `Period overlaps with existing period(s): ${conflictingNames}. Please adjust the dates.`
          )
            .withLogger(this.logger)
            .build();

          throw new ConflictException(errorResponse);
        }
        // If only overlapping with BREAK periods, that's allowed (non-BREAK can overlap with BREAK)
      }
    }

    // Convert date strings to ISO DateTime format for Prisma
    // Prisma DateTime fields require full ISO-8601 DateTime strings, not just dates
    let startDateForDb = createPeriodDto.startDate;
    let endDateForDb = createPeriodDto.endDate;

    if (typeof createPeriodDto.startDate === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(createPeriodDto.startDate)) {
        // Date-only format: convert to DateTime with time component
        startDateForDb = new Date(createPeriodDto.startDate + 'T00:00:00.000Z').toISOString();
      }
    }

    if (typeof createPeriodDto.endDate === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(createPeriodDto.endDate)) {
        // Date-only format: convert to DateTime with time component
        // Use end of day to ensure the full day is included
        endDateForDb = new Date(createPeriodDto.endDate + 'T23:59:59.999Z').toISOString();
      }
    }

    return this.prisma.academicPeriod.create({
      data: {
        cycleId: createPeriodDto.cycleId,
        name: createPeriodDto.name,
        periodType: createPeriodDto.periodType,
        status: createPeriodDto.status || AcademicPeriodStatus.PLANNED,
        startDate: startDateForDb,
        endDate: endDateForDb,
        description: createPeriodDto.description,
        isInstructional: createPeriodDto.isInstructional || false,
        allowsEnrollment: createPeriodDto.allowsEnrollment || false,
        allowsGrading: createPeriodDto.allowsGrading || false,
        allowsScheduleChanges: createPeriodDto.allowsScheduleChanges || false,
        isBreak: createPeriodDto.isBreak || false,
        sortOrder: createPeriodDto.sortOrder || 0,
        createdBy: userId
      },
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true
          }
        },
        creator: {
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

  async findAllPeriods(cycleId?: string) {
    const where = cycleId ? { cycleId } : {};
    
    return this.prisma.academicPeriod.findMany({
      where,
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { startDate: 'asc' }
      ]
    });
  }

  async findPeriodById(id: string) {
    const period = await this.prisma.academicPeriod.findUnique({
      where: { id },
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true,
            startDate: true,
            endDate: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!period) {
      throw new NotFoundException(`Academic period with ID ${id} not found`);
    }

    return period;
  }

  async findPeriodsByCycle(cycleId: string) {
    return this.prisma.academicPeriod.findMany({
      where: { cycleId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { startDate: 'asc' }
      ]
    });
  }

  async findCurrentPeriod(cycleId?: string) {
    const now = new Date();
    const where: any = {
      status: AcademicPeriodStatus.ACTIVE,
      startDate: { lte: now },
      endDate: { gte: now }
    };

    if (cycleId) {
      where.cycleId = cycleId;
    }

    return this.prisma.academicPeriod.findFirst({
      where,
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });
  }

  async findUpcomingPeriods(cycleId?: string, limit: number = 5) {
    const now = new Date();
    const where: any = {
      status: AcademicPeriodStatus.PLANNED,
      startDate: { gte: now }
    };

    if (cycleId) {
      where.cycleId = cycleId;
    }

    return this.prisma.academicPeriod.findMany({
      where,
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true
          }
        }
      },
      orderBy: { startDate: 'asc' },
      take: limit
    });
  }

  async updatePeriod(id: string, updatePeriodDto: UpdateAcademicPeriodDto) {
    const period = await this.findPeriodById(id);

    // If dates are being updated, validate them
    if (updatePeriodDto.startDate || updatePeriodDto.endDate) {
      const startDate = updatePeriodDto.startDate ? new Date(updatePeriodDto.startDate) : new Date(period.startDate);
      const endDate = updatePeriodDto.endDate ? new Date(updatePeriodDto.endDate) : new Date(period.endDate);

      if (startDate >= endDate) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.ACCA,
          'Start date must be before end date'
        )
          .withLogger(this.logger)
          .build();

        throw new BadRequestException(errorResponse);
      }

      // Get cycle to validate dates
      const cycle = await this.prisma.academicCycle.findUnique({
        where: { id: period.cycleId }
      });

      if (cycle) {
        const cycleStart = new Date(cycle.startDate);
        const cycleEnd = new Date(cycle.endDate);

        if (startDate < cycleStart || endDate > cycleEnd) {
          const errorResponse = ApiErrorResponseBuilder.create(
            ErrorCode.ACCD,
            'Period dates must be within the cycle dates'
          )
            .withLogger(this.logger)
            .build();

          throw new BadRequestException(errorResponse);
        }

        // Check for overlapping periods (excluding current period) with smart rules for BREAK periods
        const overlappingPeriods = await this.prisma.academicPeriod.findMany({
          where: {
            cycleId: period.cycleId,
            id: { not: id },
            OR: [
              {
                AND: [
                  { startDate: { lte: startDate } },
                  { endDate: { gte: startDate } }
                ]
              },
              {
                AND: [
                  { startDate: { lte: endDate } },
                  { endDate: { gte: endDate } }
                ]
              },
              {
                AND: [
                  { startDate: { gte: startDate } },
                  { endDate: { lte: endDate } }
                ]
              }
            ]
          }
        });

        if (overlappingPeriods.length > 0) {
          // Determine the period type we're checking (use updatePeriodDto if provided, otherwise use existing period type)
          const periodType = updatePeriodDto.periodType || period.periodType;
          const isUpdatingToBreak = periodType === AcademicPeriodType.BREAK;
          
          if (isUpdatingToBreak) {
            // For BREAK periods: filter out periods that BREAK can overlap with
            const allowedOverlapTypes = [
              AcademicPeriodType.INSTRUCTION,
              AcademicPeriodType.EXAM,
              AcademicPeriodType.GRADING,
              AcademicPeriodType.REVIEW
            ];
            
            // Find periods that BREAK cannot overlap with (other BREAKs or non-allowed types)
            const conflictingPeriods = overlappingPeriods.filter(p => {
              // BREAK cannot overlap with another BREAK
              if (p.periodType === AcademicPeriodType.BREAK) {
                return true;
              }
              // BREAK cannot overlap with periods not in the allowed list
              const isAllowedType = allowedOverlapTypes.some(type => type === p.periodType);
              if (!isAllowedType) {
                return true;
              }
              return false;
            });

            if (conflictingPeriods.length > 0) {
              const conflictingNames = conflictingPeriods.map(p => p.name).join(', ');
              const errorResponse = ApiErrorResponseBuilder.create(
                ErrorCode.ACCF,
                `Break period overlaps with incompatible period(s): ${conflictingNames}. Break periods can only overlap with Instruction, Exam, Grading, or Review periods.`
              )
                .withLogger(this.logger)
                .build();

              throw new ConflictException(errorResponse);
            }
            // If we get here, all overlapping periods are allowed (INSTRUCTION, EXAM, GRADING, or REVIEW)
            // Allow the overlap to proceed
          } else {
            // For non-BREAK periods: check if any overlapping period is a BREAK
            const overlappingBreaks = overlappingPeriods.filter(p => p.periodType === AcademicPeriodType.BREAK);
            const overlappingNonBreaks = overlappingPeriods.filter(p => p.periodType !== AcademicPeriodType.BREAK);
            
            // Non-BREAK periods cannot overlap with other non-BREAK periods
            if (overlappingNonBreaks.length > 0) {
              const conflictingNames = overlappingNonBreaks.map(p => p.name).join(', ');
              const errorResponse = ApiErrorResponseBuilder.create(
                ErrorCode.ACCF,
                `Period overlaps with existing period(s): ${conflictingNames}. Please adjust the dates.`
              )
                .withLogger(this.logger)
                .build();

              throw new ConflictException(errorResponse);
            }
            // If only overlapping with BREAK periods, that's allowed (non-BREAK can overlap with BREAK)
          }
        }
      }
    }

    // Convert date strings to ISO DateTime format for Prisma if dates are being updated
    const updateData: any = { ...updatePeriodDto };
    
    if (updatePeriodDto.startDate && typeof updatePeriodDto.startDate === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(updatePeriodDto.startDate)) {
        // Date-only format: convert to DateTime with time component
        updateData.startDate = new Date(updatePeriodDto.startDate + 'T00:00:00.000Z').toISOString();
      }
    }

    if (updatePeriodDto.endDate && typeof updatePeriodDto.endDate === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(updatePeriodDto.endDate)) {
        // Date-only format: convert to DateTime with time component
        // Use end of day to ensure the full day is included
        updateData.endDate = new Date(updatePeriodDto.endDate + 'T23:59:59.999Z').toISOString();
      }
    }

    return this.prisma.academicPeriod.update({
      where: { id },
      data: updateData,
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true
          }
        },
        creator: {
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

  async deletePeriod(id: string) {
    await this.findPeriodById(id);
    return this.prisma.academicPeriod.delete({
      where: { id }
    });
  }

  async updatePeriodStatus(id: string, status: AcademicPeriodStatus) {
    await this.findPeriodById(id);
    return this.prisma.academicPeriod.update({
      where: { id },
      data: { status },
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true
          }
        }
      }
    });
  }
}
