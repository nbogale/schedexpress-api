import { PartialType } from '@nestjs/swagger';
import { CreateCoursePrerequisiteDto } from './create-course-prerequisite.dto';

export class UpdateCoursePrerequisiteDto extends PartialType(CreateCoursePrerequisiteDto) {} 