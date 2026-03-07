import { BadRequestException, Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ChangePasswordActivateDto } from './dto/change-password-activate.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, UserStatus } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'The user has been successfully created',
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('username') username?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const hasPaginationQuery = !!page || !!limit || !!name || !!email || !!username || !!role || !!status;
    if (!hasPaginationQuery) {
      return this.usersService.findAll();
    }

    const parsedPage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
    const parsedLimit = Number.isFinite(Number(limit))
      ? Math.min(100, Math.max(1, Number(limit)))
      : 10;

    let parsedRole: UserRole | undefined;
    if (role) {
      const isValidRole = (Object.values(UserRole) as string[]).includes(role);
      if (!isValidRole) {
        throw new BadRequestException('Invalid role filter');
      }
      parsedRole = role as UserRole;
    }

    let parsedStatus: UserStatus | undefined;
    if (status) {
      const isValidStatus = (Object.values(UserStatus) as string[]).includes(status);
      if (!isValidStatus) {
        throw new BadRequestException('Invalid status filter');
      }
      parsedStatus = status as UserStatus;
    }

    return this.usersService.findAllPaginated({
      page: parsedPage,
      limit: parsedLimit,
      name: name?.trim() || undefined,
      email: email?.trim() || undefined,
      username: username?.trim() || undefined,
      role: parsedRole,
      status: parsedStatus,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user status with history tracking' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid status change' })
  updateUserStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateUserStatusDto,
    @Request() req: any
  ) {
    return this.usersService.updateUserStatus(id, updateStatusDto, req.user.id);
  }

  @Get(':id/status-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user status change history' })
  @ApiResponse({ status: 200, description: 'Return user status history' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserStatusHistory(@Param('id') id: string) {
    return this.usersService.getUserStatusHistory(id);
  }

  @Get(':id/account-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user account activity history' })
  @ApiResponse({ status: 200, description: 'Return user account history' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserAccountHistory(@Param('id') id: string) {
    return this.usersService.getUserAccountHistory(id);
  }

  @Put(':id/unlock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlock a user account' })
  @ApiResponse({ status: 200, description: 'Account unlocked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Account is not locked' })
  unlockAccount(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req: any
  ) {
    return this.usersService.unlockAccount(id, req.user.id, body.reason);
  }

  @Get(':id/account-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check user account status and lock status' })
  @ApiResponse({ status: 200, description: 'Return account status information' })
  @ApiResponse({ status: 404, description: 'User not found' })
  checkAccountStatus(@Param('id') id: string) {
    return this.usersService.checkAccountStatus(id);
  }

  @Post(':id/ensure-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ensure user account exists for existing users' })
  @ApiResponse({ status: 200, description: 'User account created or already exists' })
  @ApiResponse({ status: 404, description: 'User not found' })
  ensureUserAccountExists(@Param('id') id: string) {
    return this.usersService.ensureUserAccountExists(id);
  }

  @Post(':id/change-password-activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password and activate account for PENDING_ACTIVATION users' })
  @ApiResponse({ status: 200, description: 'Password changed and account activated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password or user not in PENDING_ACTIVATION status' })
  @ApiResponse({ status: 404, description: 'User not found' })
  changePasswordAndActivate(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordActivateDto
  ) {
    return this.usersService.changePasswordAndActivate(
      id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
  }
}
