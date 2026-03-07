import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferGradeDto } from './dto/create-transfer-grade.dto';
import { UpdateTransferGradeDto } from './dto/update-transfer-grade.dto';
import { GrantExceptionDto } from './dto/grant-exception.dto';
import {
  TransferStatus,
  TransferMappingType,
  TransferHistoryAction,
  GradeType,
  Prisma,
} from '@prisma/client';
import { TransferCreditMappingService } from './transfer-credit-mapping.service';
import { GradeLookupService } from '../grade-lookup/grade-lookup.service';

@Injectable()
export class TransferCreditService {
  private readonly logger = new Logger(TransferCreditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mappingService: TransferCreditMappingService,
    private readonly gradeLookupService: GradeLookupService,
  ) {}

  async createTransferGrade(
    studentId: string,
    dto: CreateTransferGradeDto,
    userId?: string,
  ) {
    await this.ensureStudentExists(studentId);
    const mappingType = dto.mappedCourseId
      ? TransferMappingType.MANUAL
      : TransferMappingType.MANUAL;

    const created = await this.prisma.transferGrade.create({
      data: {
        studentId,
        sourceSchool: dto.sourceSchool,
        sourceSchoolType: dto.sourceSchoolType,
        academicYear: dto.academicYear,
        academicPeriod: dto.academicPeriod,
        originalCourseName: dto.originalCourseName,
        originalCourseCode: dto.originalCourseCode,
        originalCredits: new Prisma.Decimal(dto.originalCredits),
        originalGrade: dto.originalGrade,
        originalGradeSystem: dto.originalGradeSystem,
        convertedGrade: dto.convertedGrade,
        convertedGradePoints: dto.convertedGradePoints
          ? new Prisma.Decimal(dto.convertedGradePoints)
          : null,
        mappedCourseId: dto.mappedCourseId,
        mappingType,
        status: TransferStatus.PENDING,
        transferType: dto.transferType,
        transcriptUploadId: dto.transcriptUploadId,
        notes: dto.notes,
      },
      include: this.transferGradeInclude(),
    });

    if (userId) {
      await this.addHistory(created.id, TransferHistoryAction.CREATED, userId, {
        created: true,
      });
    }
    return created;
  }

  async getTransferGrades(studentId: string, status?: TransferStatus) {
    const where: Prisma.TransferGradeWhereInput = { studentId };
    if (status) where.status = status;
    return this.prisma.transferGrade.findMany({
      where,
      orderBy: [{ academicYear: 'desc' }, { originalCourseName: 'asc' }],
      include: this.transferGradeInclude(),
    });
  }

  async getTransferGrade(transferGradeId: string) {
    const tg = await this.prisma.transferGrade.findUnique({
      where: { id: transferGradeId },
      include: this.transferGradeInclude(),
    });
    if (!tg) throw new NotFoundException('Transfer grade not found');
    return tg;
  }

  async updateTransferGrade(
    transferGradeId: string,
    dto: UpdateTransferGradeDto,
    userId: string,
  ) {
    const existing = await this.getTransferGrade(transferGradeId);
    if (existing.status !== TransferStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING transfer grades can be updated',
      );
    }

