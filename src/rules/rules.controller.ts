import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Patch } from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Rules')
@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new rule' })
  @ApiResponse({ 
    status: 201, 
    description: 'The rule has been successfully created',
  })
  @ApiResponse({ status: 409, description: 'Rule with that name already exists' })
  create(@Body() createRuleDto: CreateRuleDto) {
    return this.rulesService.create(createRuleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all rules' })
  @ApiResponse({ status: 200, description: 'Return all rules' })
  findAll() {
    return this.rulesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a rule by id' })
  @ApiResponse({ status: 200, description: 'Return the rule' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  findOne(@Param('id') id: string) {
    return this.rulesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a rule' })
  @ApiResponse({ status: 200, description: 'The rule has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  update(@Param('id') id: string, @Body() updateRuleDto: UpdateRuleDto) {
    return this.rulesService.update(id, updateRuleDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Partially update a rule' })
  @ApiResponse({ status: 200, description: 'The rule has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  patch(@Param('id') id: string, @Body() updateRuleDto: UpdateRuleDto) {
    return this.rulesService.update(id, updateRuleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a rule' })
  @ApiResponse({ status: 200, description: 'The rule has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  remove(@Param('id') id: string) {
    return this.rulesService.remove(id);
  }
}
