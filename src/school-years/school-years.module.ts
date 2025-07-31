import { Module } from '@nestjs/common';
import { SchoolYearsService } from './school-years.service';
import { SchoolYearsController } from './school-years.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchoolYearsController],
  providers: [SchoolYearsService],
  exports: [SchoolYearsService],
})
export class SchoolYearsModule {} 