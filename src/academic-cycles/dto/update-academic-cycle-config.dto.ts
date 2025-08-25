import { PartialType } from '@nestjs/swagger';
import { CreateAcademicCycleConfigDto } from './create-academic-cycle-config.dto';

export class UpdateAcademicCycleConfigDto extends PartialType(CreateAcademicCycleConfigDto) {}
