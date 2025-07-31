import { Module } from '@nestjs/common';
import { CourseSequencesService } from './course-sequences.service';
import { CourseSequencesController } from './course-sequences.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourseSequencesController],
  providers: [CourseSequencesService],
  exports: [CourseSequencesService],
})
export class CourseSequencesModule {} 