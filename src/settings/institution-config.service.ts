import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleType } from './dto/update-settings.dto';

export interface ScheduleConfiguration {
  scheduleType: ScheduleType;
  hasRotationDays: boolean;
  rotationPattern: string | null;
  minBlockDuration: number;
  maxBlockDuration: number;
  allowOverlappingBlocks: boolean;
}

const DEFAULT_SETTINGS = {
  schoolName: 'East High School',
  maxCourseLoad: 8,
  allowConflicts: false,
  scheduleType: ScheduleType.STANDARD,
  hasRotationDays: false,
  rotationPattern: null as string | null,
  minBlockDuration: 45,
  maxBlockDuration: 120,
  allowOverlappingBlocks: false,
};

@Injectable()
export class InstitutionConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateSettings() {
    let settings = await this.prisma.settings.findFirst();

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: DEFAULT_SETTINGS as any,
      });
    }

    return settings;
  }

  async getScheduleConfiguration(): Promise<ScheduleConfiguration> {
    const settings = (await this.getOrCreateSettings()) as any;

    return {
      scheduleType: settings.scheduleType as ScheduleType,
      hasRotationDays: settings.hasRotationDays,
      rotationPattern: settings.rotationPattern,
      minBlockDuration: settings.minBlockDuration,
      maxBlockDuration: settings.maxBlockDuration,
      allowOverlappingBlocks: settings.allowOverlappingBlocks,
    };
  }

  getDefaultSettings() {
    return { ...DEFAULT_SETTINGS };
  }

  parseRotationPatternTokens(rotationPattern?: string | null): string[] {
    if (!rotationPattern) return [];

    return rotationPattern
      .split(',')
      .map((token) => token.trim().toUpperCase())
      .filter(Boolean);
  }
}
