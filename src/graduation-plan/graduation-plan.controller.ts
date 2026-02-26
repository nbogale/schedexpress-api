import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GraduationPlanService } from './graduation-plan.service';
import { CreateGraduationPlanDto } from './dto/create-graduation-plan.dto';
import { UpdateGraduationPlanDto } from './dto/update-graduation-plan.dto';
import { AddCourseToPlanDto } from './dto/add-course-to-plan.dto';
import { SubstituteCourseDto } from './dto/substitute-course.dto';
import { RejectPlanDto } from './dto/reject-plan.dto';
import { ApprovePlanDto } from './dto/approve-plan.dto';
import { CreatePlanNoteDto } from './dto/create-plan-note.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('graduation-plan')
@Controller('graduation-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GraduationPlanController {
  constructor(private readonly graduationPlanService: GraduationPlanService) {}

  // ============================================
  // Plan CRUD
  // ============================================

  @Post()
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Create a new graduation plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async createPlan(@Body() createDto: CreateGraduationPlanDto, @Request() req) {
    return this.graduationPlanService.createPlan(createDto, req.user.id);
  }

  @Get('student/:studentId')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all plans for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'graduationYear', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of plans' })
  async getPlansByStudent(
    @Param('studentId') studentId: string,
    @Query('graduationYear') graduationYear?: number,
  ) {
    return this.graduationPlanService.getPlansByStudent(
      studentId,
      graduationYear ? Number(graduationYear) : undefined,
    );
  }

  @Get('student/:studentId/active')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get active plan for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Active plan' })
  @ApiResponse({ status: 404, description: 'No active plan found' })
  async getActivePlan(@Param('studentId') studentId: string) {
    return this.graduationPlanService.getActivePlan(studentId);
  }

  @Get(':planId')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get a specific plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan details' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlan(@Param('planId') planId: string) {
    return this.graduationPlanService.getPlan(planId);
  }

  @Put(':planId')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Update a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 400, description: 'Cannot update plan in current status' })
  async updatePlan(
    @Param('planId') planId: string,
    @Body() updateDto: UpdateGraduationPlanDto,
    @Request() req,
  ) {
    return this.graduationPlanService.updatePlan(planId, updateDto, req.user.id);
  }

  // ============================================
  // Course Management
  // ============================================

  @Post(':planId/courses')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Add a course to a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 201, description: 'Course added successfully' })
  @ApiResponse({ status: 404, description: 'Plan or course not found' })
  @ApiResponse({ status: 400, description: 'Cannot modify plan in current status' })
  async addCourseToPlan(
    @Param('planId') planId: string,
    @Body() addCourseDto: AddCourseToPlanDto,
    @Request() req,
  ) {
    return this.graduationPlanService.addCourseToPlan(planId, addCourseDto, req.user.id);
  }

  @Delete(':planId/courses/:courseId')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Remove a course from a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course removed successfully' })
  @ApiResponse({ status: 404, description: 'Plan or course not found' })
  @ApiResponse({ status: 400, description: 'Cannot modify plan in current status' })
  async removeCourseFromPlan(
    @Param('planId') planId: string,
    @Param('courseId') courseId: string,
    @Request() req,
  ) {
    await this.graduationPlanService.removeCourseFromPlan(planId, courseId, req.user.id);
    return { message: 'Course removed from plan successfully' };
  }

  @Post(':planId/substitute-course')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Substitute a course in a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Course substituted successfully' })
  @ApiResponse({ status: 404, description: 'Plan or course not found' })
  @ApiResponse({ status: 400, description: 'Cannot modify plan in current status' })
  async substituteCourse(
    @Param('planId') planId: string,
    @Body() substituteDto: SubstituteCourseDto,
    @Request() req,
  ) {
    return this.graduationPlanService.substituteCourseInPlan(planId, substituteDto, req.user.id);
  }

  // ============================================
  // Approval Workflow
  // ============================================

  @Post(':planId/submit')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Submit plan for approval' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan submitted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 400, description: 'Cannot submit plan in current status' })
  async submitPlan(@Param('planId') planId: string, @Request() req) {
    return this.graduationPlanService.submitPlanForApproval(planId, req.user.id);
  }

  @Post(':planId/approve')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Approve a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan approved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 400, description: 'Cannot approve plan in current status' })
  async approvePlan(
    @Param('planId') planId: string,
    @Body() approveDto: ApprovePlanDto,
    @Request() req,
  ) {
    return this.graduationPlanService.approvePlan(planId, req.user.id, approveDto.note);
  }

  @Post(':planId/reject')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Reject a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan rejected successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 400, description: 'Cannot reject plan in current status' })
  async rejectPlan(
    @Param('planId') planId: string,
    @Body() rejectDto: RejectPlanDto,
    @Request() req,
  ) {
    return this.graduationPlanService.rejectPlan(planId, rejectDto, req.user.id);
  }

  // ============================================
  // Plan Notes
  // ============================================

  @Post(':planId/notes')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Add a note to a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 201, description: 'Note added successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async addNote(
    @Param('planId') planId: string,
    @Body() noteDto: CreatePlanNoteDto,
    @Request() req,
  ) {
    return this.graduationPlanService.addNoteToPlan(planId, noteDto, req.user.id);
  }

  @Get(':planId/notes')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all notes for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'List of notes' })
  async getPlanNotes(@Param('planId') planId: string) {
    return this.graduationPlanService.getPlanNotes(planId);
  }

  @Post('notes/:noteId/complete')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Mark an action item as completed' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Action item completed successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @ApiResponse({ status: 400, description: 'Note is not an action item' })
  async completeActionItem(@Param('noteId') noteId: string, @Request() req) {
    return this.graduationPlanService.completeActionItem(noteId, req.user.id);
  }

  // ============================================
  // Validation & Sync
  // ============================================

  @Post(':planId/validate-prerequisites')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Validate plan prerequisites' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Validation results' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async validatePrerequisites(@Param('planId') planId: string) {
    return this.graduationPlanService.validatePlanPrerequisites(planId);
  }

  @Post(':planId/sync')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Sync plan with student progress' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan synced successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async syncPlan(@Param('planId') planId: string) {
    return this.graduationPlanService.syncPlanWithProgress(planId);
  }
}
