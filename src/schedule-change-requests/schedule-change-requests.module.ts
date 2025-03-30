import { Module } from '@nestjs/common';
import { ScheduleChangeRequestsService } from './schedule-change-requests.service';
import { ScheduleChangeRequestsController } from './schedule-change-requests.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConflictsModule } from '../conflicts/conflicts.module';

@Module({
  imports: [NotificationsModule, ConflictsModule],
  controllers: [ScheduleChangeRequestsController],
  providers: [ScheduleChangeRequestsService],
  exports: [ScheduleChangeRequestsService],
})
export class ScheduleChangeRequestsModule {}
