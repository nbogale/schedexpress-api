import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  formatTimeWithAMPM, 
  parseTimeString, 
  getTimeRangeDisplay,
  isValidTimeFormat 
} from '../common/time-utils';
import { InstitutionConfigService } from '../settings/institution-config.service';
import { ScheduleType } from '../settings/dto/update-settings.dto';
import { ApiErrorResponseBuilder } from '../common/api-error-builder';
import { ErrorCode } from '../common/error-codes';

@Injectable()
export class TimeBlocksService {
  constructor(
    private prisma: PrismaService,
    private readonly institutionConfigService: InstitutionConfigService,
  ) {}

  private normalizeRotationDay(rotationDay?: string | null) {
    if (!rotationDay) return null;
    return rotationDay.trim().toUpperCase();
  }

  private async validateTimeBlockAgainstSettings(
    startTime: Date,
    endTime: Date,
    rotationDay?: string | null,
    excludeTimeBlockId?: string,
  ) {
    const scheduleConfig = await this.institutionConfigService.getScheduleConfiguration();
    const durationInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    const normalizedRotationDay = this.normalizeRotationDay(rotationDay);

    if (durationInMinutes < scheduleConfig.minBlockDuration || durationInMinutes > scheduleConfig.maxBlockDuration) {
      throw new Error(
        `Time block duration must be between ${scheduleConfig.minBlockDuration} and ${scheduleConfig.maxBlockDuration} minutes`,
      );
    }

    if (!scheduleConfig.allowOverlappingBlocks) {
      const overlappingBlocks = await this.prisma.timeBlock.findMany({
        where: {
          isActive: true,
          ...(excludeTimeBlockId ? { id: { not: excludeTimeBlockId } } : {}),
          OR: [
            {
              startTime: { gte: startTime, lt: endTime },
            },
            {
              endTime: { gt: startTime, lte: endTime },
            },
            {
              startTime: { lte: startTime },
              endTime: { gte: endTime },
            },
          ],
        },
      });

      if (overlappingBlocks.length > 0) {
        throw new ConflictException(
          ApiErrorResponseBuilder.create(
            ErrorCode.TBDC,
            'Overlapping time blocks are not allowed by current institution settings',
          ).build(),
        );
      }
    }

    const requiresRotation = scheduleConfig.scheduleType !== ScheduleType.STANDARD && scheduleConfig.hasRotationDays;
    const allowedTokens = this.institutionConfigService.parseRotationPatternTokens(scheduleConfig.rotationPattern);

    if (!requiresRotation && normalizedRotationDay) {
      throw new Error(
        `Rotation day is not allowed for ${scheduleConfig.scheduleType.toLowerCase()} schedules with current settings`,
      );
    }

    if (requiresRotation) {
      if (!normalizedRotationDay) {
        throw new Error('Rotation day is required by current institution schedule configuration');
      }

      if (!scheduleConfig.rotationPattern || allowedTokens.length === 0) {
        throw new Error('Institution rotation pattern is not configured');
      }

      if (!allowedTokens.includes(normalizedRotationDay)) {
        throw new Error(
          `Rotation day "${normalizedRotationDay}" is not allowed. Allowed values: ${allowedTokens.join(', ')}`,
        );
      }
    }
  }

  /**
   * Create a new time block with AM/PM time format
   */
  async createTimeBlock(data: {
    name: string;
    startTime: string; // Format: "09:30 AM" or "2:45 PM"
    endTime: string;   // Format: "10:45 AM" or "4:00 PM"
    isActive?: boolean;
    rotationDay?: string | null;
    blockNumber?: number | null;
  }) {
    // Validate time formats
    if (!isValidTimeFormat(data.startTime)) {
      throw new Error(`Invalid start time format: ${data.startTime}`);
    }
    if (!isValidTimeFormat(data.endTime)) {
      throw new Error(`Invalid end time format: ${data.endTime}`);
    }

    // Parse time strings to Date objects
    const startTimeDate = parseTimeString(data.startTime);
    const endTimeDate = parseTimeString(data.endTime);

    // Validate that end time is after start time
    if (endTimeDate <= startTimeDate) {
      throw new Error('End time must be after start time');
    }

    const normalizedRotationDay = this.normalizeRotationDay(data.rotationDay);
    await this.validateTimeBlockAgainstSettings(startTimeDate, endTimeDate, normalizedRotationDay);

    return this.prisma.timeBlock.create({
      data: {
        name: data.name,
        startTime: startTimeDate,
        endTime: endTimeDate,
        isActive: data.isActive ?? true,
        rotationDay: normalizedRotationDay,
        blockNumber: data.blockNumber ?? null,
      } as any,
    });
  }

