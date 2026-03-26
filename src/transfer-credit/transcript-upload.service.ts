import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessingStatus } from '@prisma/client';
import { MulterFile } from './uploaded-file.interface';
import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

@Injectable()
export class TranscriptUploadService {
  private readonly uploadDir: string;

  constructor(private readonly prisma: PrismaService) {
    this.uploadDir = process.env.TRANSCRIPT_UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'transcripts');
  }

  private ensureUploadDir(studentId: string): string {
    const studentDir = path.join(this.uploadDir, studentId);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(studentDir)) {
      fs.mkdirSync(studentDir, { recursive: true });
    }
    return studentDir;
  }

  async uploadTranscript(
    studentId: string,
    file: MulterFile,
    uploadedBy: string,
    options?: { sourceSchool?: string; sourceSchoolType?: string; sourceState?: string; notes?: string },
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
    }
    if (ALLOWED_MIMES.length && file.mimetype && !ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        'File type not allowed. Use PDF, image (JPEG/PNG/GIF), CSV, or Excel.',
      );
    }

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const ext = path.extname(file.originalname) || '';
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
    const timestamp = Date.now();
    const fileName = `${timestamp}_${safeName}`;
    const studentDir = this.ensureUploadDir(studentId);
    const filePath = path.join(studentDir, fileName);
    const relativePath = path.relative(process.cwd(), filePath);

    fs.writeFileSync(filePath, file.buffer);

    const fileType = (ext.slice(1) || 'pdf').toUpperCase();
    const record = await this.prisma.transcriptUpload.create({
      data: {
        studentId,
        fileName: file.originalname,
        filePath: relativePath,
        fileType,
        fileSize: file.size,
        mimeType: file.mimetype,
        sourceSchool: options?.sourceSchool,
        sourceSchoolType: options?.sourceSchoolType,
        sourceState: options?.sourceState,
        processingStatus: ProcessingStatus.PENDING,
        uploadedBy,
        notes: options?.notes,
      },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return record;
  }

  async getUploadsByStudent(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.prisma.transcriptUpload.findMany({
      where: { studentId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getOne(uploadId: string) {
    const upload = await this.prisma.transcriptUpload.findUnique({
      where: { id: uploadId },
      include: {
        student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
        uploader: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!upload) throw new NotFoundException('Transcript upload not found');
    return upload;
  }
}
