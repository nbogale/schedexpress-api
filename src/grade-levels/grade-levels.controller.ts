import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GradeLevelsService } from './grade-levels.service';
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { UpdateGradeLevelDto } from './dto/update-grade-level.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('grade-levels')
@Controller('grade-levels')
export class GradeLevelsController {
  constructor(private readonly gradeLevelsService: GradeLevelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new grade level' })
  @ApiResponse({
    status: 201,
    description: 'The grade level has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body() createGradeLevelDto: CreateGradeLevelDto) {
    return this.gradeLevelsService.create(createGradeLevelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all grade levels' })
  @ApiResponse({
    status: 200,
    description: 'Return all grade levels.',
  })
  findAll() {
    return this.gradeLevelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a grade level by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the grade level.',
  })
  @ApiResponse({ status: 404, description: 'Grade level not found.' })
  findOne(@Param('id') id: string) {
    return this.gradeLevelsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a grade level' })
  @ApiResponse({
    status: 200,
    description: 'The grade level has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Grade level not found.' })
  update(
    @Param('id') id: string,
    @Body() updateGradeLevelDto: UpdateGradeLevelDto,
  ) {
    return this.gradeLevelsService.update(id, updateGradeLevelDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a grade level' })
  @ApiResponse({
    status: 200,
    description: 'The grade level has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Grade level not found.' })
  remove(@Param('id') id: string) {
    return this.gradeLevelsService.remove(id);
  }
} 