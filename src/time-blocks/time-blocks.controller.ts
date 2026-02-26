import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch, UseGuards } from '@nestjs/common';
import { TimeBlocksService } from './time-blocks.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('time-blocks')
export class TimeBlocksController {
  constructor(private readonly timeBlocksService: TimeBlocksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  async createTimeBlock(@Body() data: {
    name: string;
    startTime: string; // Format: "09:30 AM" or "2:45 PM"
    endTime: string;   // Format: "10:45 AM" or "4:00 PM"
    isActive?: boolean;
    rotationDay?: string | null;
    blockNumber?: number | null;
  }) {
    return this.timeBlocksService.createTimeBlock(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  async getAllTimeBlocks(@Query('includeInactive') includeInactive?: string) {
    return this.timeBlocksService.getAllTimeBlocks(includeInactive === 'true');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  async getTimeBlockById(@Param('id') id: string) {
    return this.timeBlocksService.getTimeBlockById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  async updateTimeBlock(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      startTime?: string; // Format: "09:30 AM"
      endTime?: string;   // Format: "10:45 AM"
      isActive?: boolean;
      rotationDay?: string | null;
      blockNumber?: number | null;
    }
  ) {
    return this.timeBlocksService.updateTimeBlock(id, data);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  async toggleStatus(
    @Param('id') id: string,
    @Body() data: { isActive: boolean }
  ) {
    return this.timeBlocksService.toggleTimeBlockStatus(id, data.isActive);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  async deleteTimeBlock(@Param('id') id: string) {
    return this.timeBlocksService.deleteTimeBlock(id);
  }

  @Get('overlap/check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  async checkOverlappingTimeBlocks(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.timeBlocksService.getOverlappingTimeBlocks(startTime, endTime);
  }

  @Post('default')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  async createDefaultTimeBlocks() {
    return this.timeBlocksService.createDefaultTimeBlocks();
  }
} 