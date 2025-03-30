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
import { CourseRulesModule } from './course-rules/course-rules.module';
import { RulesModule } from './rules/rules.module';
import { StudentsModule } from './students/students.module';

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
    CourseRulesModule,
    RulesModule,
    StudentsModule,
  ],
})
export class AppModule {}
