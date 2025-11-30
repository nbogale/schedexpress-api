import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AcademicCyclesModule } from '../academic-cycles/academic-cycles.module';

@Module({
  imports: [NotificationsModule, AcademicCyclesModule],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
