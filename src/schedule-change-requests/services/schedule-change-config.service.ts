import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  ScheduleChangeConfig, 
  ScheduleChangeConfigValidation, 
  RequestType, 
  DEFAULT_SCHEDULE_CHANGE_CONFIG 
} from '../interfaces/schedule-change-config.interface';

@Injectable()
export class ScheduleChangeConfigService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get effective configuration for a specific academic cycle
   * Returns the stored configuration for the cycle, or inherits from parent School Year
   */
  async getEffectiveConfig(cycleId: string): Promise<ScheduleChangeConfig> {
    // Get cycle with its parent information
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: cycleId },
      select: { 
        scheduleChangeConfig: true,
        cycleType: true,
        parentId: true
      }
    });

    if (!cycle) {
      return DEFAULT_SCHEDULE_CHANGE_CONFIG;
    }

    const cycleConfig = cycle.scheduleChangeConfig as unknown as ScheduleChangeConfig;

    // If this cycle has its own config, return it
    if (cycleConfig) {
      return cycleConfig;
    }

    // If this is a School Year, return default config
    if (cycle.cycleType === 'SCHOOL_YEAR') {
      return DEFAULT_SCHEDULE_CHANGE_CONFIG;
    }

    // For semesters and quarters, inherit from parent School Year
    if (cycle.parentId) {
      return this.getEffectiveConfig(cycle.parentId);
    }

    return DEFAULT_SCHEDULE_CHANGE_CONFIG;
  }

  /**
   * Check if a student can make a schedule change request for a specific cycle
   */
  async canStudentRequestChange(
    studentId: string,
    cycleId: string,
    requestType: RequestType
  ): Promise<ScheduleChangeConfigValidation> {
    const config = await this.getEffectiveConfig(cycleId);
    const cycle = await this.getAcademicCycle(cycleId);

    // Check if feature is enabled
    if (!config.enabled) {
      return { 
        canRequest: false, 
        reason: 'Schedule changes are disabled for this cycle' 
      };
    }

    // Check deadline
    const deadline = new Date(cycle.startDate);
    deadline.setDate(deadline.getDate() - config.deadlineDays);

    if (new Date() > deadline && !config.allowChangesAfterDeadline) {
      return { 
        canRequest: false, 
        reason: `Deadline passed. Changes must be requested ${config.deadlineDays} days before cycle starts.`,
        deadline
      };
    }

    // Check request type
    if (!config.allowedRequestTypes.includes(requestType)) {
      return { 
        canRequest: false, 
        reason: `This type of change (${requestType}) is not allowed for this cycle` 
      };
    }

    // Check request limit
    const existingRequests = await this.getStudentRequests(studentId, cycleId);
    const remainingRequests = config.maxRequestsPerStudent - existingRequests.length;

    if (remainingRequests <= 0) {
      return { 
        canRequest: false, 
        reason: `Maximum number of requests (${config.maxRequestsPerStudent}) reached for this cycle` 
      };
    }

    // Check concurrent requests limit
    const pendingRequests = existingRequests.filter(req => 
      req.status === 'PENDING' || req.status === 'IN_REVIEW'
    );

    if (!config.allowConcurrentRequests && pendingRequests.length > 0) {
      return { 
        canRequest: false, 
        reason: 'You have a pending request. Please wait for it to be processed.' 
      };
    }

    if (pendingRequests.length >= config.maxConcurrentRequests) {
      return { 
        canRequest: false, 
        reason: `Maximum concurrent requests (${config.maxConcurrentRequests}) reached` 
      };
    }

    return { 
      canRequest: true, 
      remainingRequests,
      deadline
    };
  }

  /**
   * Check if a request should be auto-approved based on configuration
   */
  async shouldAutoApprove(
    requestData: any,
    cycleId: string
  ): Promise<{ shouldApprove: boolean; reason?: string }> {
    const config = await this.getEffectiveConfig(cycleId);
    const cycle = await this.getAcademicCycle(cycleId);

    // Check if auto-approval is enabled for any conditions
    const conditions = config.autoApproveConditions;
    if (!Object.values(conditions).some(Boolean)) {
      return { shouldApprove: false };
    }

    // Check deadline condition
    if (conditions.withinDeadline) {
      const deadline = new Date(cycle.startDate);
      deadline.setDate(deadline.getDate() - config.deadlineDays);
      
      if (new Date() <= deadline) {
        return { shouldApprove: true, reason: 'Request submitted before deadline' };
      }
    }

    // Check same teacher condition
    if (conditions.sameTeacher && requestData.currentTeacherId === requestData.newTeacherId) {
      return { shouldApprove: true, reason: 'Same teacher assignment' };
    }

    // Check same time slot condition
    if (conditions.sameTimeSlot && requestData.currentTimeBlockId === requestData.newTimeBlockId) {
      return { shouldApprove: true, reason: 'Same time slot' };
    }

    // Check same course condition
    if (conditions.sameCourse && requestData.currentCourseId === requestData.newCourseId) {
      return { shouldApprove: true, reason: 'Same course, different section' };
    }

    // Check low enrollment condition
    if (conditions.lowEnrollment && requestData.targetClassEnrollment < 10) {
      return { shouldApprove: true, reason: 'Target class has low enrollment' };
    }

    return { shouldApprove: false };
  }

  /**
   * Get notification settings for a cycle
   */
  async getNotificationSettings(cycleId: string): Promise<{
    notifyTeachers: boolean;
    notifyParents: boolean;
    notifyCounselors: boolean;
  }> {
    const config = await this.getEffectiveConfig(cycleId);
    
    return {
      notifyTeachers: config.notifyTeachers,
      notifyParents: config.notifyParents,
      notifyCounselors: config.notifyCounselors
    };
  }

  /**
   * Update global schedule change configuration
   */
  async updateGlobalConfig(config: Partial<ScheduleChangeConfig>): Promise<void> {
    await this.prisma.settings.updateMany({
      data: {
        scheduleChangeConfig: config as any
      }
    });
  }

  /**
   * Update cycle-specific schedule change configuration
   */
  async updateCycleConfig(cycleId: string, config: Partial<ScheduleChangeConfig>): Promise<void> {
    await this.prisma.academicCycle.update({
      where: { id: cycleId },
      data: {
        scheduleChangeConfig: config as any
      }
    });
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): ScheduleChangeConfig {
    return { ...DEFAULT_SCHEDULE_CHANGE_CONFIG };
  }

  // Private helper methods

  private async getAcademicCycle(cycleId: string) {
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: cycleId },
      select: { startDate: true, endDate: true, name: true }
    });

    if (!cycle) {
      throw new Error(`Academic cycle with ID ${cycleId} not found`);
    }

    return cycle;
  }

  private async getStudentRequests(studentId: string, cycleId: string) {
    // This would need to be implemented based on your schedule change request model
    // For now, returning empty array as placeholder
    return [];
  }

}
