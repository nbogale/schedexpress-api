import { PartialType } from '@nestjs/swagger';
import { CreateCourseSequenceDto } from './create-course-sequence.dto';

export class UpdateCourseSequenceDto extends PartialType(CreateCourseSequenceDto) {} 