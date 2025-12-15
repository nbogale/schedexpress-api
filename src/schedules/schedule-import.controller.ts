import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Res,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
// Note: ScheduleImportStatus will be available after Prisma client regeneration
import { ScheduleImportService } from './schedule-import.service';
import { UploadScheduleImportDto } from './dto/upload-schedule-import.dto';

@ApiTags('Schedule Import')
@Controller('schedules/import')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ScheduleImportController {
  constructor(
    private readonly scheduleImportService: ScheduleImportService,
  ) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload CSV file to import student schedules' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded and import started successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or data' })
  async uploadScheduleImport(
    @UploadedFile() file: any,
    @Body() body: { academicCycleName: string; overrideExisting?: string },
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!body.academicCycleName) {
      throw new BadRequestException('Academic cycle name is required');
    }

    const overrideExisting = body.overrideExisting === 'true' || body.overrideExisting === '1';

    try {
      const result = await this.scheduleImportService.processScheduleImport(
        file,
        body.academicCycleName,
        req.user.id,
        overrideExisting,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // Check if this is an existing imports error
      if (error.response?.errorCode === 'SCHIMP001' || (error as any).existingImports) {
        return {
          success: false,
          errorCode: 'SCHIMP001',
          message: error.response?.message || 'Existing imports found for this academic cycle',
          existingImports: error.response?.existingImports || (error as any).existingImports,
        };
      }

      throw error;
    }
  }

  @Get('check-existing/:academicCycleId')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiOperation({
    summary: 'Check if there are existing completed imports for an academic cycle',
  })
  @ApiParam({
    name: 'academicCycleId',
    description: 'ID of the academic cycle',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Return list of existing imports',
  })
  async checkExistingImports(@Param('academicCycleId') academicCycleId: string) {
    const existingImports =
      await this.scheduleImportService.checkExistingImports(academicCycleId);

    return {
      success: true,
      data: existingImports,
    };
  }

  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiOperation({ summary: 'Get schedule import history' })
  @ApiQuery({
    name: 'academicCycleId',
    required: false,
    description: 'Filter by academic cycle ID',
    type: String,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by import status (PENDING, PROCESSING, COMPLETED_SUCCESS, etc.)',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Return import history with pagination',
  })
  async getImportHistory(
    @Query('academicCycleId') academicCycleId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.scheduleImportService.getImportHistory({
      academicCycleId,
      status,
      page: page ? parseInt(page.toString(), 10) : undefined,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
    });

    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiOperation({ summary: 'Get detailed import file information' })
  @ApiParam({
    name: 'id',
    description: 'Import file ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Return import file details',
  })
  @ApiResponse({ status: 404, description: 'Import file not found' })
  async getImportFile(@Param('id') id: string) {
    const importFile =
      await this.scheduleImportService.getImportFileById(id);

    return {
      success: true,
      data: importFile,
    };
  }

  @Get(':id/details')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiOperation({ summary: 'Get paginated import details (row-level data)' })
  @ApiParam({
    name: 'id',
    description: 'Import file ID',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Return import details with pagination',
  })
  async getImportDetails(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.scheduleImportService.getImportDetails(
      id,
      page ? parseInt(page.toString(), 10) : undefined,
      limit ? parseInt(limit.toString(), 10) : undefined,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Post(':id/retry')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiOperation({
    summary: 'Retry failed rows from an import (placeholder for future implementation)',
  })
  @ApiParam({
    name: 'id',
    description: 'Import file ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Retry initiated',
  })
  async retryImport(@Param('id') id: string) {
    // TODO: Implement retry logic
    return {
      success: false,
      message: 'Retry functionality is not yet implemented',
    };
  }

  @Get('template/csv')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiOperation({ summary: 'Download CSV template for schedule import' })
  @ApiResponse({
    status: 200,
    description: 'Return CSV template file',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async downloadTemplate(@Res() res: Response) {
    const csvTemplate = this.scheduleImportService.generateCSVTemplate();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="schedule_import_template.csv"',
    );
    res.send(csvTemplate);
  }
}

