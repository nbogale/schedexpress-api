import { Controller, Get, Param, Put, Body, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Return all students' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get('counselor/:counselorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students assigned to a counselor' })
  @ApiResponse({ status: 200, description: 'Return students assigned to the counselor' })
  findByCounselor(@Param('counselorId') counselorId: string) {
    return this.studentsService.findByCounselor(counselorId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a student by id' })
  @ApiResponse({ status: 200, description: 'Return the student' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({ status: 200, description: 'The student has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Get(':id/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a student\'s schedule' })
  @ApiResponse({ status: 200, description: 'Return the student\'s schedule' })
  @ApiResponse({ status: 404, description: 'Student or schedule not found' })
  getSchedule(@Param('id') id: string) {
    // This is a proxy endpoint that will redirect to the schedules controller
    // We'll implement this redirection in a way that's compatible with the frontend expectations
    return this.findOne(id);
  }
}
