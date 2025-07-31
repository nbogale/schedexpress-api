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
import { GradeLookupService } from './grade-lookup.service';
import { CreateGradeLookupDto } from './dto/create-grade-lookup.dto';
import { UpdateGradeLookupDto } from './dto/update-grade-lookup.dto';

@ApiTags('grade-lookup')
@Controller('grade-lookup')
export class GradeLookupController {
  constructor(private readonly gradeLookupService: GradeLookupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new grade lookup record' })
  @ApiResponse({ status: 201, description: 'Grade lookup record created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createGradeLookupDto: CreateGradeLookupDto) {
    return this.gradeLookupService.create(createGradeLookupDto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default grade lookup records' })
  @ApiResponse({ status: 201, description: 'Default grades seeded successfully' })
  seedDefaultGrades() {
    return this.gradeLookupService.seedDefaultGrades();
  }

  @Get()
  @ApiOperation({ summary: 'Get all grade lookup records' })
  @ApiResponse({ status: 200, description: 'List of all grade lookup records' })
  findAll() {
    return this.gradeLookupService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active grade lookup records' })
  @ApiResponse({ status: 200, description: 'List of active grade lookup records' })
  findActive() {
    return this.gradeLookupService.findActive();
  }

  @Get('passing')
  @ApiOperation({ summary: 'Get all passing grade lookup records' })
  @ApiResponse({ status: 200, description: 'List of passing grade lookup records' })
  findPassingGrades() {
    return this.gradeLookupService.findPassingGrades();
  }

  @Get('grade/:grade')
  @ApiOperation({ summary: 'Get grade lookup record by grade letter' })
  @ApiParam({ name: 'grade', description: 'Grade letter (e.g., A, B, C)' })
  @ApiResponse({ status: 200, description: 'Grade lookup record found' })
  @ApiResponse({ status: 404, description: 'Grade lookup record not found' })
  findByGrade(@Param('grade') grade: string) {
    return this.gradeLookupService.findByGrade(grade);
  }

  @Get('points/:grade')
  @ApiOperation({ summary: 'Get grade points for a specific grade' })
  @ApiParam({ name: 'grade', description: 'Grade letter (e.g., A, B, C)' })
  @ApiResponse({ status: 200, description: 'Grade points for the grade' })
  getGradePoints(@Param('grade') grade: string) {
    return this.gradeLookupService.getGradePoints(grade);
  }

  @Get('passing/:grade')
  @ApiOperation({ summary: 'Check if a grade is considered passing' })
  @ApiParam({ name: 'grade', description: 'Grade letter (e.g., A, B, C)' })
  @ApiResponse({ status: 200, description: 'Whether the grade is passing' })
  isPassingGrade(@Param('grade') grade: string) {
    return this.gradeLookupService.isPassingGrade(grade);
  }

  @Get('gpa/student/:studentId')
  @ApiOperation({ summary: 'Calculate GPA for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student GPA' })
  calculateGPA(@Param('studentId') studentId: string) {
    return this.gradeLookupService.calculateGPA(studentId);
  }

  @Get('gpa/student/:studentId/term/:termId')
  @ApiOperation({ summary: 'Calculate GPA for a student in a specific term' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiParam({ name: 'termId', description: 'Term ID' })
  @ApiResponse({ status: 200, description: 'Student GPA for the term' })
  calculateGPAByTerm(
    @Param('studentId') studentId: string,
    @Param('termId') termId: string,
  ) {
    return this.gradeLookupService.calculateGPAByTerm(studentId, termId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific grade lookup record' })
  @ApiParam({ name: 'id', description: 'Grade lookup record ID' })
  @ApiResponse({ status: 200, description: 'Grade lookup record found' })
  @ApiResponse({ status: 404, description: 'Grade lookup record not found' })
  findOne(@Param('id') id: string) {
    return this.gradeLookupService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a grade lookup record' })
  @ApiParam({ name: 'id', description: 'Grade lookup record ID' })
  @ApiResponse({ status: 200, description: 'Grade lookup record updated successfully' })
  @ApiResponse({ status: 404, description: 'Grade lookup record not found' })
  update(
    @Param('id') id: string,
    @Body() updateGradeLookupDto: UpdateGradeLookupDto,
  ) {
    return this.gradeLookupService.update(id, updateGradeLookupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a grade lookup record' })
  @ApiParam({ name: 'id', description: 'Grade lookup record ID' })
  @ApiResponse({ status: 204, description: 'Grade lookup record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Grade lookup record not found' })
  remove(@Param('id') id: string) {
    return this.gradeLookupService.remove(id);
  }
} 