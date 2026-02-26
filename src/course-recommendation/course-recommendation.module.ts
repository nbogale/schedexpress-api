import { Module } from '@nestjs/common';
import { CourseRecommendationService } from './course-recommendation.service';
import { CourseRecommendationController } from './course-recommendation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourseRecommendationController],
  providers: [CourseRecommendationService],
  exports: [CourseRecommendationService],
})
export class CourseRecommendationModule {}
