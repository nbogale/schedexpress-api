import { Module } from '@nestjs/common';
import { CoursePrerequisitesService } from './course-prerequisites.service';
import { CoursePrerequisitesController } from './course-prerequisites.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoursePrerequisitesController],
  providers: [CoursePrerequisitesService],
  exports: [CoursePrerequisitesService],
})
export class CoursePrerequisitesModule {} 