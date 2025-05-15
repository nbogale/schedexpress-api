import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CoursePrerequisitesService } from './course-prerequisites.service';
import { CreateCoursePrerequisiteDto } from './dto/create-course-prerequisite.dto';
import { UpdateCoursePrerequisiteDto } from './dto/update-course-prerequisite.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('course-prerequisites')
@Controller('course-prerequisites')
export class CoursePrerequisitesController {
  constructor(private readonly coursePrerequisitesService: CoursePrerequisitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course prerequisite' })
  @ApiResponse({
    status: 201,
    description: 'The course prerequisite has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input or prerequisite already exists.' })
  create(@Body() createCoursePrerequisiteDto: CreateCoursePrerequisiteDto) {
    return this.coursePrerequisitesService.create(createCoursePrerequisiteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all course prerequisites' })
  @ApiResponse({
    status: 200,
    description: 'Return all course prerequisites.',
  })
  findAll() {
    return this.coursePrerequisitesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course prerequisite by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the course prerequisite.',
  })
  @ApiResponse({ status: 404, description: 'Course prerequisite not found.' })
  findOne(@Param('id') id: string) {
    return this.coursePrerequisitesService.findOne(id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all prerequisites for a course' })
  @ApiResponse({
    status: 200,
    description: 'Return all prerequisites for the specified course.',
  })
  findByCourse(@Param('courseId') courseId: string) {
    return this.coursePrerequisitesService.findByCourse(courseId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course prerequisite' })
  @ApiResponse({
    status: 200,
    description: 'The course prerequisite has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Course prerequisite not found.' })
  update(
    @Param('id') id: string,
    @Body() updateCoursePrerequisiteDto: UpdateCoursePrerequisiteDto,
  ) {
    return this.coursePrerequisitesService.update(id, updateCoursePrerequisiteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course prerequisite' })
  @ApiResponse({
    status: 200,
    description: 'The course prerequisite has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Course prerequisite not found.' })
  remove(@Param('id') id: string) {
    return this.coursePrerequisitesService.remove(id);
  }
} 