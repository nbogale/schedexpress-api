import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, Res } from '@nestjs/common';
import { CoursePreferencesService } from './course-preferences.service';
import { CreateCoursePreferenceDto } from './dto/create-course-preference.dto';
import { AssignCoursePreferenceDto } from './dto/assign-course-preference.dto';
import { UpdateCoursePreferenceDto, CoursePreferenceStatus } from './dto/update-course-preference.dto';
import { PrerequisiteValidationService } from './prerequisite-validation.service';
import { DemandAnalyticsService } from './demand-analytics.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';

@ApiTags('course-preferences')
@Controller('course-preferences')
export class CoursePreferencesController {
  constructor(
    private readonly coursePreferencesService: CoursePreferencesService,
    private readonly validationService: PrerequisiteValidationService,
    private readonly analyticsService: DemandAnalyticsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course preference (Student only)' })
  @ApiResponse({ status: 201, description: 'The course preference has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input or preference already exists.' })
  @ApiResponse({ status: 404, description: 'Student, course, or academic cycle not found.' })
  async create(@Body() createDto: CreateCoursePreferenceDto, @Request() req) {
    return this.coursePreferencesService.create(createDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course preferences with optional filtering' })
  @ApiQuery({ name: 'studentId', required: false, type: String })
  @ApiQuery({ name: 'academicCycleId', required: false, type: String })
  @ApiQuery({ name: 'status', enum: CoursePreferenceStatus, required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all course preferences.' })
  async findAll(
    @Query('studentId') studentId?: string,
    @Query('academicCycleId') academicCycleId?: string,
    @Query('status') status?: CoursePreferenceStatus,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Request() req?: any,
  ) {
    // If user is a student, only show their own preferences
    if (req?.user?.role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId: req.user.id },
      });

      if (!student) {
        throw new Error('Student record not found for this user');
      }

      return this.coursePreferencesService.findAll({
        studentId: student.id,
        academicCycleId,
        status,
        skip: skip ? parseInt(skip.toString()) : undefined,
        take: take ? parseInt(take.toString()) : undefined,
      });
    }

    // Counselors/Admins can see all preferences (or filter by studentId if provided)
    return this.coursePreferencesService.findAll({
      studentId,
      academicCycleId,
      status,
      skip: skip ? parseInt(skip.toString()) : undefined,
      take: take ? parseInt(take.toString()) : undefined,
    });
  }

  @Get('my-preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s course preferences (Student only)' })
  @ApiResponse({ status: 200, description: 'Return current user preferences.' })
  async findMyPreferences(@Request() req) {
    const student = await this.prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      throw new Error('Student record not found for this user');
    }

    return this.coursePreferencesService.findAll({
      studentId: student.id,
    });
  }