    const updated = await this.prisma.transferGrade.update({
      where: { id: transferGradeId },
      data: {
        ...(dto.sourceSchool != null && { sourceSchool: dto.sourceSchool }),
        ...(dto.sourceSchoolType !== undefined && {
          sourceSchoolType: dto.sourceSchoolType,
        }),
        ...(dto.academicYear != null && { academicYear: dto.academicYear }),
        ...(dto.academicPeriod !== undefined && {
          academicPeriod: dto.academicPeriod,
        }),
        ...(dto.originalCourseName != null && {
          originalCourseName: dto.originalCourseName,
        }),
        ...(dto.originalCourseCode !== undefined && {
          originalCourseCode: dto.originalCourseCode,
        }),
        ...(dto.originalCredits != null && {
          originalCredits: new Prisma.Decimal(dto.originalCredits),
        }),
        ...(dto.originalGrade != null && { originalGrade: dto.originalGrade }),
        ...(dto.originalGradeSystem != null && {
          originalGradeSystem: dto.originalGradeSystem,
        }),
        ...(dto.convertedGrade !== undefined && {
          convertedGrade: dto.convertedGrade,
        }),
        ...(dto.convertedGradePoints != null && {
          convertedGradePoints: new Prisma.Decimal(dto.convertedGradePoints),
        }),
        ...(dto.mappedCourseId !== undefined && {
          mappedCourseId: dto.mappedCourseId,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: this.transferGradeInclude(),
    });

    await this.addHistory(transferGradeId, TransferHistoryAction.UPDATED, userId, {
      updates: dto,
    });
    return updated;
  }

  async mapTransferGrade(
    transferGradeId: string,
    mappedCourseId: string,
    userId: string,
  ) {
    const existing = await this.getTransferGrade(transferGradeId);
    if (existing.status !== TransferStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING transfer grades can be mapped',
      );
    }
    await this.ensureCourseExists(mappedCourseId);

    const updated = await this.prisma.transferGrade.update({
      where: { id: transferGradeId },
      data: {
        mappedCourseId,
        mappingType: TransferMappingType.MANUAL,
        unmappingReason: null,
      },
      include: this.transferGradeInclude(),
    });

    await this.addHistory(transferGradeId, TransferHistoryAction.MAPPED, userId, {
      mappedCourseId,
    });
    return updated;
  }

  async unmapTransferGrade(transferGradeId: string, userId: string) {
    const existing = await this.getTransferGrade(transferGradeId);
    if (existing.status !== TransferStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING transfer grades can be unmapped',
      );
    }

    const updated = await this.prisma.transferGrade.update({
      where: { id: transferGradeId },
      data: {
        mappedCourseId: null,
        unmappingReason: 'Manually unmapped by counselor',
      },
      include: this.transferGradeInclude(),
    });

    await this.addHistory(transferGradeId, TransferHistoryAction.UNMAPPED, userId);
    return updated;
  }

  async approveTransferGrade(
    transferGradeId: string,
    userId: string,
    academicCycleId?: string,
  ) {
    const tg = await this.getTransferGrade(transferGradeId);
    if (tg.status !== TransferStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING transfer grades can be approved',
      );
    }
    if (!tg.mappedCourseId) {
      throw new BadRequestException(
        'Transfer grade must be mapped to an internal course before approval',
      );
    }

    const cycleId =
      academicCycleId ?? (await this.getDefaultAcademicCycleId());
    const course = await this.prisma.course.findUnique({
      where: { id: tg.mappedCourseId },
    });
    if (!course) throw new NotFoundException('Mapped course not found');

    const creditEarned = Number(tg.originalCredits);
    const isPassed = await this.isPassingGrade(tg.originalGrade, tg.convertedGrade);

    const sch = await this.prisma.studentCourseHistory.create({
      data: {
        studentId: tg.studentId,
        courseId: tg.mappedCourseId,
        academicCycleId: cycleId,
        grade: tg.convertedGrade ?? tg.originalGrade,
        isPassed,
        creditEarned: new Prisma.Decimal(creditEarned),
        gradeType: GradeType.FINAL,
        isFinal: true,
        notes: `Transfer credit from ${tg.sourceSchool} (${tg.academicYear}). Original: ${tg.originalCourseName} - ${tg.originalGrade}`,
      },
    });

    await this.prisma.transferGrade.update({
      where: { id: transferGradeId },
      data: {
        status: TransferStatus.APPROVED,
        isAccepted: true,
        acceptedBy: userId,
        acceptedAt: new Date(),
        studentCourseHistoryId: sch.id,
        rejectionReason: null,
      },
    });

    await this.addHistory(transferGradeId, TransferHistoryAction.APPROVED, userId, {
      studentCourseHistoryId: sch.id,
    });

