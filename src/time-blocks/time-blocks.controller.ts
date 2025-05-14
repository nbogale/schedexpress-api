import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TimeBlocksService } from './time-blocks.service';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';

@ApiTags('time-blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('time-blocks')
export class TimeBlocksController {
  constructor(private readonly timeBlocksService: TimeBlocksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new time block' })
  @ApiResponse({ status: 201, description: 'The time block has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createTimeBlockDto: CreateTimeBlockDto) {
    return this.timeBlocksService.create(createTimeBlockDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all time blocks' })
  @ApiResponse({ status: 200, description: 'Return all time blocks.' })
  findAll() {
    return this.timeBlocksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a time block by id' })
  @ApiResponse({ status: 200, description: 'Return the time block.' })
  @ApiResponse({ status: 404, description: 'Time block not found.' })
  findOne(@Param('id') id: string) {
    return this.timeBlocksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a time block' })
  @ApiResponse({ status: 200, description: 'The time block has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Time block not found.' })
  update(@Param('id') id: string, @Body() updateTimeBlockDto: UpdateTimeBlockDto) {
    return this.timeBlocksService.update(id, updateTimeBlockDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a time block' })
  @ApiResponse({ status: 200, description: 'The time block has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Time block not found.' })
  remove(@Param('id') id: string) {
    return this.timeBlocksService.remove(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle time block active status' })
  @ApiResponse({ status: 200, description: 'The time block status has been successfully toggled.' })
  @ApiResponse({ status: 404, description: 'Time block not found.' })
  toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.timeBlocksService.toggleStatus(id, isActive);
  }
} 