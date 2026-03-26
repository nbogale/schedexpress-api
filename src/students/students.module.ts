import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FileParserService } from '../common/file-parser.service';
import { AcademicCyclesModule } from 'src/academic-cycles/academic-cycles.module';

@Module({
  imports: [PrismaModule, AcademicCyclesModule],
  controllers: [StudentsController],
  providers: [StudentsService, FileParserService],
  exports: [StudentsService],
})
export class StudentsModule {}