  @Post('assign/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a course preference for a student (Counselor/Admin only)' })
  @ApiResponse({ status: 201, description: 'The course preference has been successfully assigned.' })
  @ApiResponse({ status: 400, description: 'Invalid input or preference already exists.' })
  @ApiResponse({ status: 404, description: 'Student, course, or academic cycle not found.' })
  async assignCourse(
    @Param('studentId') studentId: string,
    @Body() assignDto: AssignCoursePreferenceDto,
    @Request() req,
  ) {
    return this.coursePreferencesService.assignCourseForStudent(
      studentId,
      assignDto,
      req.user.id,
    );
  }

  // Analytics Endpoints
  @Get('analytics/overview/:academicCycleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get demand overview metrics (Admin/Counselor only)' })
  @ApiResponse({ status: 200, description: 'Return demand overview.' })
  async getDemandOverview(@Param('academicCycleId') academicCycleId: string) {
    return this.analyticsService.getDemandOverview(academicCycleId);
  }

  @Get('analytics/top-courses/:academicCycleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top requested courses (Admin/Counselor only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of top courses to return (default: 20)' })
  @ApiResponse({ status: 200, description: 'Return top courses by demand.' })
  async getTopCourses(
    @Param('academicCycleId') academicCycleId: string,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getTopCourses(academicCycleId, limit ? parseInt(limit.toString()) : 20);
  }

  @Get('analytics/by-department/:academicCycleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get demand by department (Admin/Counselor only)' })
  @ApiResponse({ status: 200, description: 'Return demand breakdown by department.' })
  async getDemandByDepartment(@Param('academicCycleId') academicCycleId: string) {
    return this.analyticsService.getDemandByDepartment(academicCycleId);
  }

  @Get('analytics/by-grade-level/:academicCycleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get demand by grade level (Admin/Counselor only)' })
  @ApiResponse({ status: 200, description: 'Return demand breakdown by grade level.' })
  async getDemandByGradeLevel(@Param('academicCycleId') academicCycleId: string) {
    return this.analyticsService.getDemandByGradeLevel(academicCycleId);
  }

  @Get('analytics/capacity/:academicCycleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get capacity analysis (Admin/Counselor only)' })
  @ApiResponse({ status: 200, description: 'Return capacity analysis (demand vs capacity).' })
  async getCapacityAnalysis(@Param('academicCycleId') academicCycleId: string) {
    return this.analyticsService.getCapacityAnalysis(academicCycleId);
  }

  @Get('analytics/trends/:academicCycleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get submission trends (Admin/Counselor only)' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly'], description: 'Time period for trends (default: daily)' })
  @ApiResponse({ status: 200, description: 'Return submission trends over time.' })
  async getSubmissionTrends(
    @Param('academicCycleId') academicCycleId: string,
    @Query('period') period?: 'daily' | 'weekly',
  ) {
    return this.analyticsService.getSubmissionTrends(academicCycleId, period || 'daily');
  }

  @Get('analytics/status/:academicCycleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get status distribution (Admin/Counselor only)' })
  @ApiResponse({ status: 200, description: 'Return status distribution.' })
  async getStatusDistribution(@Param('academicCycleId') academicCycleId: string) {
    return this.analyticsService.getStatusDistribution(academicCycleId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a course preference by id' })
  @ApiResponse({ status: 200, description: 'Return the course preference.' })
  @ApiResponse({ status: 404, description: 'Course preference not found.' })
  findOne(@Param('id') id: string) {
    return this.coursePreferencesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course preference' })
  @ApiResponse({ status: 200, description: 'The course preference has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input or cannot update this preference.' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot update this preference.' })
  @ApiResponse({ status: 404, description: 'Course preference not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCoursePreferenceDto,
    @Request() req,
  ) {
    return this.coursePreferencesService.update(
      id,
      updateDto,
      req.user.id,
      req.user.role,
    );
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a course preference for review (Student only)' })
  @ApiResponse({ status: 200, description: 'The course preference has been successfully submitted.' })
  @ApiResponse({ status: 400, description: 'Cannot submit this preference.' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot submit this preference.' })
  @ApiResponse({ status: 404, description: 'Course preference not found.' })
  async submitPreference(@Param('id') id: string, @Request() req) {
    return this.coursePreferencesService.submitPreference(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course preference' })
  @ApiResponse({ status: 200, description: 'The course preference has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot delete this preference.' })
  @ApiResponse({ status: 404, description: 'Course preference not found.' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.coursePreferencesService.remove(id, req.user.id, req.user.role);
  }

  @Get('validate/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate prerequisites for a course (Student only)' })
  @ApiResponse({ status: 200, description: 'Return validation result for the course.' })
  @ApiResponse({ status: 404, description: 'Student or course not found.' })
  async validateCourse(@Param('courseId') courseId: string, @Request() req) {
    // Get student from user ID
    const student = await this.prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      throw new Error('Student record not found for this user');
    }

    return this.validationService.validateAllRules(student.id, courseId);
  }

  @Post('validate-bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate prerequisites for multiple courses (Student only)' })
  @ApiResponse({ status: 200, description: 'Return validation results for all courses.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async validateMultipleCourses(
    @Body() body: { courseIds: string[] },
    @Request() req,
  ) {
    // Get student from user ID
    const student = await this.prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      throw new Error('Student record not found for this user');
    }

    if (!body.courseIds || !Array.isArray(body.courseIds) || body.courseIds.length === 0) {
      throw new Error('courseIds array is required and must not be empty');
    }

    const results = await this.validationService.validateMultipleCourses(
      student.id,
      body.courseIds,
    );

    // Convert Map to object for JSON response
    const resultsObject: Record<string, any> = {};
    results.forEach((value, key) => {
      resultsObject[key] = value;
    });

    return resultsObject;
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export course preferences to CSV' })
  @ApiQuery({ name: 'academicCycleId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'CSV file with course preferences data' })
  async exportCSV(@Query('academicCycleId') academicCycleId: string, @Res() res: Response) {
    const csvContent = await this.coursePreferencesService.generateCSVExport(academicCycleId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="course-preferences.csv"');
    res.send(csvContent);
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export course preferences to Excel' })
  @ApiQuery({ name: 'academicCycleId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Excel file with course preferences data' })
  async exportExcel(@Query('academicCycleId') academicCycleId: string, @Res() res: Response) {
    const excelBuffer = await this.coursePreferencesService.generateExcelExport(academicCycleId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="course-preferences.xlsx"');
    res.send(excelBuffer);
  }
}

