import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { ScheduleImportService } from './schedule-import.service';
import { ScheduleImportController } from './schedule-import.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AcademicCyclesModule } from '../academic-cycles/academic-cycles.module';

@Module({
  imports: [NotificationsModule, AcademicCyclesModule],
  controllers: [SchedulesController, ScheduleImportController],
  providers: [SchedulesService, ScheduleImportService],
  exports: [SchedulesService, ScheduleImportService],
})
export class SchedulesModule {}
