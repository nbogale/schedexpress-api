import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { CourseSectionsService } from './course-sections.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@ApiTags('course-sections')
@Controller('course-sections')
export class CourseSectionsController {
  constructor(private readonly courseSectionsService: CourseSectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course section' })
  @ApiResponse({ status: 201, description: 'The course section has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input or time block conflict.' })
  @ApiResponse({ status: 404, description: 'Related resource not found.' })
  create(@Body() createCourseSectionDto: CreateCourseSectionDto) {
    return this.courseSectionsService.create(createCourseSectionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all course sections with optional filtering' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @ApiQuery({ name: 'academicCycleId', required: false, type: String })
  @ApiQuery({ name: 'teacherId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Return all course sections.' })
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(0), ParseIntPipe) take?: number,
    @Query('courseId') courseId?: string,
    @Query('academicCycleId') academicCycleId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    const where: Prisma.CourseSectionWhereInput = {};
    if (courseId) where.courseId = courseId;
    if (academicCycleId) where.academicCycleId = academicCycleId;
    if (teacherId) where.teacherId = teacherId;

    return this.courseSectionsService.findAll({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course section by id' })
  @ApiResponse({ status: 200, description: 'Return the course section.' })
  @ApiResponse({ status: 404, description: 'Course section not found.' })
  findOne(@Param('id') id: string) {
    return this.courseSectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course section' })
  @ApiResponse({ status: 200, description: 'The course section has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input or time block conflict.' })
  @ApiResponse({ status: 404, description: 'Course section not found.' })
  update(@Param('id') id: string, @Body() updateCourseSectionDto: UpdateCourseSectionDto) {
    return this.courseSectionsService.update(id, updateCourseSectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course section' })
  @ApiResponse({ status: 200, description: 'The course section has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Cannot delete section with enrolled students.' })
  @ApiResponse({ status: 404, description: 'Course section not found.' })
  remove(@Param('id') id: string) {
    return this.courseSectionsService.remove(id);
  }

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Increment enrollment for a course section' })
  @ApiResponse({ status: 200, description: 'Enrollment has been successfully incremented.' })
  @ApiResponse({ status: 400, description: 'Section is already at maximum enrollment.' })
  @ApiResponse({ status: 404, description: 'Course section not found.' })
  incrementEnrollment(@Param('id') id: string) {
    return this.courseSectionsService.incrementEnrollment(id);
  }

  @Post(':id/unenroll')
  @ApiOperation({ summary: 'Decrement enrollment for a course section' })
  @ApiResponse({ status: 200, description: 'Enrollment has been successfully decremented.' })
  @ApiResponse({ status: 400, description: 'Section has no enrolled students.' })
  @ApiResponse({ status: 404, description: 'Course section not found.' })
  decrementEnrollment(@Param('id') id: string) {
    return this.courseSectionsService.decrementEnrollment(id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all course sections for a course' })
  @ApiQuery({ name: 'academicCycleId', required: false, type: String })
  @ApiQuery({ name: 'teacherId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Return all course sections for a course.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  findAllByCourseId(@Param('courseId') courseId: string,
    @Query('academicCycleId') academicCycleId?: string,
      @Query('teacherId') teacherId?: string,) {

    const where: Prisma.CourseSectionWhereInput = {};
   
    if (academicCycleId) where.academicCycleId = academicCycleId;
    if (teacherId) where.teacherId = teacherId;

    return this.courseSectionsService.findAllByCourseId(courseId, where);
  }
} 