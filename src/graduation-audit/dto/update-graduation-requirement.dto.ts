import { PartialType } from '@nestjs/swagger';
import { CreateGraduationRequirementDto } from './create-graduation-requirement.dto';

export class UpdateGraduationRequirementDto extends PartialType(CreateGraduationRequirementDto) {}
