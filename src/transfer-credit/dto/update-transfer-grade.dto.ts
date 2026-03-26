import { PartialType } from '@nestjs/swagger';
import { CreateTransferGradeDto } from './create-transfer-grade.dto';

export class UpdateTransferGradeDto extends PartialType(CreateTransferGradeDto) {}
