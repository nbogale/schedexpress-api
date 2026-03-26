import { Module } from '@nestjs/common';
import { ScheduleChangesService } from './schedule-changes.service';
import { ScheduleChangesController } from './schedule-changes.controller';
import { CoursesModule } from '../courses/courses.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AcademicCyclesModule } from '../academic-cycles/academic-cycles.module';

@Module({
  imports: [CoursesModule, NotificationsModule, AcademicCyclesModule],
  controllers: [ScheduleChangesController],
  providers: [ScheduleChangesService],
  exports: [ScheduleChangesService],
})
export class ScheduleChangesModule {}
