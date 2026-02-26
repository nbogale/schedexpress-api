import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { GraduationAuditService } from './graduation-audit.service';
import { CreateGraduationRequirementDto } from './dto/create-graduation-requirement.dto';
import { UpdateGraduationRequirementDto } from './dto/update-graduation-requirement.dto';
import { RunAuditDto } from './dto/run-audit.dto';
import { AllocateCourseDto } from './dto/allocate-course.dto';
import { WaiveRequirementDto } from './dto/waive-requirement.dto';
import { CreateAuditNoteDto } from './dto/create-audit-note.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('graduation-audit')
@Controller('graduation-audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GraduationAuditController {
  constructor(private readonly graduationAuditService: GraduationAuditService) {}

  // ============================================
  // Graduation Requirement Management
  // ============================================

  @Post('requirements')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiOperation({ summary: 'Create a new graduation requirement' })
  @ApiResponse({ status: 201, description: 'Requirement created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createRequirement(
    @Body() createDto: CreateGraduationRequirementDto,
    @Request() req,
  ) {
    return this.graduationAuditService.createRequirement(createDto, req.user.id);
  }

  @Get('requirements')
  @ApiOperation({ summary: 'Get all graduation requirements' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, description: 'Only return active requirements' })
  @ApiResponse({ status: 200, description: 'List of requirements' })
  async getAllRequirements(@Query('activeOnly') activeOnly?: boolean) {
    return this.graduationAuditService.getAllRequirements(activeOnly === true);
  }

  @Get('requirements/:id')
  @ApiOperation({ summary: 'Get a specific graduation requirement' })
  @ApiParam({ name: 'id', description: 'Requirement ID' })
  @ApiResponse({ status: 200, description: 'Requirement details' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  async getRequirement(@Param('id') id: string) {
    return this.graduationAuditService.getRequirement(id);
  }

  @Patch('requirements/:id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.COUNSELOR)
  @ApiOperation({ summary: 'Update a graduation requirement' })
  @ApiParam({ name: 'id', description: 'Requirement ID' })
  @ApiResponse({ status: 200, description: 'Requirement updated successfully' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  async updateRequirement(
    @Param('id') id: string,
    @Body() updateDto: UpdateGraduationRequirementDto,
  ) {
    return this.graduationAuditService.updateRequirement(id, updateDto);
  }

  @Delete('requirements/:id')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Delete a graduation requirement' })
  @ApiParam({ name: 'id', description: 'Requirement ID' })
  @ApiResponse({ status: 200, description: 'Requirement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete requirement with audit records' })
  async deleteRequirement(@Param('id') id: string) {
    return this.graduationAuditService.deleteRequirement(id);
  }

  // ============================================
  // Audit Execution
  // ============================================

  @Post('student/:studentId/run')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Run graduation audit for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'graduationYear', required: true, type: Number, description: 'Graduation year (e.g., 2025)' })
  @ApiQuery({ name: 'academicCycleId', required: false, type: String, description: 'Academic cycle ID (optional)' })
  @ApiResponse({ status: 200, description: 'Audit results' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async runAudit(
    @Param('studentId') studentId: string,
    @Query('graduationYear') graduationYear: number,
    @Query('academicCycleId') academicCycleId?: string,
    @Request() req?: any,
  ) {
    try {
      return await this.graduationAuditService.runAudit(
        studentId,
        Number(graduationYear),
        academicCycleId,
        req?.user?.id,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('student/:studentId')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all audit results for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'graduationYear', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'List of audit results' })
  async getStudentAudits(
    @Param('studentId') studentId: string,
    @Query('graduationYear') graduationYear: number,
  ) {
    return this.graduationAuditService.getAuditSummary(studentId, Number(graduationYear));
  }

  @Get('student/:studentId/summary')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get audit summary for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'graduationYear', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Audit summary' })
  async getAuditSummary(
    @Param('studentId') studentId: string,
    @Query('graduationYear') graduationYear: number,
  ) {
    return this.graduationAuditService.getAuditSummary(studentId, Number(graduationYear));
  }

  @Get('student/:studentId/deficiencies')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Get unmet requirements (deficiencies) for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'graduationYear', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'List of deficiencies' })
  async getDeficiencies(
    @Param('studentId') studentId: string,
    @Query('graduationYear') graduationYear: number,
  ) {
    return this.graduationAuditService.getDeficiencies(studentId, Number(graduationYear));
  }

  @Get('student/:studentId/breakdown')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Get detailed audit breakdown showing course allocations' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'graduationYear', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Detailed breakdown' })
  async getDetailedBreakdown(
    @Param('studentId') studentId: string,
    @Query('graduationYear') graduationYear: number,
  ) {
    return this.graduationAuditService.getDetailedBreakdown(studentId, Number(graduationYear));
  }

  // ============================================
  // Course Allocation
  // ============================================

  @Post('allocate-course')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Allocate a course to a requirement' })
  @ApiResponse({ status: 201, description: 'Course allocated successfully' })
  @ApiResponse({ status: 404, description: 'Course history, requirement, or audit not found' })
  async allocateCourse(
    @Body() allocateDto: AllocateCourseDto,
    @Request() req,
  ) {
    return this.graduationAuditService.allocateCourseToRequirement(allocateDto, req.user.id);
  }

  @Post('resolve-conflict')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Resolve multi-category course conflict' })
  @ApiResponse({ status: 200, description: 'Conflict resolved successfully' })
  async resolveConflict(
    @Body() body: { courseHistoryId: string; requirementId: string; auditId: string },
    @Request() req,
  ) {
    return this.graduationAuditService.resolveMultiCategoryConflict(
      body.courseHistoryId,
      body.requirementId,
      body.auditId,
      req.user.id,
    );
  }

  // ============================================
  // Requirement Waiver
  // ============================================

  @Post('audit/:auditId/waive')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Waive a graduation requirement' })
  @ApiParam({ name: 'auditId', description: 'Audit ID' })
  @ApiResponse({ status: 200, description: 'Requirement waived successfully' })
  @ApiResponse({ status: 404, description: 'Audit not found' })
  async waiveRequirement(
    @Param('auditId') auditId: string,
    @Body() waiveDto: WaiveRequirementDto,
    @Request() req,
  ) {
    return this.graduationAuditService.waiveRequirement(auditId, req.user.id, waiveDto);
  }

  // ============================================
  // Audit Notes
  // ============================================

  @Post('audit/:auditId/notes')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Add a note to an audit' })
  @ApiParam({ name: 'auditId', description: 'Audit ID' })
  @ApiResponse({ status: 201, description: 'Note added successfully' })
  @ApiResponse({ status: 404, description: 'Audit not found' })
  async addNote(
    @Param('auditId') auditId: string,
    @Body() noteDto: CreateAuditNoteDto,
    @Request() req,
  ) {
    return this.graduationAuditService.addNoteToAudit(auditId, noteDto, req.user.id);
  }

  @Post('notes/:noteId/complete')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Mark an action item as completed' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Action item completed successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @ApiResponse({ status: 400, description: 'Note is not an action item' })
  async completeActionItem(
    @Param('noteId') noteId: string,
    @Request() req,
  ) {
    return this.graduationAuditService.completeActionItem(noteId, req.user.id);
  }

  @Get('audit/:auditId/notes')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Get all notes for an audit' })
  @ApiParam({ name: 'auditId', description: 'Audit ID' })
  @ApiResponse({ status: 200, description: 'List of notes' })
  async getAuditNotes(@Param('auditId') auditId: string) {
    return this.graduationAuditService.getAuditNotes(auditId);
  }

  // ============================================
  // Bulk Operations
  // ============================================

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Run audit for multiple students' })
  @ApiResponse({ status: 200, description: 'Bulk audit results' })
  async bulkAudit(
    @Body() body: { studentIds: string[]; graduationYear: number },
    @Request() req,
  ) {
    return this.graduationAuditService.bulkAudit(
      body.studentIds,
      body.graduationYear,
      req.user.id,
    );
  }
}
