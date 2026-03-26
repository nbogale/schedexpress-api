import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AcademicSettingsService } from './academic-settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateAcademicSettingsDto, AcademicSettingsResponseDto } from './dto/academic-settings.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly academicSettingsService: AcademicSettingsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, description: 'Return settings' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update system settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }

  @Get('academic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get academic settings' })
  @ApiResponse({ status: 200, description: 'Return academic settings', type: AcademicSettingsResponseDto })
  getAcademicSettings() {
    return this.academicSettingsService.getAcademicSettings();
  }

  @Put('academic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update academic settings' })
  @ApiResponse({ status: 200, description: 'Academic settings updated successfully' })
  updateAcademicSettings(@Body() updateDto: UpdateAcademicSettingsDto) {
    return this.academicSettingsService.updateAcademicSettings(updateDto);
  }

  @Get('academic/period-defaults')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get default period configuration' })
  @ApiResponse({ status: 200, description: 'Return default period configuration' })
  getDefaultPeriodConfiguration() {
    return this.academicSettingsService.getDefaultPeriodConfiguration();
  }

  @Get('academic/period-rules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get academic period business rules' })
  @ApiResponse({ status: 200, description: 'Return academic period business rules' })
  getAcademicPeriodRules() {
    return this.academicSettingsService.getAcademicPeriodRules();
  }
}
