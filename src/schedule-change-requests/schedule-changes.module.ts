import { Module } from '@nestjs/common';
import { ScheduleChangesService } from './schedule-changes.service';
import { ScheduleChangesController } from './schedule-changes.controller';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [CoursesModule],
  controllers: [ScheduleChangesController],
  providers: [ScheduleChangesService],
  exports: [ScheduleChangesService],
})
export class ScheduleChangesModule {}
