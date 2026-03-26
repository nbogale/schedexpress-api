import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { StudentCourseHistoryService } from './student-course-history.service';
import { CreateStudentCourseHistoryDto } from './dto/create-student-course-history.dto';
import { UpdateStudentCourseHistoryDto } from './dto/update-student-course-history.dto';
import { CreateBulkStudentCourseHistoryDto } from './dto/create-bulk-student-course-history.dto';

@ApiTags('student-course-history')
@Controller('student-course-history')
export class StudentCourseHistoryController {
  constructor(private readonly studentCourseHistoryService: StudentCourseHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student course history record' })
  @ApiResponse({ status: 201, description: 'Student course history record created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createStudentCourseHistoryDto: CreateStudentCourseHistoryDto) {
    return this.studentCourseHistoryService.create(createStudentCourseHistoryDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple student course history records for the same course, school year, and term' })
  @ApiResponse({ 
    status: 201, 
    description: 'Bulk student course history records created successfully',
    schema: {
      type: 'object',
      properties: {
        created: {
          type: 'array',
          description: 'Successfully created records'
        },
        errors: {
          type: 'array',
          description: 'Failed records with error details'
        },
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            successful: { type: 'number' },
            failed: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createBulk(@Body() createBulkStudentCourseHistoryDto: CreateBulkStudentCourseHistoryDto) {
    return this.studentCourseHistoryService.createBulk(createBulkStudentCourseHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all student course history records' })
  @ApiResponse({ status: 200, description: 'List of all student course history records' })
  findAll() {
    return this.studentCourseHistoryService.findAll();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get all course history records for a specific student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'List of course history records for the student' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.studentCourseHistoryService.findByStudent(studentId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all course history records for a specific course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'List of course history records for the course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.studentCourseHistoryService.findByCourse(courseId);
  }

  @Get('academic-cycle/:academicCycleId')
  @ApiOperation({ summary: 'Get all course history records for a specific academic cycle' })
  @ApiParam({ name: 'academicCycleId', description: 'Academic Cycle ID' })
  @ApiResponse({ status: 200, description: 'List of course history records for the academic cycle' })
  findByAcademicCycle(@Param('academicCycleId') academicCycleId: string) {
    return this.studentCourseHistoryService.findByAcademicCycle(academicCycleId);
  }

  @Get('term/:termId')
  @ApiOperation({ summary: 'Get all course history records for a specific term' })
  @ApiParam({ name: 'termId', description: 'Term ID' })
  @ApiResponse({ status: 200, description: 'List of course history records for the term' })
  findByTerm(@Param('termId') termId: string) {
    return this.studentCourseHistoryService.findByTerm(termId);
  }

  @Get('transcript/:studentId')
  @ApiOperation({ summary: 'Get student transcript' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student transcript' })
  getStudentTranscript(@Param('studentId') studentId: string) {
    return this.studentCourseHistoryService.getStudentTranscript(studentId);
  }

  @Get('credits/student/:studentId/term/:termId')
  @ApiOperation({ summary: 'Get total credits earned by student for a specific term' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiParam({ name: 'termId', description: 'Term ID' })
  @ApiResponse({ status: 200, description: 'Total credits earned for the term' })
  getStudentCreditsByTerm(
    @Param('studentId') studentId: string,
    @Param('termId') termId: string,
  ) {
    return this.studentCourseHistoryService.getStudentCreditsByTerm(studentId, termId);
  }

  @Get('credits/student/:studentId/total')
  @ApiOperation({ summary: 'Get total credits earned by student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Total credits earned' })
  getStudentTotalCredits(@Param('studentId') studentId: string) {
    return this.studentCourseHistoryService.getStudentTotalCredits(studentId);
  }

  @Get('history/:studentId/:courseId/:academicCycleId')
  @ApiOperation({ summary: 'Get all grade submissions (history) for a student/course/cycle' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'academicCycleId', description: 'Academic Cycle ID' })
  @ApiResponse({ status: 200, description: 'List of all grade submissions' })
  getGradeHistory(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
    @Param('academicCycleId') academicCycleId: string,
  ) {
    return this.studentCourseHistoryService.getGradeHistory(studentId, courseId, academicCycleId);
  }

  @Get('current/:studentId/:courseId/:academicCycleId')
  @ApiOperation({ summary: 'Get the current (latest) grade for a student/course/cycle' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'academicCycleId', description: 'Academic Cycle ID' })
  @ApiResponse({ status: 200, description: 'Current grade submission' })
  getCurrentGrade(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
    @Param('academicCycleId') academicCycleId: string,
  ) {
    return this.studentCourseHistoryService.getCurrentGrade(studentId, courseId, academicCycleId);
  }

  @Post('final/calculate')
  @ApiOperation({ summary: 'Calculate and set final grade based on interim grades' })
  @ApiResponse({ status: 201, description: 'Final grade calculated and created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - no interim grades found or final grade already exists' })
  calculateFinalGrade(
    @Body() body: {
      studentId: string;
      courseId: string;
      academicCycleId: string;
      calculationMethod?: 'AVERAGE' | 'WEIGHTED' | 'LATEST' | 'MANUAL';
      manualGrade?: string;
    },
  ) {
    return this.studentCourseHistoryService.calculateFinalGrade(
      body.studentId,
      body.courseId,
      body.academicCycleId,
      body.calculationMethod || 'AVERAGE',
      body.manualGrade,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific student course history record' })
  @ApiParam({ name: 'id', description: 'Student course history record ID' })
  @ApiResponse({ status: 200, description: 'Student course history record found' })
  @ApiResponse({ status: 404, description: 'Student course history record not found' })
  findOne(@Param('id') id: string) {
    return this.studentCourseHistoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student course history record' })
  @ApiParam({ name: 'id', description: 'Student course history record ID' })
  @ApiResponse({ status: 200, description: 'Student course history record updated successfully' })
  @ApiResponse({ status: 404, description: 'Student course history record not found' })
  update(
    @Param('id') id: string,
    @Body() updateStudentCourseHistoryDto: UpdateStudentCourseHistoryDto,
  ) {
    return this.studentCourseHistoryService.update(id, updateStudentCourseHistoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a student course history record' })
  @ApiParam({ name: 'id', description: 'Student course history record ID' })
  @ApiResponse({ status: 204, description: 'Student course history record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Student course history record not found' })
  remove(@Param('id') id: string) {
    return this.studentCourseHistoryService.remove(id);
  }
} 