import { Module } from '@nestjs/common';
import { CourseSectionsService } from './course-sections.service';
import { CourseSectionsController } from './course-sections.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourseSectionsController],
  providers: [CourseSectionsService],
  exports: [CourseSectionsService],
})
export class CourseSectionsModule {} 