    await this.recalculateStudentTransferCredits(tg.studentId);
    return this.getTransferGrade(transferGradeId);
  }

  async rejectTransferGrade(
    transferGradeId: string,
    userId: string,
    rejectionReason: string,
  ) {
    const tg = await this.getTransferGrade(transferGradeId);
    if (tg.status !== TransferStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING transfer grades can be rejected',
      );
    }

    await this.prisma.transferGrade.update({
      where: { id: transferGradeId },
      data: {
        status: TransferStatus.REJECTED,
        rejectionReason,
        acceptedBy: null,
        acceptedAt: null,
      },
    });

    await this.addHistory(transferGradeId, TransferHistoryAction.REJECTED, userId, {
      rejectionReason,
    });
    return this.getTransferGrade(transferGradeId);
  }

  async grantException(
    transferGradeId: string,
    userId: string,
    dto: GrantExceptionDto,
  ) {
    const tg = await this.getTransferGrade(transferGradeId);
    if (tg.status !== TransferStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING transfer grades can receive an exception',
      );
    }

    await this.prisma.transferGrade.update({
      where: { id: transferGradeId },
      data: {
        status: TransferStatus.EXCEPTION,
        isException: true,
        exceptionReason: dto.exceptionReason,
        exceptionApprovedBy: userId,
        exceptionApprovedAt: new Date(),
      },
    });

    await this.addHistory(
      transferGradeId,
      TransferHistoryAction.EXCEPTION_GRANTED,
      userId,
      { exceptionReason: dto.exceptionReason },
    );
    return this.getTransferGrade(transferGradeId);
  }

  async getTransferGradeHistory(transferGradeId: string) {
    await this.getTransferGrade(transferGradeId);
    return this.prisma.transferGradeHistory.findMany({
      where: { transferGradeId },
      orderBy: { performedAt: 'desc' },
      include: {
        performer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async addHistory(
    transferGradeId: string,
    action: TransferHistoryAction,
    performedBy: string | undefined,
    changes?: object,
    notes?: string,
  ) {
    if (!performedBy) return null;
    return this.prisma.transferGradeHistory.create({
      data: {
        transferGradeId,
        action,
        performedBy,
        changes: changes ?? undefined,
        notes: notes ?? undefined,
      },
    });
  }

  private transferGradeInclude() {
    return {
      student: {
        select: {
          id: true,
          studentId: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
      mappedCourse: {
        select: { id: true, code: true, name: true, credits: true, department: true },
      },
      acceptor: { select: { id: true, firstName: true, lastName: true } },
      exceptionApprover: { select: { id: true, firstName: true, lastName: true } },
      studentCourseHistory: true,
      transcriptUpload: { select: { id: true, fileName: true, processingStatus: true } },
    };
  }

  private async ensureStudentExists(studentId: string) {
    const s = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!s) throw new NotFoundException('Student not found');
  }

  private async ensureCourseExists(courseId: string) {
    const c = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!c) throw new NotFoundException('Course not found');
  }

  private async getDefaultAcademicCycleId(): Promise<string> {
    const cycle = await this.prisma.academicCycle.findFirst({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    });
    if (!cycle)
      throw new BadRequestException(
        'No active academic cycle found. Please specify academicCycleId when approving transfer credit.',
      );
    return cycle.id;
  }

  private async isPassingGrade(
    originalGrade: string,
    convertedGrade?: string | null,
  ): Promise<boolean> {
    const gradeToCheck = convertedGrade ?? originalGrade;
    try {
      return await this.gradeLookupService.isPassingGrade(gradeToCheck);
    } catch {
      return true;
    }
  }

  private async recalculateStudentTransferCredits(studentId: string) {
    const result = await this.prisma.transferGrade.aggregate({
      where: {
        studentId,
        status: TransferStatus.APPROVED,
      },
      _sum: { originalCredits: true },
    });
    const total = result._sum.originalCredits ?? 0;
    await this.prisma.student.update({
      where: { id: studentId },
      data: { transferCredits: new Prisma.Decimal(total) },
    });
  }
}
