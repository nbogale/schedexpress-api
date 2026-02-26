import { Module } from '@nestjs/common';
import { GraduationAuditService } from './graduation-audit.service';
import { GraduationAuditController } from './graduation-audit.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GradeLookupModule } from '../grade-lookup/grade-lookup.module';

@Module({
  imports: [PrismaModule, GradeLookupModule],
  controllers: [GraduationAuditController],
  providers: [GraduationAuditService],
  exports: [GraduationAuditService],
})
export class GraduationAuditModule {}
