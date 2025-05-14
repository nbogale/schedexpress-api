import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TermsService } from './terms.service';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';

@ApiTags('terms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new term' })
  @ApiResponse({ status: 201, description: 'The term has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createTermDto: CreateTermDto) {
    return this.termsService.create(createTermDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all terms' })
  @ApiResponse({ status: 200, description: 'Return all terms.' })
  findAll() {
    return this.termsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a term by id' })
  @ApiResponse({ status: 200, description: 'Return the term.' })
  @ApiResponse({ status: 404, description: 'Term not found.' })
  findOne(@Param('id') id: string) {
    return this.termsService.findOne(id);
  }

  @Get('school-year/:schoolYearId')
  @ApiOperation({ summary: 'Get all terms for a school year' })
  @ApiResponse({ status: 200, description: 'Return all terms for the specified school year.' })
  findBySchoolYear(@Param('schoolYearId') schoolYearId: string) {
    return this.termsService.findBySchoolYear(schoolYearId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a term' })
  @ApiResponse({ status: 200, description: 'The term has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Term not found.' })
  update(@Param('id') id: string, @Body() updateTermDto: UpdateTermDto) {
    return this.termsService.update(id, updateTermDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a term' })
  @ApiResponse({ status: 200, description: 'The term has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Term not found.' })
  remove(@Param('id') id: string) {
    return this.termsService.remove(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle term current status' })
  @ApiResponse({ status: 200, description: 'The term status has been successfully toggled.' })
  @ApiResponse({ status: 404, description: 'Term not found.' })
  toggleStatus(
    @Param('id') id: string,
    @Body('isCurrent') isCurrent: boolean,
  ) {
    return this.termsService.toggleStatus(id, isCurrent);
  }
} 