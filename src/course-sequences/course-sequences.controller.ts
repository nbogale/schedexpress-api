import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseSequencesService } from './course-sequences.service';
import { CreateCourseSequenceDto } from './dto/create-course-sequence.dto';
import { UpdateCourseSequenceDto } from './dto/update-course-sequence.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('course-sequences')
@Controller('course-sequences')
export class CourseSequencesController {
  constructor(private readonly courseSequencesService: CourseSequencesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course sequence' })
  @ApiResponse({
    status: 201,
    description: 'The course sequence has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input or sequence already exists.' })
  create(@Body() createCourseSequenceDto: CreateCourseSequenceDto) {
    return this.courseSequencesService.create(createCourseSequenceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all course sequences' })
  @ApiResponse({
    status: 200,
    description: 'Return all course sequences.',
  })
  findAll() {
    return this.courseSequencesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course sequence by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the course sequence.',
  })
  @ApiResponse({ status: 404, description: 'Course sequence not found.' })
  findOne(@Param('id') id: string) {
    return this.courseSequencesService.findOne(id);
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get all sequences for a department' })
  @ApiResponse({
    status: 200,
    description: 'Return all sequences for the specified department.',
  })
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.courseSequencesService.findByDepartment(departmentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course sequence' })
  @ApiResponse({
    status: 200,
    description: 'The course sequence has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Course sequence not found.' })
  update(
    @Param('id') id: string,
    @Body() updateCourseSequenceDto: UpdateCourseSequenceDto,
  ) {
    return this.courseSequencesService.update(id, updateCourseSequenceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course sequence' })
  @ApiResponse({
    status: 200,
    description: 'The course sequence has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Course sequence not found.' })
  remove(@Param('id') id: string) {
    return this.courseSequencesService.remove(id);
  }
} 