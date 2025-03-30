import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({ 
    status: 201, 
    description: 'The schedule has been successfully created',
  })
  @ApiResponse({ status: 404, description: 'Student or courses not found' })
  @ApiResponse({ status: 409, description: 'Schedule conflicts or capacity issues' })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all schedules' })
  @ApiResponse({ status: 200, description: 'Return all schedules' })
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a schedule by id' })
  @ApiResponse({ status: 200, description: 'Return the schedule' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Get('student/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a schedule by student id' })
  @ApiResponse({ status: 200, description: 'Return the schedule' })
  @ApiResponse({ status: 404, description: 'Student or schedule not found' })
  findByStudent(@Param('id') id: string) {
    return this.schedulesService.findByStudent(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a schedule' })
  @ApiResponse({ status: 200, description: 'The schedule has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Schedule or courses not found' })
  @ApiResponse({ status: 409, description: 'Schedule conflicts or capacity issues' })
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a schedule' })
  @ApiResponse({ status: 200, description: 'The schedule has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
