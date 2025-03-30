import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ConflictsService } from './conflicts.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Conflicts')
@Controller('conflicts')
export class ConflictsController {
  constructor(private readonly conflictsService: ConflictsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all conflicts' })
  @ApiResponse({ status: 200, description: 'Return all conflicts' })
  findAll() {
    return this.conflictsService.findAll();
  }

  @Get('request/:requestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get conflicts by request ID' })
  @ApiResponse({ status: 200, description: 'Return conflicts for the request' })
  findByRequest(@Param('requestId') requestId: string) {
    return this.conflictsService.findByRequest(requestId);
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve a conflict' })
  @ApiResponse({ status: 200, description: 'The conflict has been resolved' })
  resolveConflict(@Param('id') id: string) {
    return this.conflictsService.resolveConflict(id);
  }
}
