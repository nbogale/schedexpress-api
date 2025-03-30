import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { ScheduleChangeRequestsService } from './schedule-change-requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Schedule Change Requests')
@Controller('schedule-change-requests')
export class ScheduleChangeRequestsController {
  constructor(private readonly requestsService: ScheduleChangeRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new schedule change request' })
  @ApiResponse({ 
    status: 201, 
    description: 'The request has been successfully created',
  })
  @ApiResponse({ status: 404, description: 'Student or courses not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all schedule change requests' })
  @ApiResponse({ status: 200, description: 'Return all requests' })
  findAll() {
    return this.requestsService.findAll();
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get requests for the current user' })
  @ApiResponse({ status: 200, description: 'Return current user requests' })
  findMyRequests(@Request() req) {
    // For students, show their own requests
    if (req.user.role === UserRole.STUDENT) {
      return this.requestsService.findByUser(req.user.id);
    }
    // For counselors and admins, show all pending requests
    return this.requestsService.findPending();
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending schedule change requests' })
  @ApiResponse({ status: 200, description: 'Return pending requests' })
  findPending() {
    return this.requestsService.findPending();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a request by id' })
  @ApiResponse({ status: 200, description: 'Return the request' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get requests by student id' })
  @ApiResponse({ status: 200, description: 'Return student requests' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.requestsService.findByStudent(studentId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a schedule change request' })
  @ApiResponse({ status: 200, description: 'The request has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 409, description: 'Conflicts prevent approval' })
  update(
    @Param('id') id: string, 
    @Body() updateRequestDto: UpdateRequestDto,
    @Request() req
  ) {
    return this.requestsService.update(id, updateRequestDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a schedule change request' })
  @ApiResponse({ status: 200, description: 'The request has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  remove(@Param('id') id: string) {
    return this.requestsService.remove(id);
  }
}
