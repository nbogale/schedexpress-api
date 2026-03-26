import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { AcademicCyclesService } from './academic-cycles.service';
import { PeriodGenerationService } from './period-generation.service';
import { CreateAcademicCycleConfigDto } from './dto/create-academic-cycle-config.dto';
import { UpdateAcademicCycleConfigDto } from './dto/update-academic-cycle-config.dto';
import { CreateAcademicCycleRuleDto } from './dto/create-academic-cycle-rule.dto';
import { CreateAcademicCycleDto } from './dto/create-academic-cycle.dto';
import { UpdateAcademicCycleDto } from './dto/update-academic-cycle.dto';
import { ValidateAcademicCycleDto } from './dto/validate-academic-cycle.dto';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserRole, CycleType, AcademicPeriodStatus } from '@prisma/client';

@ApiTags('Academic Cycles')
@Controller('academic-cycles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AcademicCyclesController {
  constructor(
    private readonly academicCyclesService: AcademicCyclesService,
    private readonly periodGenerationService: PeriodGenerationService,
  ) {}

  // Academic Cycle Config Endpoints
  @Post('configs')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create a new academic cycle configuration' })
  @ApiResponse({ status: 201, description: 'Configuration created successfully' })
  createConfig(@Body() createConfigDto: CreateAcademicCycleConfigDto, @Request() req) {
    return this.academicCyclesService.createConfig(createConfigDto, req.user.id);
  }

  @Get('configs')
  @ApiOperation({ summary: 'Get all academic cycle configurations' })
  @ApiResponse({ status: 200, description: 'Return all configurations' })
  findAllConfigs() {
    return this.academicCyclesService.findAllConfigs();
  }

  @Get('configs/:id')
  @ApiOperation({ summary: 'Get a configuration by id' })
  @ApiResponse({ status: 200, description: 'Return the configuration' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  findConfigById(@Param('id') id: string) {
    return this.academicCyclesService.findConfigById(id);
  }

  @Patch('configs/:id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update a configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  updateConfig(@Param('id') id: string, @Body() updateConfigDto: UpdateAcademicCycleConfigDto) {
    return this.academicCyclesService.updateConfig(id, updateConfigDto);
  }

  @Delete('configs/:id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Delete a configuration' })
  @ApiResponse({ status: 200, description: 'Configuration deleted successfully' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  removeConfig(@Param('id') id: string) {
    return this.academicCyclesService.removeConfig(id);
  }

  // Academic Cycle Rule Endpoints
  @Post('rules')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create a new academic cycle rule' })
  @ApiResponse({ status: 201, description: 'Rule created successfully' })
  createRule(@Body() createRuleDto: CreateAcademicCycleRuleDto) {
    return this.academicCyclesService.createRule(createRuleDto);
  }

  @Get('configs/:configId/rules')
  @ApiOperation({ summary: 'Get rules for a configuration' })
  @ApiResponse({ status: 200, description: 'Return all rules for the configuration' })
  @ApiParam({ name: 'configId', description: 'Configuration ID' })
  findRulesByConfigId(@Param('configId') configId: string) {
    return this.academicCyclesService.findRulesByConfigId(configId);
  }

  @Patch('rules/:id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update a rule' })
  @ApiResponse({ status: 200, description: 'Rule updated successfully' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  updateRule(@Param('id') id: string, @Body() updateRuleDto: Partial<CreateAcademicCycleRuleDto>) {
    return this.academicCyclesService.updateRule(id, updateRuleDto);
  }

  @Delete('rules/:id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Delete a rule' })
  @ApiResponse({ status: 200, description: 'Rule deleted successfully' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  removeRule(@Param('id') id: string) {
    return this.academicCyclesService.removeRule(id);
  }

  // Academic Cycle Endpoints
  @Post()
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Create a new academic cycle' })
  @ApiResponse({ status: 201, description: 'Cycle created successfully' })
  createCycle(@Body() createCycleDto: CreateAcademicCycleDto) {
    return this.academicCyclesService.createCycle(createCycleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all academic cycles' })
  @ApiResponse({ status: 200, description: 'Return all cycles' })
  findAllCycles() {
    return this.academicCyclesService.findAllCycles();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current academic cycle' })
  @ApiResponse({ status: 200, description: 'Return current cycle' })
  @ApiQuery({ name: 'type', enum: CycleType, required: false, description: 'Filter by cycle type' })
  findCurrentCycle(@Query('type') type?: CycleType) {
    return this.academicCyclesService.findCurrentCycle(type);
  }

  @Get('current/academic-year')
  @ApiOperation({ summary: 'Get current academic academic year' })
  @ApiResponse({ status: 200, description: 'Return current academic academic year' })
  findCurrentAcademicAcademicYear() {
    return this.academicCyclesService.findCurrentCycle(CycleType.SCHOOL_YEAR);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get cycles by type' })
  @ApiResponse({ status: 200, description: 'Return cycles of specified type' })
  @ApiParam({ name: 'type', enum: CycleType, description: 'Cycle type' })
  findCyclesByType(@Param('type') type: CycleType) {
    return this.academicCyclesService.findCyclesByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cycle by id' })
  @ApiResponse({ status: 200, description: 'Return the cycle' })
  @ApiParam({ name: 'id', description: 'Cycle ID' })
  findCycleById(@Param('id') id: string) {
    return this.academicCyclesService.findCycleById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update a cycle' })
  @ApiResponse({ status: 200, description: 'Cycle updated successfully' })
  @ApiParam({ name: 'id', description: 'Cycle ID' })
  updateCycle(@Param('id') id: string, @Body() updateCycleDto: UpdateAcademicCycleDto) {
    return this.academicCyclesService.updateCycle(id, updateCycleDto);
  }

  @Post(':id/validate')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Validate an academic cycle' })
  @ApiResponse({ status: 200, description: 'Cycle validated successfully' })
  @ApiParam({ name: 'id', description: 'Cycle ID' })
  validateCycle(@Param('id') id: string, @Body() validateCycleDto: ValidateAcademicCycleDto, @Request() req) {
    return this.academicCyclesService.validateCycle(validateCycleDto, req.user.id);
  }

  @Post(':id/validate-structure')
  @ApiOperation({ summary: 'Validate cycle structure' })
  @ApiResponse({ status: 200, description: 'Structure validation completed' })
  @ApiParam({ name: 'id', description: 'Cycle ID' })
  validateCycleStructure(@Param('id') id: string) {
    return this.academicCyclesService.validateCycleStructure(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Delete a cycle' })
  @ApiResponse({ status: 200, description: 'Cycle deleted successfully' })
  @ApiParam({ name: 'id', description: 'Cycle ID' })
  removeCycle(@Param('id') id: string) {
    return this.academicCyclesService.removeCycle(id);
  }

  // Academic Period Endpoints
  @Post('periods')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create a new academic period' })
  @ApiResponse({ status: 201, description: 'Period created successfully' })
  createPeriod(@Body() createPeriodDto: CreateAcademicPeriodDto, @Request() req) {
    console.log('createPeriodDto', JSON.stringify(createPeriodDto));
    return this.academicCyclesService.createPeriod(createPeriodDto, req.user.id);
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get all academic periods' })
  @ApiResponse({ status: 200, description: 'Return all periods' })
  @ApiQuery({ name: 'cycleId', required: false, description: 'Filter by cycle ID' })
  findAllPeriods(@Query('cycleId') cycleId?: string) {
    return this.academicCyclesService.findAllPeriods(cycleId);
  }

  @Get('periods/current')
  @ApiOperation({ summary: 'Get current active period' })
  @ApiResponse({ status: 200, description: 'Return current period' })
  @ApiQuery({ name: 'cycleId', required: false, description: 'Filter by cycle ID' })
  findCurrentPeriod(@Query('cycleId') cycleId?: string) {
    return this.academicCyclesService.findCurrentPeriod(cycleId);
  }

  @Get('periods/upcoming')
  @ApiOperation({ summary: 'Get upcoming periods' })
  @ApiResponse({ status: 200, description: 'Return upcoming periods' })
  @ApiQuery({ name: 'cycleId', required: false, description: 'Filter by cycle ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results', type: Number })
  findUpcomingPeriods(@Query('cycleId') cycleId?: string, @Query('limit') limit?: string) {
    return this.academicCyclesService.findUpcomingPeriods(cycleId, limit ? parseInt(limit) : 5);
  }

  @Get('cycles/:cycleId/periods')
  @ApiOperation({ summary: 'Get all periods for a cycle' })
  @ApiResponse({ status: 200, description: 'Return all periods for the cycle' })
  @ApiParam({ name: 'cycleId', description: 'Cycle ID' })
  findPeriodsByCycle(@Param('cycleId') cycleId: string) {
    return this.academicCyclesService.findPeriodsByCycle(cycleId);
  }

  @Get('periods/:id')
  @ApiOperation({ summary: 'Get a period by id' })
  @ApiResponse({ status: 200, description: 'Return the period' })
  @ApiParam({ name: 'id', description: 'Period ID' })
  findPeriodById(@Param('id') id: string) {
    return this.academicCyclesService.findPeriodById(id);
  }

  @Patch('periods/:id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Update a period' })
  @ApiResponse({ status: 200, description: 'Period updated successfully' })
  @ApiParam({ name: 'id', description: 'Period ID' })
  updatePeriod(@Param('id') id: string, @Body() updatePeriodDto: UpdateAcademicPeriodDto) {
    return this.academicCyclesService.updatePeriod(id, updatePeriodDto);
  }

  @Patch('periods/:id/status')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update period status' })
  @ApiResponse({ status: 200, description: 'Period status updated successfully' })
  @ApiParam({ name: 'id', description: 'Period ID' })
  @ApiQuery({ name: 'status', enum: AcademicPeriodStatus, description: 'New status' })
  updatePeriodStatus(@Param('id') id: string, @Query('status') status: AcademicPeriodStatus) {
    return this.academicCyclesService.updatePeriodStatus(id, status);
  }

  @Delete('periods/:id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Delete a period' })
  @ApiResponse({ status: 200, description: 'Period deleted successfully' })
  @ApiParam({ name: 'id', description: 'Period ID' })
  deletePeriod(@Param('id') id: string) {
    return this.academicCyclesService.deletePeriod(id);
  }

  @Post('cycles/:cycleId/generate-periods')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Generate and create academic periods for a cycle based on default configuration' })
  @ApiResponse({ status: 201, description: 'Periods generated successfully' })
  @ApiParam({ name: 'cycleId', description: 'Cycle ID' })
  async generatePeriodsForCycle(@Param('cycleId') cycleId: string, @Request() req) {
    const result = await this.periodGenerationService.generatePeriodsForCycle(cycleId, req.user.id);
    return {
      success: true,
      data: {
        periods: result.periods,
        warnings: result.warnings,
        totalPeriods: result.periods.length,
      },
    };
  }
}
