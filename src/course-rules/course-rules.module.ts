import { Module } from '@nestjs/common';
import { CourseRulesService } from './course-rules.service';
import { CourseRulesController } from './course-rules.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourseRulesController],
  providers: [CourseRulesService],
  exports: [CourseRulesService],
})
export class CourseRulesModule {}
