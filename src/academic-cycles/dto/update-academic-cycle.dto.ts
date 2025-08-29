import { PartialType } from '@nestjs/swagger';
import { CreateAcademicCycleDto } from './create-academic-cycle.dto';

export class UpdateAcademicCycleDto extends PartialType(CreateAcademicCycleDto) {}
