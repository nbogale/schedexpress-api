import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AcademicPeriodBusinessRulesService } from './academic-period-business-rules.service';
import {
  AcademicPeriodBusinessRulesResponseDto,
  UpdateAcademicPeriodBusinessRulesDto,
} from './dto/academic-period-business-rules.dto';
import { AcademicPeriodBusinessRules } from './interfaces/academic-period-business-rules.interface';

@ApiTags('Academic Period Business Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('academic-period-business-rules')
export class AcademicPeriodBusinessRulesController {
  constructor(
    private readonly businessRulesService: AcademicPeriodBusinessRulesService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all academic period business rules' })
  @ApiResponse({
    status: 200,
    description: 'Business rules retrieved successfully',
    type: AcademicPeriodBusinessRulesResponseDto,
  })
  async getBusinessRules(): Promise<AcademicPeriodBusinessRules> {
    return this.businessRulesService.getBusinessRules();
  }

  @Get('enrollment')
  @ApiOperation({ summary: 'Get enrollment business rules' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment rules retrieved successfully',
  })
  async getEnrollmentRules() {
    return this.businessRulesService.getRuleCategory('enrollment');
  }

  @Get('schedule-change')
  @ApiOperation({ summary: 'Get schedule change business rules' })
  @ApiResponse({
    status: 200,
    description: 'Schedule change rules retrieved successfully',
  })
  async getScheduleChangeRules() {
    return this.businessRulesService.getRuleCategory('scheduleChange');
  }

  @Get('grading')
  @ApiOperation({ summary: 'Get grading business rules' })
  @ApiResponse({
    status: 200,
    description: 'Grading rules retrieved successfully',
  })
  async getGradingRules() {
    return this.businessRulesService.getRuleCategory('grading');
  }

  @Get('instruction')
  @ApiOperation({ summary: 'Get instruction business rules' })
  @ApiResponse({
    status: 200,
    description: 'Instruction rules retrieved successfully',
  })
  async getInstructionRules() {
    return this.businessRulesService.getRuleCategory('instruction');
  }

  @Get('break-period')
  @ApiOperation({ summary: 'Get break period business rules' })
  @ApiResponse({
    status: 200,
    description: 'Break period rules retrieved successfully',
  })
  async getBreakPeriodRules() {
    return this.businessRulesService.getRuleCategory('breakPeriod');
  }

  @Put()
  @ApiOperation({ summary: 'Update academic period business rules' })
  @ApiResponse({
    status: 200,
    description: 'Business rules updated successfully',
    type: AcademicPeriodBusinessRulesResponseDto,
  })
  async updateBusinessRules(
    @Body() updateDto: UpdateAcademicPeriodBusinessRulesDto
  ): Promise<AcademicPeriodBusinessRules> {
    
    return this.businessRulesService.updateBusinessRules(updateDto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset business rules to default values' })
  @ApiResponse({
    status: 200,
    description: 'Business rules reset to defaults successfully',
    type: AcademicPeriodBusinessRulesResponseDto,
  })
  async resetToDefaults(): Promise<AcademicPeriodBusinessRules> {
    return this.businessRulesService.resetToDefaults();
  }
}

