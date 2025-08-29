import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  formatTimeWithAMPM, 
  parseTimeString, 
  createTimeDate, 
  getTimeRangeDisplay,
  isValidTimeFormat 
} from '../common/time-utils';

@Injectable()
export class TimeBlocksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new time block with AM/PM time format
   */
  async createTimeBlock(data: {
    name: string;
    startTime: string; // Format: "09:30 AM" or "2:45 PM"
    endTime: string;   // Format: "10:45 AM" or "4:00 PM"
    isActive?: boolean;
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

    return this.prisma.timeBlock.create({
      data: {
        name: data.name,
        startTime: startTimeDate,
        endTime: endTimeDate,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Get all time blocks with formatted time display
   */
  async getAllTimeBlocks() {
    const timeBlocks = await this.prisma.timeBlock.findMany({
      where: { isActive: true },
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
    }
  ) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

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

    return this.prisma.timeBlock.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a time block (soft delete by setting isActive to false)
   */
  async deleteTimeBlock(id: string) {
    return this.prisma.timeBlock.update({
      where: { id },
      data: { isActive: false },
    });
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