import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.settings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          schoolName: 'East High School',
          academicYear: '2024-2025',
          semester: 'Fall',
          maxCourseLoad: 8,
          allowConflicts: false,
        },
      });
    }

    return settings;
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    let settings = await this.prisma.settings.findFirst();

    // Create settings if they don't exist
    if (!settings) {
      return this.prisma.settings.create({
        data: {
          schoolName: updateSettingsDto.schoolName || 'East High School',
          academicYear: updateSettingsDto.academicYear || '2024-2025',
          semester: updateSettingsDto.semester || 'Fall',
          maxCourseLoad: updateSettingsDto.maxCourseLoad || 8,
          allowConflicts: updateSettingsDto.allowConflicts || false,
        },
      });
    }

    // Update existing settings
    return this.prisma.settings.update({
      where: { id: settings.id },
      data: updateSettingsDto,
    });
  }
}
