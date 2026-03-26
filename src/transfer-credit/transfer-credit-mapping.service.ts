import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferCreditMappingDto } from './dto/create-transfer-credit-mapping.dto';
import { TransferMappingType } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransferCreditMappingService {
  constructor(private readonly prisma: PrismaService) {}

  async findMapping(
    externalCourseCode: string,
    externalCourseName: string,
    sourceSchoolType?: string,
  ) {
    const where: Prisma.TransferCreditMappingWhereInput = {
      externalCourseCode: { equals: externalCourseCode, mode: 'insensitive' },
      externalCourseName: { equals: externalCourseName, mode: 'insensitive' },
      isActive: true,
    };
    if (sourceSchoolType != null && sourceSchoolType !== '') {
      where.OR = [
        { sourceSchoolType: sourceSchoolType },
        { sourceSchoolType: null },
      ];
    }
    return this.prisma.transferCreditMapping.findFirst({
      where,
      orderBy: { priority: 'desc' },
      include: {
        internalCourse: true,
        department: true,
      },
    });
  }

  async autoMapCourse(
    externalCourseCode: string,
    externalCourseName: string,
    sourceSchoolType?: string,
  ) {
    const mapping = await this.findMapping(
      externalCourseCode,
      externalCourseName,
      sourceSchoolType,
    );
    return mapping?.internalCourse ?? null;
  }

  async createMapping(
    dto: CreateTransferCreditMappingDto,
    createdBy?: string,
  ) {
    return this.prisma.transferCreditMapping.create({
      data: {
        externalCourseCode: dto.externalCourseCode,
        externalCourseName: dto.externalCourseName,
        sourceSchoolType: dto.sourceSchoolType,
        internalCourseId: dto.internalCourseId,
        departmentId: dto.departmentId,
        creditEquivalent: dto.creditEquivalent ?? 1.0,
        mappingRule: dto.mappingRule,
        isActive: dto.isActive ?? true,
        priority: dto.priority ?? 0,
        createdBy: createdBy ?? null,
      },
      include: {
        internalCourse: true,
        department: true,
      },
    });
  }

  async getMappings(filters?: { isActive?: boolean }) {
    return this.prisma.transferCreditMapping.findMany({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      orderBy: [{ priority: 'desc' }, { externalCourseCode: 'asc' }],
      include: {
        internalCourse: { select: { id: true, code: true, name: true } },
        department: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async updateMapping(
    mappingId: string,
    dto: {
      externalCourseCode?: string;
      externalCourseName?: string;
      sourceSchoolType?: string;
      internalCourseId?: string;
      departmentId?: string;
      creditEquivalent?: number;
      mappingRule?: string;
      isActive?: boolean;
      priority?: number;
    },
  ) {
    await this.prisma.transferCreditMapping.findUniqueOrThrow({
      where: { id: mappingId },
    });
    return this.prisma.transferCreditMapping.update({
      where: { id: mappingId },
      data: {
        ...(dto.externalCourseCode != null && { externalCourseCode: dto.externalCourseCode }),
        ...(dto.externalCourseName != null && { externalCourseName: dto.externalCourseName }),
        ...(dto.sourceSchoolType !== undefined && { sourceSchoolType: dto.sourceSchoolType }),
        ...(dto.internalCourseId !== undefined && { internalCourseId: dto.internalCourseId }),
        ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
        ...(dto.creditEquivalent != null && { creditEquivalent: new Prisma.Decimal(dto.creditEquivalent) }),
        ...(dto.mappingRule !== undefined && { mappingRule: dto.mappingRule }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
      },
      include: {
        internalCourse: { select: { id: true, code: true, name: true } },
        department: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async deleteMapping(mappingId: string) {
    await this.prisma.transferCreditMapping.findUniqueOrThrow({
      where: { id: mappingId },
    });
    return this.prisma.transferCreditMapping.delete({
      where: { id: mappingId },
    });
  }
}
