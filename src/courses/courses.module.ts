import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoursePrerequisitesService } from 'src/course-prerequisites/course-prerequisites.service';
import { CourseSequencesController } from 'src/course-sequences/course-sequences.controller';
import { CourseSequencesService } from 'src/course-sequences/course-sequences.service';
import { CoursePrerequisitesController } from 'src/course-prerequisites/course-prerequisites.controller';

@Module({
  controllers: [CoursesController, CoursePrerequisitesController, CourseSequencesController],
  providers: [CoursesService, CoursePrerequisitesService, CourseSequencesService],
  exports: [CoursesService, CoursePrerequisitesService, CourseSequencesService],
})
export class CoursesModule {}
