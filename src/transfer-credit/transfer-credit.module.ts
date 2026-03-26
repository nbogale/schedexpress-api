import { Module } from '@nestjs/common';
import { TransferCreditService } from './transfer-credit.service';
import { TransferCreditController } from './transfer-credit.controller';
import { TransferCreditMappingService } from './transfer-credit-mapping.service';
import { TranscriptUploadService } from './transcript-upload.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GradeLookupModule } from '../grade-lookup/grade-lookup.module';

@Module({
  imports: [PrismaModule, GradeLookupModule],
  controllers: [TransferCreditController],
  providers: [TransferCreditService, TransferCreditMappingService, TranscriptUploadService],
  exports: [TransferCreditService, TransferCreditMappingService],
})
export class TransferCreditModule {}
