import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseLevelsService } from './course-levels.service';
import { CreateCourseLevelDto } from './dto/create-course-level.dto';
import { UpdateCourseLevelDto } from './dto/update-course-level.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('course-levels')
@Controller('course-levels')
export class CourseLevelsController {
  constructor(private readonly courseLevelsService: CourseLevelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course level' })
  @ApiResponse({
    status: 201,
    description: 'The course level has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body() createCourseLevelDto: CreateCourseLevelDto) {
    return this.courseLevelsService.create(createCourseLevelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all course levels' })
  @ApiResponse({
    status: 200,
    description: 'Return all course levels.',
  })
  findAll() {
    return this.courseLevelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course level by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the course level.',
  })
  @ApiResponse({ status: 404, description: 'Course level not found.' })
  findOne(@Param('id') id: string) {
    return this.courseLevelsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course level' })
  @ApiResponse({
    status: 200,
    description: 'The course level has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Course level not found.' })
  update(
    @Param('id') id: string,
    @Body() updateCourseLevelDto: UpdateCourseLevelDto,
  ) {
    return this.courseLevelsService.update(id, updateCourseLevelDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course level' })
  @ApiResponse({
    status: 200,
    description: 'The course level has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Course level not found.' })
  remove(@Param('id') id: string) {
    return this.courseLevelsService.remove(id);
  }
} 