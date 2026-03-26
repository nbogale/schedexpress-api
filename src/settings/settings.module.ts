import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AcademicSettingsService } from './academic-settings.service';
import { SettingsController } from './settings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { InstitutionConfigService } from './institution-config.service';

@Module({
  imports: [PrismaModule],
  controllers: [SettingsController],
  providers: [SettingsService, AcademicSettingsService, InstitutionConfigService],
  exports: [SettingsService, AcademicSettingsService, InstitutionConfigService],
})
export class SettingsModule {}
