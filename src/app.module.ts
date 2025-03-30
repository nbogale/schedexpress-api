import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ScheduleChangeRequestsModule } from './schedule-change-requests/schedule-change-requests.module';
import { ConflictsModule } from './conflicts/conflicts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    SchedulesModule,
    ScheduleChangeRequestsModule,
    ConflictsModule,
    NotificationsModule,
    SettingsModule,
  ],
})
export class AppModule {}
