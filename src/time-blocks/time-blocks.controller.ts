import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TimeBlocksService } from './time-blocks.service';

@Controller('time-blocks')
export class TimeBlocksController {
  constructor(private readonly timeBlocksService: TimeBlocksService) {}

  @Post()
  async createTimeBlock(@Body() data: {
    name: string;
    startTime: string; // Format: "09:30 AM" or "2:45 PM"
    endTime: string;   // Format: "10:45 AM" or "4:00 PM"
    isActive?: boolean;
  }) {
    return this.timeBlocksService.createTimeBlock(data);
  }

  @Get()
  async getAllTimeBlocks() {
    return this.timeBlocksService.getAllTimeBlocks();
  }

  @Get(':id')
  async getTimeBlockById(@Param('id') id: string) {
    return this.timeBlocksService.getTimeBlockById(id);
  }

  @Put(':id')
  async updateTimeBlock(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      startTime?: string; // Format: "09:30 AM"
      endTime?: string;   // Format: "10:45 AM"
      isActive?: boolean;
    }
  ) {
    return this.timeBlocksService.updateTimeBlock(id, data);
  }

  @Delete(':id')
  async deleteTimeBlock(@Param('id') id: string) {
    return this.timeBlocksService.deleteTimeBlock(id);
  }

  @Get('overlap/check')
  async checkOverlappingTimeBlocks(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.timeBlocksService.getOverlappingTimeBlocks(startTime, endTime);
  }

  @Post('default')
  async createDefaultTimeBlocks() {
    return this.timeBlocksService.createDefaultTimeBlocks();
  }
} 