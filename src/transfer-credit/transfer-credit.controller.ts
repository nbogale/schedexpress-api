import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransferCreditService } from './transfer-credit.service';
import { TranscriptUploadService } from './transcript-upload.service';
import { CreateTransferGradeDto } from './dto/create-transfer-grade.dto';
import { UpdateTransferGradeDto } from './dto/update-transfer-grade.dto';
import { MapTransferGradeDto } from './dto/map-transfer-grade.dto';
import { RejectTransferGradeDto } from './dto/reject-transfer-grade.dto';
import { GrantExceptionDto } from './dto/grant-exception.dto';
import { CreateTransferCreditMappingDto } from './dto/create-transfer-credit-mapping.dto';
import { UpdateTransferCreditMappingDto } from './dto/update-transfer-credit-mapping.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { TransferStatus } from '@prisma/client';
import { TransferCreditMappingService } from './transfer-credit-mapping.service';
import { PrismaService } from '../prisma/prisma.service';
import { MulterFile } from './uploaded-file.interface';

@ApiTags('transfer-credit')
@Controller('transfer-credit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransferCreditController {
  constructor(
    private readonly transferCreditService: TransferCreditService,
    private readonly mappingService: TransferCreditMappingService,
    private readonly transcriptUploadService: TranscriptUploadService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('grade')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Create transfer grade (manual entry)' })
  @ApiResponse({ status: 201, description: 'Transfer grade created' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async createTransferGrade(
    @Body() body: { studentId: string } & CreateTransferGradeDto,
    @Request() req,
  ) {
    const { studentId, ...dto } = body;
    return this.transferCreditService.createTransferGrade(
      studentId,
      dto,
      req.user.id,
    );
  }

  @Post('student/:studentId/transcript/upload')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload transcript file for a student (no parsing)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, sourceSchool: { type: 'string' }, sourceSchoolType: { type: 'string' }, sourceState: { type: 'string' }, notes: { type: 'string' } } } })
  @ApiParam({ name: 'studentId' })
  @ApiResponse({ status: 201, description: 'Transcript uploaded' })
  async uploadTranscript(
    @Param('studentId') studentId: string,
    @UploadedFile() file: MulterFile,
    @Request() req,
    @Body('sourceSchool') sourceSchool?: string,
    @Body('sourceSchoolType') sourceSchoolType?: string,
    @Body('sourceState') sourceState?: string,
    @Body('notes') notes?: string,
  ) {
    return this.transcriptUploadService.uploadTranscript(
      studentId,
      file,
      req.user.id,
      { sourceSchool, sourceSchoolType, sourceState, notes },
    );
  }

  @Get('student/:studentId/transcripts')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.STUDENT)
  @ApiOperation({ summary: 'List transcript uploads for a student' })
  @ApiParam({ name: 'studentId' })
  async getStudentTranscripts(
    @Param('studentId') studentId: string,
    @Request() req?: any,
  ) {
    if (req?.user?.role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('You can only view your own transcript uploads');
      }
    }
    return this.transcriptUploadService.getUploadsByStudent(studentId);
  }

  @Get('student/:studentId')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all transfer grades for a student' })
  @ApiParam({ name: 'studentId' })
  @ApiQuery({ name: 'status', required: false, enum: TransferStatus })
  async getTransferGrades(
    @Param('studentId') studentId: string,
    @Query('status') status?: TransferStatus,
    @Request() req?: any,
  ) {
    if (req?.user?.role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('You can only view your own transfer grades');
      }
    }
    return this.transferCreditService.getTransferGrades(studentId, status);
  }

  @Get(':transferGradeId')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Get single transfer grade' })
  @ApiParam({ name: 'transferGradeId' })
  async getTransferGrade(@Param('transferGradeId') transferGradeId: string) {
    return this.transferCreditService.getTransferGrade(transferGradeId);
  }

  @Put(':transferGradeId')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Update transfer grade (PENDING only)' })
  @ApiParam({ name: 'transferGradeId' })
  async updateTransferGrade(
    @Param('transferGradeId') transferGradeId: string,
    @Body() updateDto: UpdateTransferGradeDto,
    @Request() req,
  ) {
    return this.transferCreditService.updateTransferGrade(
      transferGradeId,
      updateDto,
      req.user.id,
    );
  }

  @Post(':transferGradeId/map')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Map transfer grade to internal course' })
  @ApiParam({ name: 'transferGradeId' })
  async mapTransferGrade(
    @Param('transferGradeId') transferGradeId: string,
    @Body() dto: MapTransferGradeDto,
    @Request() req,
  ) {
    return this.transferCreditService.mapTransferGrade(
      transferGradeId,
      dto.mappedCourseId,
      req.user.id,
    );
  }

  @Post(':transferGradeId/unmap')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Remove course mapping from transfer grade' })
  @ApiParam({ name: 'transferGradeId' })
  async unmapTransferGrade(
    @Param('transferGradeId') transferGradeId: string,
    @Request() req,
  ) {
    return this.transferCreditService.unmapTransferGrade(
      transferGradeId,
      req.user.id,
    );
  }

  @Post(':transferGradeId/approve')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Approve transfer grade (creates course history)' })
  @ApiParam({ name: 'transferGradeId' })
  @ApiQuery({ name: 'academicCycleId', required: false })
  async approveTransferGrade(
    @Param('transferGradeId') transferGradeId: string,
    @Request() req,
    @Query('academicCycleId') academicCycleId?: string,
  ) {
    return this.transferCreditService.approveTransferGrade(
      transferGradeId,
      req.user.id,
      academicCycleId,
    );
  }

  @Post(':transferGradeId/reject')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Reject transfer grade' })
  @ApiParam({ name: 'transferGradeId' })
  async rejectTransferGrade(
    @Param('transferGradeId') transferGradeId: string,
    @Body() dto: RejectTransferGradeDto,
    @Request() req,
  ) {
    return this.transferCreditService.rejectTransferGrade(
      transferGradeId,
      req.user.id,
      dto.rejectionReason,
    );
  }

  @Post(':transferGradeId/exception')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Grant exception for transfer grade' })
  @ApiParam({ name: 'transferGradeId' })
  async grantException(
    @Param('transferGradeId') transferGradeId: string,
    @Body() dto: GrantExceptionDto,
    @Request() req,
  ) {
    return this.transferCreditService.grantException(
      transferGradeId,
      req.user.id,
      dto,
    );
  }

  @Get(':transferGradeId/history')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Get transfer grade history' })
  @ApiParam({ name: 'transferGradeId' })
  async getTransferGradeHistory(
    @Param('transferGradeId') transferGradeId: string,
  ) {
    return this.transferCreditService.getTransferGradeHistory(transferGradeId);
  }

  // Mappings (for auto-mapping and admin)
  @Post('mappings')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Create transfer credit mapping rule' })
  async createMapping(
    @Body() dto: CreateTransferCreditMappingDto,
    @Request() req,
  ) {
    return this.mappingService.createMapping(dto, req.user.id);
  }

  @Get('mappings/list')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'List transfer credit mappings' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async getMappings(@Query('activeOnly') activeOnly?: boolean) {
    return this.mappingService.getMappings(
      activeOnly === true ? { isActive: true } : undefined,
    );
  }

  @Patch('mappings/:mappingId')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Update transfer credit mapping rule' })
  @ApiParam({ name: 'mappingId' })
  async updateMapping(
    @Param('mappingId') mappingId: string,
    @Body() dto: UpdateTransferCreditMappingDto,
  ) {
    return this.mappingService.updateMapping(mappingId, dto);
  }

  @Delete('mappings/:mappingId')
  @Roles(UserRole.COUNSELOR, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Delete transfer credit mapping rule' })
  @ApiParam({ name: 'mappingId' })
  async deleteMapping(@Param('mappingId') mappingId: string) {
    return this.mappingService.deleteMapping(mappingId);
  }
}
