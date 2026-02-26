import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleType, UpdateSettingsDto } from './dto/update-settings.dto';
import { InstitutionConfigService } from './institution-config.service';

const NON_STANDARD_SCHEDULE_TYPES = new Set<ScheduleType>([
  ScheduleType.BLOCK,
]);

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly institutionConfigService: InstitutionConfigService,
  ) {}

  private normalizeRotationPattern(rotationPattern?: string | null) {
    if (!rotationPattern) return null;

    const tokens = this.institutionConfigService.parseRotationPatternTokens(rotationPattern);
    if (tokens.length === 0) {
      return null;
    }

    const hasInvalidToken = tokens.some((token) => !/^[A-Z][A-Z0-9_]{0,49}$/.test(token));
    if (hasInvalidToken) {
      throw new Error('Rotation pattern contains invalid tokens');
    }

    return tokens.join(',');
  }

  private normalizeSettings(
    input: UpdateSettingsDto,
    currentSettings: {
      scheduleType: ScheduleType;
      hasRotationDays: boolean;
      rotationPattern: string | null;
      minBlockDuration: number;
      maxBlockDuration: number;
    },
  ) {
    const scheduleType = (input.scheduleType ?? currentSettings.scheduleType ?? ScheduleType.STANDARD) as ScheduleType;
    let hasRotationDays = input.hasRotationDays ?? currentSettings.hasRotationDays ?? false;
    let rotationPattern = this.normalizeRotationPattern(input.rotationPattern ?? currentSettings.rotationPattern ?? null);
    const minBlockDuration = input.minBlockDuration ?? currentSettings.minBlockDuration;
    const maxBlockDuration = input.maxBlockDuration ?? currentSettings.maxBlockDuration;

    if (minBlockDuration >= maxBlockDuration) {
      throw new Error('Minimum block duration must be less than maximum block duration');
    }

    if (scheduleType === ScheduleType.STANDARD) {
      hasRotationDays = false;
      rotationPattern = null;
    } else if (NON_STANDARD_SCHEDULE_TYPES.has(scheduleType)) {
      if (!hasRotationDays) {
        throw new Error(`Rotation days must be enabled for ${scheduleType.toLowerCase()} schedules`);
      }

      if (!rotationPattern) {
        throw new Error(`Rotation pattern is required for ${scheduleType.toLowerCase()} schedules`);
      }
    }

    return {
      scheduleType,
      hasRotationDays,
      rotationPattern,
      minBlockDuration,
      maxBlockDuration,
    };
  }

  async getSettings() {
    return this.institutionConfigService.getOrCreateSettings();
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    const settings = (await this.institutionConfigService.getOrCreateSettings()) as any;
    const defaults = this.institutionConfigService.getDefaultSettings();
    const normalizedSettings = this.normalizeSettings(updateSettingsDto, {
      scheduleType: (settings.scheduleType as ScheduleType) ?? defaults.scheduleType,
      hasRotationDays: settings.hasRotationDays ?? defaults.hasRotationDays,
      rotationPattern: settings.rotationPattern ?? defaults.rotationPattern,
      minBlockDuration: settings.minBlockDuration ?? defaults.minBlockDuration,
      maxBlockDuration: settings.maxBlockDuration ?? defaults.maxBlockDuration,
    });

    return this.prisma.settings.update({
      where: { id: settings.id },
      data: {
        schoolName: updateSettingsDto.schoolName ?? settings.schoolName,
        maxCourseLoad: updateSettingsDto.maxCourseLoad ?? settings.maxCourseLoad,
        allowConflicts: updateSettingsDto.allowConflicts ?? settings.allowConflicts,
        scheduleType: normalizedSettings.scheduleType,
        hasRotationDays: normalizedSettings.hasRotationDays,
        rotationPattern: normalizedSettings.rotationPattern,
        minBlockDuration: normalizedSettings.minBlockDuration,
        maxBlockDuration: normalizedSettings.maxBlockDuration,
        allowOverlappingBlocks: updateSettingsDto.allowOverlappingBlocks ?? settings.allowOverlappingBlocks,
        ...(updateSettingsDto.scheduleChangeConfig !== undefined
          ? { scheduleChangeConfig: updateSettingsDto.scheduleChangeConfig }
          : {}),
      } as any,
    });
  }
}
