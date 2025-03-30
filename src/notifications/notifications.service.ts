import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: {
    studentId?: string;
    counselorId?: string;
    adminId?: string;
    message: string;
    type: NotificationType;
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        read: false,
      },
    });
  }

  async createRequestNotification(data: {
    studentId: string;
    counselorId?: string;
    message: string;
    type: NotificationType;
  }) {
    return this.createNotification(data);
  }

  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        counselor: true,
        admin: true,
      },
    });

    if (!user) {
      return [];
    }

    let query = {};
    if (user.student) {
      query = { studentId: user.student.id };
    } else if (user.counselor) {
      query = { counselorId: user.counselor.id };
    } else if (user.admin) {
      query = { adminId: user.admin.id };
    }

    return this.prisma.notification.findMany({
      where: query,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        counselor: true,
        admin: true,
      },
    });

    if (!user) {
      return { count: 0 };
    }

    let query = {};
    if (user.student) {
      query = { studentId: user.student.id };
    } else if (user.counselor) {
      query = { counselorId: user.counselor.id };
    } else if (user.admin) {
      query = { adminId: user.admin.id };
    }

    return this.prisma.notification.updateMany({
      where: {
        ...query,
        read: false,
      },
      data: { read: true },
    });
  }
}
