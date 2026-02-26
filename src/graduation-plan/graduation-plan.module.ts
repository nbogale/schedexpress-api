import { Module } from '@nestjs/common';
import { GraduationPlanService } from './graduation-plan.service';
import { GraduationPlanController } from './graduation-plan.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GraduationPlanController],
  providers: [GraduationPlanService],
  exports: [GraduationPlanService],
})
export class GraduationPlanModule {}
