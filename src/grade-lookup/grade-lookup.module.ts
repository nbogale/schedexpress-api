import { Module } from '@nestjs/common';
import { GradeLookupController } from './grade-lookup.controller';
import { GradeLookupService } from './grade-lookup.service';

@Module({
  controllers: [GradeLookupController],
  providers: [GradeLookupService],
  exports: [GradeLookupService],
})
export class GradeLookupModule {} 