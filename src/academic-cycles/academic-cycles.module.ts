import { Module } from '@nestjs/common';
import { AcademicCyclesService } from './academic-cycles.service';
import { AcademicCyclesController } from './academic-cycles.controller';
import { PeriodGenerationService } from './period-generation.service';
import { AcademicPeriodBusinessRulesService } from './academic-period-business-rules.service';
import { AcademicPeriodBusinessRulesController } from './academic-period-business-rules.controller';
import { AcademicPeriodStatusSchedulerService } from './academic-period-status-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [AcademicCyclesController, AcademicPeriodBusinessRulesController],
  providers: [
    AcademicCyclesService,
    PeriodGenerationService,
    AcademicPeriodBusinessRulesService,
    AcademicPeriodStatusSchedulerService,
  ],
  exports: [
    AcademicCyclesService,
    PeriodGenerationService,
    AcademicPeriodBusinessRulesService,
  ],
})
export class AcademicCyclesModule {}