  /**
   * Get all time blocks with formatted time display
   */
  async getAllTimeBlocks(includeInactive: boolean = false) {
    const timeBlocks = await this.prisma.timeBlock.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { startTime: 'asc' },
    });

    // Add formatted time display
    return timeBlocks.map(block => ({
      ...block,
      timeRange: getTimeRangeDisplay(block.startTime, block.endTime),
      startTimeFormatted: formatTimeWithAMPM(block.startTime),
      endTimeFormatted: formatTimeWithAMPM(block.endTime),
      // Also provide the raw time strings to avoid timezone issues
      startTime: block.startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      }),
      endTime: block.endTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      }),
    }));
  }

  /**
   * Get time block by ID with formatted time display
   */
  async getTimeBlockById(id: string) {
    const timeBlock = await this.prisma.timeBlock.findUnique({
      where: { id },
    });

    if (!timeBlock) {
      return null;
    }

    return {
      ...timeBlock,
      timeRange: getTimeRangeDisplay(timeBlock.startTime, timeBlock.endTime),
      startTimeFormatted: formatTimeWithAMPM(timeBlock.startTime),
      endTimeFormatted: formatTimeWithAMPM(timeBlock.endTime),
      // Also provide the raw time strings to avoid timezone issues
      startTime: timeBlock.startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      }),
      endTime: timeBlock.endTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      }),
    };
  }

  /**
   * Update a time block
   */
  async updateTimeBlock(
    id: string,
    data: {
      name?: string;
      startTime?: string; // Format: "09:30 AM"
      endTime?: string;   // Format: "10:45 AM"
      isActive?: boolean;
      rotationDay?: string | null;
      blockNumber?: number | null;
    }
  ) {
    const existingTimeBlock = await this.prisma.timeBlock.findUnique({
      where: { id },
    });

    if (!existingTimeBlock) {
      throw new Error('Time block not found');
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.rotationDay !== undefined) updateData.rotationDay = this.normalizeRotationDay(data.rotationDay);
    if (data.blockNumber !== undefined) updateData.blockNumber = data.blockNumber;

    // Handle time updates
    if (data.startTime !== undefined) {
      if (!isValidTimeFormat(data.startTime)) {
        throw new Error(`Invalid start time format: ${data.startTime}`);
      }
      updateData.startTime = parseTimeString(data.startTime);
    }

    if (data.endTime !== undefined) {
      if (!isValidTimeFormat(data.endTime)) {
        throw new Error(`Invalid end time format: ${data.endTime}`);
      }
      updateData.endTime = parseTimeString(data.endTime);
    }

    // Validate time order if both times are being updated
    if (updateData.startTime && updateData.endTime) {
      if (updateData.endTime <= updateData.startTime) {
        throw new Error('End time must be after start time');
      }
    }

    const finalStartTime: Date = updateData.startTime ?? existingTimeBlock.startTime;
    const finalEndTime: Date = updateData.endTime ?? existingTimeBlock.endTime;
    const finalRotationDay: string | null =
      updateData.rotationDay !== undefined ? updateData.rotationDay : (existingTimeBlock.rotationDay as string | null);

    await this.validateTimeBlockAgainstSettings(finalStartTime, finalEndTime, finalRotationDay, id);

    return this.prisma.timeBlock.update({
      where: { id },
      data: updateData,
    });
  }

  async toggleTimeBlockStatus(id: string, isActive: boolean) {
    return this.prisma.timeBlock.update({
      where: { id },
      data: { isActive },
    });
  }

  /**
   * Delete a time block:
   * - hard delete when no references exist
   * - otherwise soft delete by setting isActive=false
   */
  async deleteTimeBlock(id: string) {
    const existingTimeBlock = await this.prisma.timeBlock.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!existingTimeBlock) {
      throw new NotFoundException(
        ApiErrorResponseBuilder.create(ErrorCode.TBDB, 'Time block not found').build(),
      );
    }

    const [startSectionReferences, endSectionReferences, preferredRequestReferences] = await this.prisma.$transaction([
      this.prisma.courseSection.count({ where: { timeBlockId: id } }),
      this.prisma.courseSection.count({ where: { endTimeBlockId: id } }),
      this.prisma.scheduleChangeRequest.count({ where: { preferredTimeBlockId: id } }),
    ]);

    const referenceCount =
      startSectionReferences + endSectionReferences + preferredRequestReferences;

    if (referenceCount === 0) {
      await this.prisma.timeBlock.delete({ where: { id } });
      return {
        id,
        hardDeleted: true,
        deactivated: false,
        referenceCount,
      };
    }

    if (!existingTimeBlock.isActive) {
      return {
        id,
        hardDeleted: false,
        deactivated: false,
        referenceCount,
        reason: 'referenced',
      };
    }

    await this.prisma.timeBlock.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      id,
      hardDeleted: false,
      deactivated: true,
      referenceCount,
      reason: 'referenced',
    };
  }

  /**
   * Get time blocks that overlap with a given time range
   */
  async getOverlappingTimeBlocks(startTime: string, endTime: string) {
    const startTimeDate = parseTimeString(startTime);
    const endTimeDate = parseTimeString(endTime);

    return this.prisma.timeBlock.findMany({
      where: {
        isActive: true,
        OR: [
          // Time blocks that start during the given range
          {
            startTime: {
              gte: startTimeDate,
              lt: endTimeDate,
            },
          },
          // Time blocks that end during the given range
          {
            endTime: {
              gt: startTimeDate,
              lte: endTimeDate,
            },
          },
          // Time blocks that completely contain the given range
          {
            startTime: { lte: startTimeDate },
            endTime: { gte: endTimeDate },
          },
        ],
      },
    });
  }

  /**
   * Create default time blocks for a typical school day
   */
  async createDefaultTimeBlocks() {
    const defaultBlocks = [
      { name: 'First Period', startTime: '08:00 AM', endTime: '08:55 AM' },
      { name: 'Second Period', startTime: '09:00 AM', endTime: '09:55 AM' },
      { name: 'Third Period', startTime: '10:00 AM', endTime: '10:55 AM' },
      { name: 'Fourth Period', startTime: '11:00 AM', endTime: '11:55 AM' },
      { name: 'Lunch', startTime: '12:00 PM', endTime: '12:30 PM' },
      { name: 'Fifth Period', startTime: '12:35 PM', endTime: '01:30 PM' },
      { name: 'Sixth Period', startTime: '01:35 PM', endTime: '02:30 PM' },
      { name: 'Seventh Period', startTime: '02:35 PM', endTime: '03:30 PM' },
    ];

    const createdBlocks = [];
    for (const block of defaultBlocks) {
      const created = await this.createTimeBlock(block);
      createdBlocks.push(created);
    }

    return createdBlocks;
  }
} 