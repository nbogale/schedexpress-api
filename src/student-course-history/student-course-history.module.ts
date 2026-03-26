import { Module } from '@nestjs/common';
import { StudentCourseHistoryController } from './student-course-history.controller';
import { StudentCourseHistoryService } from './student-course-history.service';
import { GradeLookupModule } from '../grade-lookup/grade-lookup.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AcademicCyclesModule } from '../academic-cycles/academic-cycles.module';

@Module({
  imports: [GradeLookupModule, NotificationsModule, AcademicCyclesModule],
  controllers: [StudentCourseHistoryController],
  providers: [StudentCourseHistoryService],
  exports: [StudentCourseHistoryService],
})
export class StudentCourseHistoryModule {} 