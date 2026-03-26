import { PartialType } from '@nestjs/mapped-types';
import { CreateParentGuardianDto } from './create-parent-guardian.dto';

export class UpdateParentGuardianDto extends PartialType(CreateParentGuardianDto) {}
