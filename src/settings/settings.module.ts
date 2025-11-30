import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AcademicSettingsService } from './academic-settings.service';
import { SettingsController } from './settings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SettingsController],
  providers: [SettingsService, AcademicSettingsService],
  exports: [SettingsService, AcademicSettingsService],
})
export class SettingsModule {}
