import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Patch } from '@nestjs/common';
import { CourseRulesService } from './course-rules.service';
import { CreateCourseRuleDto } from './dto/create-course-rule.dto';
import { UpdateCourseRuleDto } from './dto/update-course-rule.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Course Rules')
@Controller('course-rules')
export class CourseRulesController {
  constructor(private readonly courseRulesService: CourseRulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course rule' })
  @ApiResponse({ 
    status: 201, 
    description: 'The course rule has been successfully created',
  })
  @ApiResponse({ status: 409, description: 'Rule already exists' })
  create(@Body() createCourseRuleDto: CreateCourseRuleDto) {
    return this.courseRulesService.create(createCourseRuleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all course rules' })
  @ApiResponse({ status: 200, description: 'Return all course rules' })
  findAll() {
    return this.courseRulesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a course rule by id' })
  @ApiResponse({ status: 200, description: 'Return the course rule' })
  @ApiResponse({ status: 404, description: 'Course rule not found' })
  findOne(@Param('id') id: string) {
    return this.courseRulesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course rule' })
  @ApiResponse({ status: 200, description: 'The course rule has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Course rule not found' })
  update(@Param('id') id: string, @Body() updateCourseRuleDto: UpdateCourseRuleDto) {
    return this.courseRulesService.update(id, updateCourseRuleDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Partially update a course rule' })
  @ApiResponse({ status: 200, description: 'The course rule has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Course rule not found' })
  patch(@Param('id') id: string, @Body() updateCourseRuleDto: UpdateCourseRuleDto) {
    return this.courseRulesService.update(id, updateCourseRuleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course rule' })
  @ApiResponse({ status: 200, description: 'The course rule has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Course rule not found' })
  remove(@Param('id') id: string) {
    return this.courseRulesService.remove(id);
  }
}
