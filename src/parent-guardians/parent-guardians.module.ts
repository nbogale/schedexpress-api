import { Module } from '@nestjs/common';
import { ParentGuardiansService } from './parent-guardians.service';
import { ParentGuardiansController } from './parent-guardians.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParentGuardiansController],
  providers: [ParentGuardiansService],
  exports: [ParentGuardiansService]
})
export class ParentGuardiansModule {}
