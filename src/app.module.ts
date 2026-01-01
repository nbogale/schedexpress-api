import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

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
import { CourseLevelsModule } from './course-levels/course-levels.module';
import { GradeLevelsModule } from './grade-levels/grade-levels.module';
import { CourseSectionsModule } from './course-sections/course-sections.module';
import { CoursePrerequisitesModule } from './course-prerequisites/course-prerequisites.module';
import { CourseSequencesModule } from './course-sequences/course-sequences.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentCourseHistoryModule } from './student-course-history/student-course-history.module';
import { GradeLookupModule } from './grade-lookup/grade-lookup.module';
import { AcademicCyclesModule } from './academic-cycles/academic-cycles.module';
import { ParentGuardiansModule } from './parent-guardians/parent-guardians.module';
import { CoursePreferencesModule } from './course-preferences/course-preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
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
    CourseLevelsModule,
    GradeLevelsModule,
    CourseSectionsModule,
    CoursePrerequisitesModule,
    CourseSequencesModule,
    TeachersModule,
    StudentCourseHistoryModule,
    GradeLookupModule,
    AcademicCyclesModule,
    ParentGuardiansModule,
    CoursePreferencesModule,
  ],
})
export class AppModule {}
