import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ScheduleChangesModule } from './schedule-change-requests/schedule-changes.module';
import { ConflictsModule } from './course-conflicts/conflicts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { CourseRulesModule } from './course-rules/course-rules.module';
import { RulesModule } from './rules/rules.module';
import { StudentsModule } from './students/students.module';
import { RoomsModule } from './rooms/rooms.module';
import { DepartmentsModule } from './departments/departments.module';
import { TimeBlocksModule } from './time-blocks/time-blocks.module';
import { TermsModule } from './terms/terms.module';
import { SchoolYearsModule } from './school-years/school-years.module';
import { CourseLevelsModule } from './course-levels/course-levels.module';
import { GradeLevelsModule } from './grade-levels/grade-levels.module';

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
    ScheduleChangesModule,
    ConflictsModule,
    NotificationsModule,
    SettingsModule,
    CourseRulesModule,
    RulesModule,
    StudentsModule,
    RoomsModule,
    DepartmentsModule,
    TimeBlocksModule,
    TermsModule,
    SchoolYearsModule,
    CourseLevelsModule,
    GradeLevelsModule,
  ],
})
export class AppModule {}
