import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new teacher' })
  @ApiResponse({ status: 201, description: 'The teacher has been successfully created' })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Get(':id/courses')
  getCoursesByTeacher(@Param('id') id: string) {
    return this.teachersService.getCoursesByTeacher(id);
  }

  @Get(':id/students-per-course')
  getStudentsPerCourse(@Param('id') id: string) {
    return this.teachersService.getStudentsPerCourse(id);
  }

  @Get(':teacherId/courses/:courseSectionId/students')
  getStudentsForCourseSection(
    @Param('teacherId') teacherId: string,
    @Param('courseSectionId') courseSectionId: string
  ) {
    return this.teachersService.getStudentsForCourseSection(teacherId, courseSectionId);
  }

  @Get('user/:userId')
  getByUserId(@Param('userId') userId: string) {
    return this.teachersService.getByUserId(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
} 