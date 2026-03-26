import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, Query, Res, Header } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Response } from 'express';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
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

  @Get('workload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher workload for an academic year' })
  @ApiQuery({ name: 'academicYearId', required: true, description: 'Academic year ID' })
  @ApiResponse({ status: 200, description: 'Return teacher workload' })
  getTeacherWorkload(@Query('academicYearId') academicYearId: string) {
    return this.teachersService.getTeacherWorkload(academicYearId);
  }

  @Get('user/:userId')
  getByUserId(@Param('userId') userId: string) {
    return this.teachersService.getByUserId(userId);
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a teacher' })
  @ApiResponse({ status: 200, description: 'The teacher has been successfully updated' })
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a teacher' })
  @ApiResponse({ status: 200, description: 'The teacher has been successfully deleted' })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export teacher assignments to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file with teacher assignments' })
  async exportCSV(@Res() res: Response) {
    const csvContent = await this.teachersService.generateCSVExport();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="teacher_assignments.csv"');
    res.send(csvContent);
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export teacher assignments to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file with teacher assignments' })
  async exportExcel(@Res() res: Response) {
    const excelBuffer = await this.teachersService.generateExcelExport();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="teacher_assignments.xlsx"');
    res.send(excelBuffer);
  }
} 