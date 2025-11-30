import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AcademicPeriodStatus } from '@prisma/client';

@Injectable()
export class AcademicPeriodStatusSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AcademicPeriodStatusSchedulerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs once when the application starts, after 10 minutes
   */
  async onApplicationBootstrap() {
    this.logger.log('Application started. Scheduling initial period status update in 10 minutes...');
    
    // Wait 10 minutes (600,000 milliseconds)
    setTimeout(async () => {
      this.logger.log('Running initial period status update after application start...');
      await this.updatePeriodStatuses();
    }, 2 * 60 * 1000);
  }

  /**
   * Cron job that runs every day at 2:00 AM
   */
  @Cron('0 2 * * *', {
    name: 'updatePeriodStatuses-2am',
    timeZone: 'America/New_York', // Adjust timezone as needed
  })
  async updatePeriodStatusesAt2AM() {
    this.logger.log('Running scheduled period status update at 2:00 AM...');
    await this.updatePeriodStatuses();
  }

  /**
   * Cron job that runs every day at 3:00 AM
   */
  @Cron('0 3 * * *', {
    name: 'updatePeriodStatuses-3am',
    timeZone: 'America/New_York', // Adjust timezone as needed
  })
  async updatePeriodStatusesAt3AM() {
    this.logger.log('Running scheduled period status update at 3:00 AM...');
    await this.updatePeriodStatuses();
  }

  /**
   * Cron job that runs every day at 4:00 AM
   */
  @Cron('0 4 * * *', {
    name: 'updatePeriodStatuses-4am',
    timeZone: 'America/New_York', // Adjust timezone as needed
  })
  async updatePeriodStatusesAt4AM() {
    this.logger.log('Running scheduled period status update at 4:00 AM...');
    await this.updatePeriodStatuses();
  }

  /**
   * Core method that updates academic period statuses based on dates
   * - PLANNED -> ACTIVE: when startDate <= today (at start of day)
   * - ACTIVE -> COMPLETED: when endDate < today (at start of day, meaning period ended yesterday or earlier)
   */
  private async updatePeriodStatuses() {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      this.logger.log(`Checking period statuses for ${todayStart.toISOString()}`);

      // Update PLANNED periods to ACTIVE if startDate <= today (at start of day)
      // This means periods that should have started today or earlier
      const periodsToActivate = await this.prisma.academicPeriod.findMany({
        where: {
          status: AcademicPeriodStatus.PLANNED,
          startDate: {
            lte: todayEnd, // Periods that started today or earlier
          },
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          cycle: {
            select: {
              name: true,
            },
          },
        },
      });

      if (periodsToActivate.length > 0) {
        const updateResult = await this.prisma.academicPeriod.updateMany({
          where: {
            id: {
              in: periodsToActivate.map(p => p.id),
            },
          },
          data: {
            status: AcademicPeriodStatus.ACTIVE,
          },
        });

        this.logger.log(
          `Updated ${updateResult.count} period(s) from PLANNED to ACTIVE: ${periodsToActivate.map(p => `${p.name} (${p.cycle.name})`).join(', ')}`,
        );
      }

      // Update ACTIVE periods to COMPLETED if endDate < today (at start of day)
      // This means periods that ended yesterday or earlier
      const periodsToComplete = await this.prisma.academicPeriod.findMany({
        where: {
          status: AcademicPeriodStatus.ACTIVE,
          endDate: {
            lt: todayStart, // Periods that ended before today
          },
        },
        select: {
          id: true,
          name: true,
          endDate: true,
          cycle: {
            select: {
              name: true,
            },
          },
        },
      });

      if (periodsToComplete.length > 0) {
        const updateResult = await this.prisma.academicPeriod.updateMany({
          where: {
            id: {
              in: periodsToComplete.map(p => p.id),
            },
          },
          data: {
            status: AcademicPeriodStatus.COMPLETED,
          },
        });

        this.logger.log(
          `Updated ${updateResult.count} period(s) from ACTIVE to COMPLETED: ${periodsToComplete.map(p => `${p.name} (${p.cycle.name})`).join(', ')}`,
        );
      }

      if (periodsToActivate.length === 0 && periodsToComplete.length === 0) {
        this.logger.log('No period status updates needed');
      }
    } catch (error) {
      this.logger.error('Error updating period statuses:', error);
      // Don't throw - we want the scheduler to continue running even if one update fails
      // Log the error for monitoring
    }
  }
}

