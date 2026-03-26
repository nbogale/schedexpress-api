import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Request
} from '@nestjs/common';
import { ParentGuardiansService } from './parent-guardians.service';
import { CreateParentGuardianDto } from './dto/create-parent-guardian.dto';
import { UpdateParentGuardianDto } from './dto/update-parent-guardian.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { AssignParentToStudentDto, ParentRole } from './dto/assign-parent-to-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('parent-guardians')
@ApiTags('Parent Guardians')  
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentGuardiansController {
  constructor(private readonly parentGuardiansService: ParentGuardiansService) {}

  @Post()
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  create(@Body() createParentGuardianDto: CreateParentGuardianDto) {
    return this.parentGuardiansService.create(createParentGuardianDto);
  }

  @Get()
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  findAll() {
    return this.parentGuardiansService.findAll();
  }

  //get current parent/guardian
  @Get('current')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT_GUARDIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current parent/guardian' })
  @ApiResponse({ status: 200, description: 'Return current parent/guardian' })
  @ApiResponse({ status: 404, description: 'Parent/Guardian not found' })
  getCurrentParentGuardian(@Request() req: any) {
    return this.parentGuardiansService.getCurrentParentGuardian(req.user);
  }

  @Get(':id')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  findOne(@Param('id') id: string) {
    return this.parentGuardiansService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  update(@Param('id') id: string, @Body() updateParentGuardianDto: UpdateParentGuardianDto) {
    return this.parentGuardiansService.update(id, updateParentGuardianDto);
  }

  @Delete(':id')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.parentGuardiansService.remove(id);
  }

  @Patch(':id/notification-preferences')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  updateNotificationPreferences(
    @Param('id') id: string,
    @Body() updatePreferencesDto: UpdateNotificationPreferencesDto
  ) {
    return this.parentGuardiansService.updateNotificationPreferences(id, updatePreferencesDto);
  }

  @Post('assign-to-student')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  assignToStudent(@Body() assignDto: AssignParentToStudentDto) {
    return this.parentGuardiansService.assignToStudent(assignDto);
  }

  @Delete('students/:studentId/parents/:role')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromStudent(
    @Param('studentId') studentId: string,
    @Param('role') role: ParentRole
  ) {
    return this.parentGuardiansService.removeFromStudent(studentId, role);
  }

  @Get(':id/students')
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.COUNSELOR, UserRole.PARENT_GUARDIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students by parent' })
  @ApiResponse({ status: 200, description: 'Return students by parent' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  getStudentsByParent(@Param('id') id: string, @Request() req: any) {
    return this.parentGuardiansService.getStudentsByParent(id, req.user);
  }

  @Get('students/:studentId/parents')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  getParentByStudent(@Param('studentId') studentId: string) {
    return this.parentGuardiansService.getParentByStudent(studentId);
  }
}
