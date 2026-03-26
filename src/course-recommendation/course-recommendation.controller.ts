import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CourseRecommendationService } from './course-recommendation.service';
import { GenerateRecommendationsDto } from './dto/generate-recommendations.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationStatus } from './recommendation.constants';

const RECOMMENDATION_STATUS_VALUES = Object.values(RecommendationStatus);

@ApiTags('course-recommendations')
@Controller('course-recommendations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CourseRecommendationController {
  constructor(
    private readonly courseRecommendationService: CourseRecommendationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Generate course recommendations for a student' })
  @ApiResponse({ status: 201, description: 'Recommendations generated successfully' })
  @ApiResponse({ status: 404, description: 'Student or academic cycle not found' })
  async generateRecommendations(
    @Body() generateDto: GenerateRecommendationsDto,
    @Request() req,
  ) {
    return this.courseRecommendationService.generateRecommendations(
      generateDto.studentId,
      generateDto.academicCycleId,
      req.user.id,
    );
  }

  @Get('student/:studentId/cycle/:academicCycleId')
  @Roles(UserRole.STUDENT, UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Get recommendations for a student in a specific academic cycle' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiParam({ name: 'academicCycleId', description: 'Academic Cycle ID' })
  @ApiResponse({ status: 200, description: 'Return recommendations for the student in the cycle' })
  async getRecommendationsByCycle(
    @Param('studentId') studentId: string,
    @Param('academicCycleId') academicCycleId: string,
    @Request() req?: any,
  ) {
    if (req?.user?.role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId: req.user.id },
      });
      if (!student || student.id !== studentId) {
        throw new Error('Unauthorized: Can only view your own recommendations');
      }
    }
    return this.courseRecommendationService.getRecommendations(studentId, academicCycleId);
  }

  @Get('student/:studentId')
  @Roles(UserRole.STUDENT, UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Get recommendations for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'academicCycleId', required: false, type: String })
  @ApiQuery({ name: 'status', enum: RECOMMENDATION_STATUS_VALUES, required: false })
  @ApiResponse({ status: 200, description: 'Return recommendations for the student' })
  async getRecommendations(
    @Param('studentId') studentId: string,
    @Query('academicCycleId') academicCycleId?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    if (req?.user?.role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId: req.user.id },
      });
      if (!student || student.id !== studentId) {
        throw new Error('Unauthorized: Can only view your own recommendations');
      }
    }
    return this.courseRecommendationService.getRecommendations(
      studentId,
      academicCycleId,
      status,
    );
  }

  @Get('student/:studentId/deficiencies')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Get requirements without available courses' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'academicCycleId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Return requirements without courses' })
  async getRequirementsWithoutCourses(
    @Param('studentId') studentId: string,
    @Query('academicCycleId') academicCycleId: string,
  ) {
    return this.courseRecommendationService.flagRequirementsWithoutCourses(
      studentId,
      academicCycleId,
    );
  }

  @Post(':recommendationId/accept')
  @Roles(UserRole.STUDENT, UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Accept a course recommendation' })
  @ApiParam({ name: 'recommendationId', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Recommendation accepted successfully' })
  @ApiResponse({ status: 404, description: 'Recommendation not found' })
  async acceptRecommendation(
    @Param('recommendationId') recommendationId: string,
    @Request() req?: any,
  ) {
    return this.courseRecommendationService.acceptRecommendation(recommendationId, {
      userId: req?.user?.id,
      role: req?.user?.role,
    });
  }

  @Post(':recommendationId/reject')
  @Roles(UserRole.STUDENT, UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Reject a course recommendation' })
  @ApiParam({ name: 'recommendationId', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Recommendation rejected successfully' })
  @ApiResponse({ status: 404, description: 'Recommendation not found' })
  async rejectRecommendation(
    @Param('recommendationId') recommendationId: string,
    @Request() req?: any,
  ) {
    return this.courseRecommendationService.rejectRecommendation(recommendationId, {
      userId: req?.user?.id,
      role: req?.user?.role,
    });
  }

  @Get(':recommendationId')
  @Roles(UserRole.STUDENT, UserRole.COUNSELOR, UserRole.ADMIN, UserRole.PLATFORM_ADMIN, UserRole.PRINCIPAL)
  @ApiOperation({ summary: 'Get a specific recommendation' })
  @ApiParam({ name: 'recommendationId', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Return the recommendation' })
  @ApiResponse({ status: 404, description: 'Recommendation not found' })
  async getRecommendation(@Param('recommendationId') recommendationId: string) {
    return this.courseRecommendationService.getRecommendation(recommendationId);
  }
}
