import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAcademicSettingsDto, AcademicStructureType } from './dto/academic-settings.dto';

@Injectable()
export class AcademicSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAcademicSettings() {
    // Get or create settings first
    let settings = await this.prisma.settings.findFirst();
    
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          schoolName: 'East High School',
          maxCourseLoad: 8,
          allowConflicts: false,
        },
      });
    }

    // Get or create academic settings
    let academicSettings = await this.prisma.academicSettings.findUnique({
      where: { settingsId: settings.id },
    });

    if (!academicSettings) {
      academicSettings = await this.prisma.academicSettings.create({
        data: {
          settingsId: settings.id,
          academicStructureType: AcademicStructureType.SCHOOL_YEAR_ONLY,
          defaultSemesterCount: 0,
          defaultQuarterCount: 0,
          defaultTrimesterCount: 0,
          semestersHaveQuarters: false,
        },
      });
    }

    return academicSettings;
  }

  async updateAcademicSettings(updateDto: UpdateAcademicSettingsDto) {
    // Get or create settings first
    let settings = await this.prisma.settings.findFirst();
    
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          schoolName: 'East High School',
          maxCourseLoad: 8,
          allowConflicts: false,
        },
      });
    }

    // Check if academic settings exist
    const existing = await this.prisma.academicSettings.findUnique({
      where: { settingsId: settings.id },
    });

    if (existing) {
      return this.prisma.academicSettings.update({
        where: { id: existing.id },
        data: updateDto as any,
      });
    } else {
      return this.prisma.academicSettings.create({
        data: {
          settingsId: settings.id,
          ...updateDto,
        } as any,
      });
    }
  }

  async getDefaultPeriodConfiguration() {
    const academicSettings = await this.getAcademicSettings();
    return academicSettings.defaultPeriodConfiguration || null;
  }

  async getAcademicPeriodRules() {
    const academicSettings = await this.getAcademicSettings();
    return academicSettings.academicPeriodRules || null;
  }
}

