import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { ScheduleChangesService } from './schedule-changes.service';
import { CreateScheduleChangeRequestDto } from './dto/create-schedule-change-request.dto';
import { UpdateScheduleChangeRequestDto } from './dto/update-schedule-change-request.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RequestStatus, RequestPriority } from './enums/request-enums';

@ApiTags('Schedule Changes')
@Controller('schedule-changes')
export class ScheduleChangesController {
  constructor(private readonly scheduleChangesService: ScheduleChangesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all schedule change requests with optional filters' })
  @ApiResponse({ status: 200, description: 'Return all requests' })
  @ApiQuery({ name: 'status', enum: RequestStatus, required: false })
  @ApiQuery({ name: 'studentId', type: String, required: false })
  @ApiQuery({ name: 'priority', enum: RequestPriority, required: false })
  @ApiQuery({ name: 'termId', type: String, required: false })
  findAll(
    @Query('status') status?: RequestStatus,
    @Query('studentId') studentId?: string,
    @Query('priority') priority?: RequestPriority,
    @Query('termId') termId?: string,
  ) {
    return this.scheduleChangesService.findAll({ status, studentId, priority, termId });
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get requests for the current user' })
  @ApiResponse({ status: 200, description: 'Return current user requests' })
  findMyRequests(@Request() req) {
    return this.scheduleChangesService.findByUser(req.user.id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending schedule change requests' })
  @ApiResponse({ status: 200, description: 'Return pending requests' })
  findPending() {
    return this.scheduleChangesService.findPending();
  }

  @Get('completed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get completed schedule change requests (approved and denied)' })
  @ApiResponse({ status: 200, description: 'Return completed requests' })
  findCompleted() {
    return this.scheduleChangesService.findCompleted();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a schedule change request by id' })
  @ApiResponse({ status: 200, description: 'Return the request' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  findOne(@Param('id') id: string) {
    return this.scheduleChangesService.findOne(id);
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get requests by student id' })
  @ApiResponse({ status: 200, description: 'Return student requests' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.scheduleChangesService.findByStudent(studentId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new schedule change request' })
  @ApiResponse({ status: 201, description: 'The request has been successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Student or courses not found' })
  @ApiResponse({ status: 409, description: 'Duplicate request exists' })
  create(@Body() createDto: CreateScheduleChangeRequestDto, @Request() req) {
    return this.scheduleChangesService.create(createDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a schedule change request' })
  @ApiResponse({ status: 200, description: 'The request has been successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid update data or request status' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateScheduleChangeRequestDto,
    @Request() req
  ) {
    return this.scheduleChangesService.update(id, updateDto, req.user.id);
  }

  @Put(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process a schedule change request' })
  @ApiResponse({ status: 200, description: 'The request has been successfully processed' })
  @ApiResponse({ status: 400, description: 'Invalid process data or request status' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  process(
    @Param('id') id: string,
    @Body() processDto: ProcessChangeRequestDto,
    @Request() req
  ) {
    return this.scheduleChangesService.processChangeRequest(id, processDto, req.user.id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a schedule change request' })
  @ApiResponse({ status: 200, description: 'The request has been successfully canceled' })
  @ApiResponse({ status: 400, description: 'Invalid cancel request or request status' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  cancel(@Param('id') id: string, @Request() req) {
    return this.scheduleChangesService.cancelChangeRequest(id, req.user.id);
  }
}
