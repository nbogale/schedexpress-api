import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolYearsService } from './school-years.service';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';

@ApiTags('school-years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('school-years')
export class SchoolYearsController {
  constructor(private readonly schoolYearsService: SchoolYearsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new school year' })
  @ApiResponse({
    status: 201,
    description: 'The school year has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body() createSchoolYearDto: CreateSchoolYearDto) {
    return this.schoolYearsService.create(createSchoolYearDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all school years' })
  @ApiResponse({
    status: 200,
    description: 'Return all school years.',
  })
  findAll() {
    return this.schoolYearsService.findAll();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the current school year' })
  @ApiResponse({
    status: 200,
    description: 'Return the current school year.',
  })
  @ApiResponse({ status: 404, description: 'No current school year found.' })
  getCurrent() {
    return this.schoolYearsService.getCurrent();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a school year by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the school year.',
  })
  @ApiResponse({ status: 404, description: 'School year not found.' })
  findOne(@Param('id') id: string) {
    return this.schoolYearsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a school year' })
  @ApiResponse({
    status: 200,
    description: 'The school year has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'School year not found.' })
  update(
    @Param('id') id: string,
    @Body() updateSchoolYearDto: UpdateSchoolYearDto,
  ) {
    return this.schoolYearsService.update(id, updateSchoolYearDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school year' })
  @ApiResponse({
    status: 200,
    description: 'The school year has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'School year not found.' })
  remove(@Param('id') id: string) {
    return this.schoolYearsService.remove(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle the current status of a school year' })
  @ApiResponse({
    status: 200,
    description: 'The school year status has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'School year not found.' })
  toggleStatus(
    @Param('id') id: string,
    @Body('isCurrent') isCurrent: boolean,
  ) {
    return this.schoolYearsService.toggleStatus(id, isCurrent);
  }
} 