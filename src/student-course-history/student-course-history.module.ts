import { Module } from '@nestjs/common';
import { StudentCourseHistoryController } from './student-course-history.controller';
import { StudentCourseHistoryService } from './student-course-history.service';
import { GradeLookupModule } from '../grade-lookup/grade-lookup.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [GradeLookupModule, NotificationsModule],
  controllers: [StudentCourseHistoryController],
  providers: [StudentCourseHistoryService],
  exports: [StudentCourseHistoryService],
})
export class StudentCourseHistoryModule {} 