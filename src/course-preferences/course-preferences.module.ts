import { Module } from '@nestjs/common';
import { CoursePreferencesService } from './course-preferences.service';
import { CoursePreferencesController } from './course-preferences.controller';
import { PrerequisiteValidationService } from './prerequisite-validation.service';
import { DemandAnalyticsService } from './demand-analytics.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoursePreferencesController],
  providers: [CoursePreferencesService, PrerequisiteValidationService, DemandAnalyticsService],
  exports: [CoursePreferencesService, PrerequisiteValidationService, DemandAnalyticsService],
})
export class CoursePreferencesModule {}

