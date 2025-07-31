import { Module } from '@nestjs/common';
import { ScheduleChangesService } from './schedule-changes.service';
import { ScheduleChangesController } from './schedule-changes.controller';
import { CoursesModule } from '../courses/courses.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [CoursesModule, NotificationsModule],
  controllers: [ScheduleChangesController],
  providers: [ScheduleChangesService],
  exports: [ScheduleChangesService],
})
export class ScheduleChangesModule {}
