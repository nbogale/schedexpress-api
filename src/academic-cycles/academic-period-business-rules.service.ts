import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AcademicPeriodBusinessRules,
  EnrollmentRuleConfig,
  ScheduleChangeRuleConfig,
  GradingRuleConfig,
  InstructionRuleConfig,
  BreakPeriodRuleConfig,
  ValidationContext,
  ValidationResult,
  EnrollmentValidationResult,
  ScheduleChangeValidationResult,
  GradingValidationResult,
  DEFAULT_BUSINESS_RULES,
  DEFAULT_ENROLLMENT_RULES,
  DEFAULT_SCHEDULE_CHANGE_RULES,
  DEFAULT_GRADING_RULES,
  DEFAULT_INSTRUCTION_RULES,
  DEFAULT_BREAK_PERIOD_RULES,
} from './interfaces/academic-period-business-rules.interface';
import { UpdateAcademicPeriodBusinessRulesDto } from './dto/academic-period-business-rules.dto';
import { AcademicPeriodType, AcademicPeriodStatus } from '@prisma/client';
import { RequestType } from '../schedule-change-requests/interfaces/schedule-change-config.interface';
import { ErrorCode } from '../common/error-codes';

@Injectable()
export class AcademicPeriodBusinessRulesService {
  private readonly logger = new Logger(AcademicPeriodBusinessRulesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get business rules for the school
   * Returns rules from AcademicSettings, or default rules if not configured
   */
  async getBusinessRules(): Promise<AcademicPeriodBusinessRules> {
    try {
      // Get settings first
      const settings = await this.prisma.settings.findFirst();
      if (!settings) {
        this.logger.warn('Settings not found, returning default business rules');
        return DEFAULT_BUSINESS_RULES;
      }

      // Get academic settings
      const academicSettings = await this.prisma.academicSettings.findUnique({
        where: { settingsId: settings.id },
      });

      if (!academicSettings || !academicSettings.academicPeriodRules) {
        this.logger.debug('Business rules not configured, returning defaults');
        return DEFAULT_BUSINESS_RULES;
      }

      // Merge configured rules with defaults to ensure all fields are present
      const configuredRules = academicSettings.academicPeriodRules as unknown as AcademicPeriodBusinessRules;
      return this.mergeWithDefaults(configuredRules);
    } catch (error) {
      this.logger.error('Error fetching business rules', error);
      return DEFAULT_BUSINESS_RULES;
    }
  }

  /**
   * Get specific rule category
   */
  async getRuleCategory(
    category: 'enrollment' | 'scheduleChange' | 'grading' | 'instruction' | 'breakPeriod'
  ): Promise<EnrollmentRuleConfig | ScheduleChangeRuleConfig | GradingRuleConfig | InstructionRuleConfig | BreakPeriodRuleConfig | null> {
    const rules = await this.getBusinessRules();
    
    switch (category) {
      case 'enrollment':
        return rules.enrollment || DEFAULT_ENROLLMENT_RULES;
      case 'scheduleChange':
        return rules.scheduleChange || DEFAULT_SCHEDULE_CHANGE_RULES;
      case 'grading':
        return rules.grading || DEFAULT_GRADING_RULES;
      case 'instruction':
        return rules.instruction || DEFAULT_INSTRUCTION_RULES;
      case 'breakPeriod':
        return rules.breakPeriod || DEFAULT_BREAK_PERIOD_RULES;
      default:
        return null;
    }
  }

  /**
   * Update business rules
   */
  async updateBusinessRules(
    updateDto: UpdateAcademicPeriodBusinessRulesDto
  ): Promise<AcademicPeriodBusinessRules> {
    try {
      // Get current settings
      let settings = await this.prisma.settings.findFirst();
      if (!settings) {
        throw new NotFoundException('Settings not found. Please initialize settings first.');
      }

      // Get or create academic settings
      let academicSettings = await this.prisma.academicSettings.findUnique({
        where: { settingsId: settings.id },
      });

      const currentRules = academicSettings?.academicPeriodRules 
        ? (academicSettings.academicPeriodRules as unknown as AcademicPeriodBusinessRules)
        : DEFAULT_BUSINESS_RULES;

      // Merge updates with current rules
      const updatedRules: AcademicPeriodBusinessRules = {
        enrollment: updateDto.enrollment 
          ? { ...currentRules.enrollment, ...updateDto.enrollment } as EnrollmentRuleConfig
          : currentRules.enrollment,
        scheduleChange: updateDto.scheduleChange
          ? { ...currentRules.scheduleChange, ...updateDto.scheduleChange } as ScheduleChangeRuleConfig
          : currentRules.scheduleChange,
        grading: updateDto.grading
          ? { ...currentRules.grading, ...updateDto.grading } as GradingRuleConfig
          : currentRules.grading,
        instruction: updateDto.instruction
          ? { ...currentRules.instruction, ...updateDto.instruction } as InstructionRuleConfig
          : currentRules.instruction,
        breakPeriod: updateDto.breakPeriod
          ? { ...currentRules.breakPeriod, ...updateDto.breakPeriod } as BreakPeriodRuleConfig
          : currentRules.breakPeriod,
      };

      // Ensure defaults are merged for each rule
      const mergedRules = this.mergeWithDefaults(updatedRules);

      // Create or update academic settings
      if (!academicSettings) {
        academicSettings = await this.prisma.academicSettings.create({
          data: {
            settingsId: settings.id,
            academicPeriodRules: mergedRules as any,
          },
        });
      } else {
        academicSettings = await this.prisma.academicSettings.update({
          where: { id: academicSettings.id },
          data: {
            academicPeriodRules: mergedRules as any,
          },
        });
      }

      return mergedRules;
    } catch (error) {
      console.log('Error updating business rules', JSON.stringify(error));
      this.logger.error('Error updating business rules', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error updating business rules:', error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update business rules'
      );
    }
  }

  /**
   * Reset business rules to defaults
   */
  async resetToDefaults(): Promise<AcademicPeriodBusinessRules> {
    const updateDto: UpdateAcademicPeriodBusinessRulesDto = {
      enrollment: DEFAULT_ENROLLMENT_RULES,
      scheduleChange: DEFAULT_SCHEDULE_CHANGE_RULES,
      grading: DEFAULT_GRADING_RULES,
      instruction: DEFAULT_INSTRUCTION_RULES,
      breakPeriod: DEFAULT_BREAK_PERIOD_RULES,
    };
    return this.updateBusinessRules(updateDto);
  }

  /**
   * Validate action against business rules
   */
  async validateAction(context: ValidationContext): Promise<ValidationResult> {
    const rules = await this.getBusinessRules();

    switch (context.actionType) {
      case 'ENROLLMENT':
        return this.validateEnrollment(context, rules.enrollment || DEFAULT_ENROLLMENT_RULES);
      case 'SCHEDULE_CHANGE':
        return this.validateScheduleChange(context, rules.scheduleChange || DEFAULT_SCHEDULE_CHANGE_RULES);
      case 'GRADING':
        return this.validateGrading(context, rules.grading || DEFAULT_GRADING_RULES);
      case 'INSTRUCTION':
        return this.validateInstruction(context, rules.instruction || DEFAULT_INSTRUCTION_RULES);
      default:
        return {
          allowed: false,
          reason: 'Unknown action type',
        };
    }
  }

  /**
   * Check if enrollment is allowed
   */
  async canEnroll(
    studentId: string,
    cycleId: string,
    periodId?: string
  ): Promise<EnrollmentValidationResult> {
    const rules = await this.getRuleCategory('enrollment') as EnrollmentRuleConfig;
    if (!rules || !rules.isActive) {
      return {
        allowed: true, // If rules are disabled, allow enrollment
        metadata: { reason: 'Enrollment rules not active' },
      };
    }

    // Get current period
    const currentPeriod = periodId
      ? await this.prisma.academicPeriod.findUnique({ where: { id: periodId } })
      : await this.getCurrentPeriod(cycleId);

    if (rules.periodBasedEnrollment.requireActivePeriod && !currentPeriod) {
      return {
        allowed: false,
        reason: 'No active period found. Enrollment is only allowed during active periods.',
        errorCode: ErrorCode.ACRE1,
      };
    }

    if (currentPeriod) {
      // Check if period type is allowed
      if (!rules.periodBasedEnrollment.allowedPeriodTypes.includes(currentPeriod.periodType)) {
        return {
          allowed: false,
          reason: `Enrollment is not allowed during ${currentPeriod.periodType} periods.`,
          errorCode: ErrorCode.ACRE2,
          currentPeriod: {
            id: currentPeriod.id,
            name: currentPeriod.name,
            periodType: currentPeriod.periodType,
            allowsEnrollment: currentPeriod.allowsEnrollment,
          },
        };
      }

      // Check period capability
      if (!currentPeriod.allowsEnrollment) {
        return {
          allowed: false,
          reason: `Enrollment is not allowed during the current ${currentPeriod.name} period.`,
          errorCode: ErrorCode.ACRE3,
          currentPeriod: {
            id: currentPeriod.id,
            name: currentPeriod.name,
            periodType: currentPeriod.periodType,
            allowsEnrollment: currentPeriod.allowsEnrollment,
          },
        };
      }
    }

    // Check deadlines if configured
    const deadline = await this.calculateEnrollmentDeadline(cycleId, rules);
    if (deadline && new Date() > deadline && !rules.deadlines.lateEnrollmentAllowed) {
      return {
        allowed: false,
        reason: 'Enrollment deadline has passed.',
        errorCode: ErrorCode.ACRE4,
        deadline,
      };
    }

    if (deadline && new Date() > deadline && rules.deadlines.lateEnrollmentAllowed) {
      return {
        allowed: true,
        requiresApproval: rules.deadlines.lateEnrollmentRequiresApproval,
        reason: rules.deadlines.lateEnrollmentRequiresApproval
          ? 'Late enrollment requires approval.'
          : undefined,
        errorCode: rules.deadlines.lateEnrollmentRequiresApproval ? ErrorCode.ACRE5 : undefined,
        deadline,
        metadata: { isLateEnrollment: true },
      };
    }

    return {
      allowed: true,
      currentPeriod: currentPeriod ? {
        id: currentPeriod.id,
        name: currentPeriod.name,
        periodType: currentPeriod.periodType,
        allowsEnrollment: currentPeriod.allowsEnrollment,
      } : undefined,
      deadline,
    };
  }

  /**
   * Check if schedule change is allowed
   */
  async canRequestScheduleChange(
    studentId: string,
    cycleId: string,
    requestType: RequestType,
    periodId?: string
  ): Promise<ScheduleChangeValidationResult> {
    const rules = await this.getRuleCategory('scheduleChange') as ScheduleChangeRuleConfig;
    if (!rules || !rules.isActive) {
      return {
        allowed: true,
        metadata: { reason: 'Schedule change rules not active' },
      };
    }

    // Check if request type is allowed
    if (!rules.requestTypes.allowedRequestTypes.includes(requestType)) {
      return {
        allowed: false,
        reason: `Schedule change type ${requestType} is not allowed.`,
        errorCode: ErrorCode.ACRS5,
      };
    }

    // Get current period
    const currentPeriod = periodId
      ? await this.prisma.academicPeriod.findUnique({ where: { id: periodId } })
      : await this.getCurrentPeriod(cycleId);

    if (rules.periodBasedChanges.requireActivePeriod && !currentPeriod) {
      return {
        allowed: false,
        reason: 'No active period found. Schedule changes are only allowed during active periods.',
        errorCode: ErrorCode.ACRS1,
      };
    }

    if (currentPeriod) {
      // Check if period type is allowed
      if (!rules.periodBasedChanges.allowedPeriodTypes.includes(currentPeriod.periodType)) {
        return {
          allowed: false,
          reason: `Schedule changes are not allowed during ${currentPeriod.periodType} periods.`,
          errorCode: ErrorCode.ACRS2,
          currentPeriod: {
            id: currentPeriod.id,
            name: currentPeriod.name,
            periodType: currentPeriod.periodType,
            allowsScheduleChanges: currentPeriod.allowsScheduleChanges,
          },
        };
      }

      // Check period capability
      if (!currentPeriod.allowsScheduleChanges) {
        return {
          allowed: false,
          reason: `Schedule changes are not allowed during the current ${currentPeriod.name} period.`,
          errorCode: ErrorCode.ACRS3,
          currentPeriod: {
            id: currentPeriod.id,
            name: currentPeriod.name,
            periodType: currentPeriod.periodType,
            allowsScheduleChanges: currentPeriod.allowsScheduleChanges,
          },
        };
      }

      // Check period-specific restrictions
      const periodRestrictions = rules.requestTypes.restrictionsByPeriodType?.[currentPeriod.periodType];
      if (periodRestrictions && !periodRestrictions.includes(requestType)) {
        return {
          allowed: false,
          reason: `Schedule change type ${requestType} is not allowed during ${currentPeriod.periodType} periods.`,
          errorCode: ErrorCode.ACRS6,
          currentPeriod: {
            id: currentPeriod.id,
            name: currentPeriod.name,
            periodType: currentPeriod.periodType,
            allowsScheduleChanges: currentPeriod.allowsScheduleChanges,
          },
        };
      }
    }

    // TODO: Check request limits (maxRequestsPerCycle, maxConcurrentRequests)
    // This requires querying existing requests

    return {
      allowed: true,
      currentPeriod: currentPeriod ? {
        id: currentPeriod.id,
        name: currentPeriod.name,
        periodType: currentPeriod.periodType,
        allowsScheduleChanges: currentPeriod.allowsScheduleChanges,
      } : undefined,
      allowedRequestTypes: rules.requestTypes.allowedRequestTypes,
    };
  }

  /**
   * Check if grading is allowed
   */
  async canSubmitGrades(
    teacherId: string,
    courseSectionId: string,
    periodId?: string
  ): Promise<GradingValidationResult> {
    const rules = await this.getRuleCategory('grading') as GradingRuleConfig;
    if (!rules || !rules.isActive) {
      return {
        allowed: true,
        metadata: { reason: 'Grading rules not active' },
      };
    }

    // Get course section to find cycle
    const courseSection = await this.prisma.courseSection.findUnique({
      where: { id: courseSectionId },
      select: { academicCycleId: true },
    });

    if (!courseSection) {
      return {
        allowed: false,
        reason: 'Course section not found.',
        errorCode: ErrorCode.CSSN, // Course section not found
      };
    }

    const cycleId = courseSection.academicCycleId;
    const currentPeriod = periodId
      ? await this.prisma.academicPeriod.findUnique({ where: { id: periodId } })
      : await this.getCurrentPeriod(cycleId);

    if (rules.periodBasedGrading.requireActivePeriod && !currentPeriod) {
      return {
        allowed: false,
        reason: 'No active period found. Grading is only allowed during active periods.',
        errorCode: ErrorCode.ACRG1,
      };
    }

    if (currentPeriod) {
      // Check if period type is allowed
      if (!rules.periodBasedGrading.allowedPeriodTypes.includes(currentPeriod.periodType)) {
        return {
          allowed: false,
          reason: `Grading is not allowed during ${currentPeriod.periodType} periods.`,
          errorCode: ErrorCode.ACRG2,
          currentPeriod: {
            id: currentPeriod.id,
            name: currentPeriod.name,
            periodType: currentPeriod.periodType,
            allowsGrading: currentPeriod.allowsGrading,
          },
        };
      }

      // Check period capability
      if (!currentPeriod.allowsGrading) {
        return {
          allowed: false,
          reason: `Grading is not allowed during the current ${currentPeriod.name} period.`,
          errorCode: ErrorCode.ACRG3,
          currentPeriod: {
            id: currentPeriod.id,
            name: currentPeriod.name,
            periodType: currentPeriod.periodType,
            allowsGrading: currentPeriod.allowsGrading,
          },
        };
      }
    }

    // TODO: Check deadlines and early/late grading rules

    return {
      allowed: true,
      currentPeriod: currentPeriod ? {
        id: currentPeriod.id,
        name: currentPeriod.name,
        periodType: currentPeriod.periodType,
        allowsGrading: currentPeriod.allowsGrading,
      } : undefined,
    };
  }

  // Private helper methods

  /**
   * Merge configured rules with defaults to ensure all fields are present
   */
  private mergeWithDefaults(
    configured: AcademicPeriodBusinessRules
  ): AcademicPeriodBusinessRules {
    return {
      enrollment: configured.enrollment 
        ? { ...DEFAULT_ENROLLMENT_RULES, ...configured.enrollment }
        : DEFAULT_ENROLLMENT_RULES,
      scheduleChange: configured.scheduleChange
        ? { ...DEFAULT_SCHEDULE_CHANGE_RULES, ...configured.scheduleChange }
        : DEFAULT_SCHEDULE_CHANGE_RULES,
      grading: configured.grading
        ? { ...DEFAULT_GRADING_RULES, ...configured.grading }
        : DEFAULT_GRADING_RULES,
      instruction: configured.instruction
        ? { ...DEFAULT_INSTRUCTION_RULES, ...configured.instruction }
        : DEFAULT_INSTRUCTION_RULES,
      breakPeriod: configured.breakPeriod
        ? { ...DEFAULT_BREAK_PERIOD_RULES, ...configured.breakPeriod }
        : DEFAULT_BREAK_PERIOD_RULES,
    };
  }

  /**
   * Get current active period for a cycle
   */
  /**
   * Get the current active period for a cycle
   * Checks both ACTIVE status periods and PLANNED periods that should be active based on dates
   * Also searches child cycles (semesters, quarters) since periods are often created at that level
   * This handles cases where the scheduler hasn't updated the status yet
   */
  private async getCurrentPeriod(cycleId: string) {
    const now = new Date();
    
    // Get the cycle and its children (semesters, quarters)
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: cycleId },
      include: {
        children: {
          select: { id: true },
        },
      },
    });

    if (!cycle) {
      this.logger.warn(`Cycle ${cycleId} not found`);
      return null;
    }

    // Collect all cycle IDs to search: the main cycle and all its children
    const cycleIdsToSearch = [cycleId, ...cycle.children.map(c => c.id)];

    // First, try to find a period with ACTIVE status that matches the date range
    // Search in the main cycle and all child cycles
    let period = await this.prisma.academicPeriod.findFirst({
      where: {
        cycleId: { in: cycleIdsToSearch },
        status: AcademicPeriodStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: 'desc' },
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

    // If no ACTIVE period found, check for PLANNED periods that should be active based on dates
    // This handles cases where the scheduler hasn't run yet or periods haven't been updated
    // The scheduler runs at 2 AM, 3 AM, 4 AM, and 10 minutes after startup, so periods
    // might still be PLANNED even if they should be ACTIVE
    if (!period) {
      period = await this.prisma.academicPeriod.findFirst({
        where: {
          cycleId: { in: cycleIdsToSearch },
          status: AcademicPeriodStatus.PLANNED,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { startDate: 'desc' },
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
      
      // Log if we found a PLANNED period that should be ACTIVE (for debugging)
      if (period) {
        this.logger.warn(
          `Found PLANNED period "${period.name}" (${period.cycle.name}) that should be ACTIVE (scheduler may not have run yet). ` +
          `Period dates: ${period.startDate.toISOString()} to ${period.endDate.toISOString()}`
        );
      }
    }

    return period;
  }

  /**
   * Calculate enrollment deadline based on rules
   */
  private async calculateEnrollmentDeadline(
    cycleId: string,
    rules: EnrollmentRuleConfig
  ): Promise<Date | null> {
    if (!rules.deadlines.deadlineType) {
      return null;
    }

    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) {
      return null;
    }

    const cycleStart = new Date(cycle.startDate);
    const cycleEnd = new Date(cycle.endDate);

    switch (rules.deadlines.deadlineType) {
      case 'PERIOD_END':
        // Find the enrollment period end
        const enrollmentPeriod = await this.prisma.academicPeriod.findFirst({
          where: {
            cycleId,
            periodType: AcademicPeriodType.REGISTRATION,
            allowsEnrollment: true,
          },
          orderBy: { endDate: 'desc' },
        });
        return enrollmentPeriod ? new Date(enrollmentPeriod.endDate) : null;

      case 'DAYS_AFTER_START':
        const deadline = new Date(cycleStart);
        deadline.setDate(deadline.getDate() + (rules.deadlines.deadlineDays || 0));
        return deadline;

      case 'FIXED_DATE':
        // Would need a fixed date stored somewhere - not implemented yet
        return null;

      default:
        return null;
    }
  }

  /**
   * Validate enrollment action
   */
  private async validateEnrollment(
    context: ValidationContext,
    rules: EnrollmentRuleConfig
  ): Promise<ValidationResult> {
    if (!rules.isActive) {
      return { allowed: true };
    }

    // Implementation details for enrollment validation
    return {
      allowed: true,
      metadata: { validated: true },
    };
  }

  /**
   * Validate schedule change action
   */
  private async validateScheduleChange(
    context: ValidationContext,
    rules: ScheduleChangeRuleConfig
  ): Promise<ValidationResult> {
    if (!rules.isActive) {
      return { allowed: true };
    }

    // Implementation details for schedule change validation
    return {
      allowed: true,
      metadata: { validated: true },
    };
  }

  /**
   * Validate grading action
   */
  private async validateGrading(
    context: ValidationContext,
    rules: GradingRuleConfig
  ): Promise<ValidationResult> {
    if (!rules.isActive) {
      return { allowed: true };
    }

    // Implementation details for grading validation
    return {
      allowed: true,
      metadata: { validated: true },
    };
  }

  /**
   * Validate instruction action
   */
  private async validateInstruction(
    context: ValidationContext,
    rules: InstructionRuleConfig
  ): Promise<ValidationResult> {
    if (!rules.isActive) {
      return { allowed: true };
    }

    // Implementation details for instruction validation
    return {
      allowed: true,
      metadata: { validated: true },
    };
  }
}

