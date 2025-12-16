import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AcademicSettingsService } from '../settings/academic-settings.service';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { AcademicPeriodType, AcademicPeriodStatus, CycleType } from '@prisma/client';

interface PeriodDefinition {
  periodType: AcademicPeriodType;
  name: string;
  startDate: Date;
  endDate: Date;
  isInstructional?: boolean;
  allowsEnrollment?: boolean;
  allowsGrading?: boolean;
  allowsScheduleChanges?: boolean;
  isBreak?: boolean;
  description?: string;
  sortOrder: number;
}

@Injectable()
export class PeriodGenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicSettingsService: AcademicSettingsService,
  ) {}

  /**
   * Generate and create all periods for a given cycle based on default configuration
   */
  async generatePeriodsForCycle(
    cycleId: string,
    userId: string,
  ): Promise<{ periods: any[]; warnings: string[] }> {
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: cycleId },
      include: {
        parent: true,
        children: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!cycle) {
      throw new NotFoundException(`Academic cycle with ID ${cycleId} not found`);
    }

    const defaultConfig = await this.academicSettingsService.getDefaultPeriodConfiguration();
    
    if (!defaultConfig) {
      return {
        periods: [],
        warnings: ['No default period configuration found. Please configure academic period defaults in settings.'],
      };
    }

    const config = defaultConfig as any;
    const warnings: string[] = [];
    const createdPeriods: any[] = [];

    try {
      if (cycle.cycleType === CycleType.SCHOOL_YEAR) {
        // Generate school year level periods
        const schoolYearPeriods = await this.generateSchoolYearPeriods(
          cycle,
          config,
          userId,
        );
        createdPeriods.push(...schoolYearPeriods.periods);
        warnings.push(...schoolYearPeriods.warnings);
      } else if (cycle.cycleType === CycleType.SEMESTER || cycle.cycleType === CycleType.QUARTER) {
        // Generate semester/quarter level periods
        const semesterQuarterPeriods = await this.generateSemesterQuarterPeriods(
          cycle,
          config,
          userId,
        );
        createdPeriods.push(...semesterQuarterPeriods.periods);
        warnings.push(...semesterQuarterPeriods.warnings);
      }
    } catch (error) {
      warnings.push(`Failed to generate periods: ${error.message}`);
    }

    return {
      periods: createdPeriods,
      warnings,
    };
  }

  /**
   * Generate school year level periods
   */
  private async generateSchoolYearPeriods(
    cycle: any,
    config: any,
    userId: string,
  ): Promise<{ periods: any[]; warnings: string[] }> {
    const periods: any[] = [];
    const warnings: string[] = [];
    const schoolYearConfig = config.schoolYear || {};
    
    const cycleStart = new Date(cycle.startDate);
    const cycleEnd = new Date(cycle.endDate);
    let sortOrder = 1;

    // Track the earliest possible start for the school-wide instruction period
    let latestInstructionStart = new Date(cycleStart);
    // Track closing start so we can end instruction just before it (if configured)
    let closingStartForInstruction: Date | null = null;

    // Preparation Period
    if (schoolYearConfig.preparation) {
      const prepConfig = schoolYearConfig.preparation;
      const prepStart = new Date(cycleStart);
      prepStart.setDate(prepStart.getDate() - prepConfig.daysBeforeStart);
      const prepEnd = new Date(cycleStart);
      prepEnd.setDate(prepEnd.getDate() - 1);

      if (prepStart < prepEnd && prepEnd < cycleStart) {
        try {
          const period = await this.createPeriod({
            cycleId: cycle.id,
            // Use full cycle name to avoid undefined parts when name has a single token
            name: `${cycle.name} Preparation`,
            periodType: AcademicPeriodType.PREPARATION,
            startDate: prepStart.toISOString().split('T')[0],
            endDate: prepEnd.toISOString().split('T')[0],
            description: 'Preparation period before school year starts',
            sortOrder: sortOrder++,
            createdBy: userId,
          });
          periods.push(period);
        } catch (error) {
          warnings.push(`Failed to create Preparation period: ${error.message}`);
        }
      }
    }

    // Registration Period
    if (schoolYearConfig.registration) {
      const regConfig = schoolYearConfig.registration;
      let regStart: Date;
      let regEnd: Date;

      if (regConfig.timing === 'BEFORE_INSTRUCTION') {
        // Find first semester's instruction period or use cycle start
        const firstChild = cycle.children?.[0];
        if (firstChild) {
          regStart = new Date(cycleStart);
          regEnd = new Date(firstChild.startDate);
          regEnd.setDate(regEnd.getDate() - 1);
        } else {
          regStart = new Date(cycleStart);
          regEnd = new Date(regStart);
          regEnd.setDate(regEnd.getDate() + regConfig.duration - 1);
        }
      } else {
        // CONCURRENT with first semester
        regStart = new Date(cycleStart);
        regEnd = new Date(regStart);
        regEnd.setDate(regEnd.getDate() + regConfig.duration - 1);
      }

      if (regStart < regEnd && regEnd <= cycleEnd) {
        try {
          const period = await this.createPeriod({
            cycleId: cycle.id,
            name: `${cycle.name} Registration`,
            periodType: AcademicPeriodType.REGISTRATION,
            startDate: regStart.toISOString().split('T')[0],
            endDate: regEnd.toISOString().split('T')[0],
            allowsEnrollment: true,
            description: 'Student registration and enrollment period',
            sortOrder: sortOrder++,
            createdBy: userId,
          });
          periods.push(period);
        } catch (error) {
          warnings.push(`Failed to create Registration period: ${error.message}`);
        }

        // Instruction should start after registration ends
        const afterRegistration = new Date(regEnd);
        afterRegistration.setDate(afterRegistration.getDate() + 1);
        if (afterRegistration > latestInstructionStart) {
          latestInstructionStart = afterRegistration;
        }
      }
    }

    // Orientation Period
    if (schoolYearConfig.orientation) {
      const orientationConfig = schoolYearConfig.orientation;
      const orientationStart = new Date(cycleStart);
      const orientationEnd = new Date(cycleStart);
      orientationEnd.setDate(orientationEnd.getDate() + orientationConfig.duration - 1);

      if (orientationStart <= orientationEnd && orientationEnd <= cycleEnd) {
        try {
          const period = await this.createPeriod({
            cycleId: cycle.id,
            name: `${cycle.name} Orientation`,
            periodType: AcademicPeriodType.ORIENTATION,
            startDate: orientationStart.toISOString().split('T')[0],
            endDate: orientationEnd.toISOString().split('T')[0],
            description: 'Student orientation period',
            sortOrder: sortOrder++,
            createdBy: userId,
          });
          periods.push(period);
        } catch (error) {
          warnings.push(`Failed to create Orientation period: ${error.message}`);
        }

        // Instruction should start after orientation ends
        const afterOrientation = new Date(orientationEnd);
        afterOrientation.setDate(afterOrientation.getDate() + 1);
        if (afterOrientation > latestInstructionStart) {
          latestInstructionStart = afterOrientation;
        }
      }
    }

    // Closing Period
    if (schoolYearConfig.closing) {
      const closingConfig = schoolYearConfig.closing;
      const closingStart = new Date(cycleEnd);
      closingStart.setDate(closingStart.getDate() - closingConfig.daysBeforeEnd);
      const closingEnd = new Date(cycleEnd);

      // Track for instruction end calculation
      closingStartForInstruction = new Date(closingStart);

      if (closingStart < closingEnd && closingStart >= cycleStart) {
        try {
          const period = await this.createPeriod({
            cycleId: cycle.id,
            name: `${cycle.name} Closing`,
            periodType: AcademicPeriodType.TRANSITION,
            startDate: closingStart.toISOString().split('T')[0],
            endDate: closingEnd.toISOString().split('T')[0],
            description: 'Closing and transition period',
            sortOrder: sortOrder++,
            createdBy: userId,
          });
          periods.push(period);
        } catch (error) {
          warnings.push(`Failed to create Closing period: ${error.message}`);
        }
      }
    }

    // Instruction Period (School Year level)
    // Starts after the latest of registration/orientation (or school year start),
    // and ends just before the closing period starts (if configured), otherwise at cycle end.
    const instructionStart = latestInstructionStart;
    let instructionEnd = new Date(cycleEnd);

    if (closingStartForInstruction) {
      instructionEnd = new Date(closingStartForInstruction);
      instructionEnd.setDate(instructionEnd.getDate() - 1);
    }

    if (instructionStart <= instructionEnd) {
      try {
        const period = await this.createPeriod({
          cycleId: cycle.id,
          name: `${cycle.name} Instruction`,
          periodType: AcademicPeriodType.INSTRUCTION,
          startDate: instructionStart.toISOString().split('T')[0],
          endDate: instructionEnd.toISOString().split('T')[0],
          description: 'Primary instruction period for the school year',
          sortOrder: sortOrder++,
          createdBy: userId,
        });
        periods.push(period);
      } catch (error) {
        warnings.push(`Failed to create Instruction period: ${error.message}`);
      }
    }

    return { periods, warnings };
  }

  /**
   * Generate semester/quarter level periods
   */
  private async generateSemesterQuarterPeriods(
    cycle: any,
    config: any,
    userId: string,
  ): Promise<{ periods: any[]; warnings: string[] }> {
    const periods: any[] = [];
    const warnings: string[] = [];
    const semesterQuarterConfig = config.semesterQuarter || {};
    
    const cycleStart = new Date(cycle.startDate);
    const cycleEnd = new Date(cycle.endDate);
    let sortOrder = 1;

    // Calculate exam and grading durations
    const examDuration = semesterQuarterConfig.exam?.duration || 5;
    const gradingDuration = semesterQuarterConfig.grading?.duration || 5;
    const totalExamGradingDays = examDuration + gradingDuration;

    // Instruction Period
    if (semesterQuarterConfig.instruction) {
      const instructionConfig = semesterQuarterConfig.instruction;
      const instructionStart = new Date(cycleStart);
      const instructionEnd = new Date(cycleEnd);
      instructionEnd.setDate(instructionEnd.getDate() - totalExamGradingDays);

      if (instructionStart < instructionEnd) {
        try {
          // Generate period name from template or cycle name
          const periodName = instructionConfig.nameTemplate
            ? instructionConfig.nameTemplate.replace('{Cycle Name}', cycle.name)
            : `${cycle.name} Instruction`;

          const period = await this.createPeriod({
            cycleId: cycle.id,
            name: periodName,
            periodType: AcademicPeriodType.INSTRUCTION,
            startDate: instructionStart.toISOString().split('T')[0],
            endDate: instructionEnd.toISOString().split('T')[0],
            isInstructional: true,
            allowsScheduleChanges: instructionConfig.allowsScheduleChanges !== undefined ? instructionConfig.allowsScheduleChanges : true, // Default to true for instruction periods
            description: 'Instructional period',
            sortOrder: sortOrder++,
            createdBy: userId,
          });
          periods.push(period);
        } catch (error) {
          warnings.push(`Failed to create Instruction period: ${error.message}`);
        }
      }
    }

    // Exam Period
    if (semesterQuarterConfig.exam) {
      const examStart = new Date(cycleEnd);
      examStart.setDate(examStart.getDate() - totalExamGradingDays);
      const examEnd = new Date(cycleEnd);
      examEnd.setDate(examEnd.getDate() - gradingDuration);

      if (examStart < examEnd && examEnd <= cycleEnd) {
        try {
          const period = await this.createPeriod({
            cycleId: cycle.id,
            name: `${cycle.name} Exam Period`,
            periodType: AcademicPeriodType.EXAM,
            startDate: examStart.toISOString().split('T')[0],
            endDate: examEnd.toISOString().split('T')[0],
            description: 'Examination period',
            sortOrder: sortOrder++,
            createdBy: userId,
          });
          periods.push(period);
        } catch (error) {
          warnings.push(`Failed to create Exam period: ${error.message}`);
        }
      }
    }

    // Grading Period
    if (semesterQuarterConfig.grading) {
      const gradingStart = new Date(cycleEnd);
      gradingStart.setDate(gradingStart.getDate() - gradingDuration);
      const gradingEnd = new Date(cycleEnd);

      if (gradingStart < gradingEnd && gradingEnd <= cycleEnd) {
        try {
          const period = await this.createPeriod({
            cycleId: cycle.id,
            name: `${cycle.name} Grading Period`,
            periodType: AcademicPeriodType.GRADING,
            startDate: gradingStart.toISOString().split('T')[0],
            endDate: gradingEnd.toISOString().split('T')[0],
            allowsGrading: true,
            description: 'Grade submission period',
            sortOrder: sortOrder++,
            createdBy: userId,
          });
          periods.push(period);
        } catch (error) {
          warnings.push(`Failed to create Grading period: ${error.message}`);
        }
      }
    }

    // Break Periods (if enabled and applicable)
    if (semesterQuarterConfig.breaks) {
      const breaks = semesterQuarterConfig.breaks;
      
      // Thanksgiving Break (Fall semester, mid-semester)
      if (breaks.thanksgiving?.enabled) {
        const thanksgivingDate = this.getThanksgivingDate(cycleStart.getFullYear());
        const thanksgivingStart = new Date(thanksgivingDate);
        thanksgivingStart.setDate(thanksgivingStart.getDate() - 1);
        const thanksgivingEnd = new Date(thanksgivingDate);
        thanksgivingEnd.setDate(thanksgivingEnd.getDate() + breaks.thanksgiving.duration - 2);

        if (
          thanksgivingStart >= cycleStart &&
          thanksgivingEnd <= cycleEnd &&
          cycleStart.getMonth() >= 7 // August or later (fall semester)
        ) {
          try {
            const period = await this.createPeriod({
              cycleId: cycle.id,
              name: 'Thanksgiving Break',
              periodType: AcademicPeriodType.BREAK,
              startDate: thanksgivingStart.toISOString().split('T')[0],
              endDate: thanksgivingEnd.toISOString().split('T')[0],
              isBreak: true,
              description: 'Thanksgiving break',
              sortOrder: sortOrder++,
              createdBy: userId,
            });
            periods.push(period);
          } catch (error) {
            warnings.push(`Failed to create Thanksgiving Break: ${error.message}`);
          }
        }
      }

      // Spring Break (Spring semester, mid-semester)
      if (breaks.spring?.enabled) {
        // Approximate spring break as mid-spring semester (March 15)
        const springBreakStart = new Date(cycleStart.getFullYear(), 2, 15); // March 15
        const springBreakEnd = new Date(springBreakStart);
        springBreakEnd.setDate(springBreakEnd.getDate() + breaks.spring.duration - 1);

        if (
          springBreakStart >= cycleStart &&
          springBreakEnd <= cycleEnd &&
          cycleStart.getMonth() < 6 // Before June (spring semester)
        ) {
          try {
            const period = await this.createPeriod({
              cycleId: cycle.id,
              name: 'Spring Break',
              periodType: AcademicPeriodType.BREAK,
              startDate: springBreakStart.toISOString().split('T')[0],
              endDate: springBreakEnd.toISOString().split('T')[0],
              isBreak: true,
              description: 'Spring break',
              sortOrder: sortOrder++,
              createdBy: userId,
            });
            periods.push(period);
          } catch (error) {
            warnings.push(`Failed to create Spring Break: ${error.message}`);
          }
        }
      }
    }

    return { periods, warnings };
  }

  /**
   * Helper method to create a period (handles validation and creation)
   */
  private async createPeriod(data: {
    cycleId: string;
    name: string;
    periodType: AcademicPeriodType;
    startDate: string;
    endDate: string;
    isInstructional?: boolean;
    allowsEnrollment?: boolean;
    allowsGrading?: boolean;
    allowsScheduleChanges?: boolean;
    isBreak?: boolean;
    description?: string;
    sortOrder: number;
    createdBy: string;
  }) {
    // Check if period already exists (by name and cycle)
    const existing = await this.prisma.academicPeriod.findFirst({
      where: {
        cycleId: data.cycleId,
        name: data.name,
      },
    });

    if (existing) {
      return existing; // Return existing period instead of creating duplicate
    }

    return this.prisma.academicPeriod.create({
      data: {
        cycleId: data.cycleId,
        name: data.name,
        periodType: data.periodType,
        status: AcademicPeriodStatus.PLANNED,
        startDate: new Date(data.startDate + 'T00:00:00.000Z'),
        endDate: new Date(data.endDate + 'T23:59:59.999Z'),
        isInstructional: data.isInstructional || false,
        allowsEnrollment: data.allowsEnrollment || false,
        allowsGrading: data.allowsGrading || false,
        allowsScheduleChanges: data.allowsScheduleChanges || false,
        isBreak: data.isBreak || false,
        description: data.description || null,
        sortOrder: data.sortOrder,
        createdBy: data.createdBy,
      },
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true,
          },
        },
      },
    });
  }

  /**
   * Helper to get Thanksgiving date (4th Thursday of November)
   */
  private getThanksgivingDate(year: number): Date {
    const november = new Date(year, 10, 1); // November 1
    const dayOfWeek = november.getDay();
    const daysToAdd = (4 - dayOfWeek + 7) % 7 + 21; // 4th Thursday
    return new Date(year, 10, 1 + daysToAdd);
  }
}

