import { Module } from '@nestjs/common';
import { AcademicCyclesService } from './academic-cycles.service';
import { AcademicCyclesController } from './academic-cycles.controller';
import { PeriodGenerationService } from './period-generation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [AcademicCyclesController],
  providers: [AcademicCyclesService, PeriodGenerationService],
  exports: [AcademicCyclesService, PeriodGenerationService]
})
export class AcademicCyclesModule {}
