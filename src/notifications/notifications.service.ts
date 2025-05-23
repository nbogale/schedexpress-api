import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { EmailService } from './email.service';
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService, private readonly emailService: EmailService) {}

  async createNotification(data: {
    studentId?: string;
    userId?: string;
    message: string;
    type: NotificationType;
  }, sendEmail: boolean = false) {
    //If userId or studentId is not provided throw exception
    if (!data.studentId && !data.userId) {
      throw new Error('StudentId or User Id is required');
    }


    const notification = await this.prisma.notification.create({
      data: {
        ...data,
        read: false,
      },
    });

    if(sendEmail) {
      await this.sendEmailNotification({
        userId: data.userId,
        message: data.message,
        type: data.type,
      });
    }
    return notification;
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
      },
    });

    if (!user) {
      return [];
    }

    let query = {};
    if (user.student) {
      query = { studentId: user.student.id };
    } else {
      query = { userId: user.id };
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
      },
    });

    if (!user) {
      return { count: 0 };
    }

    let query = {};
    if (user.student) {
      query = { studentId: user.student.id };
    } else {
      query = { userId: user.id };
    }

    return this.prisma.notification.updateMany({
      where: {
        ...query,
        read: false,
      },
      data: { read: true },
    });
  }


  async sendEmailNotification(data: {
    userId: string;
    message: string;
    type: NotificationType;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return;
    }

    //Send email to user.email  
    const email = user.email;
    const subject = 'Schedule Change Request';
    const body = data.message;
    const emailData = {
      to: email,
      subject: subject,
      text: body,
    };    
    
    //Send email
    await this.emailService.sendEmail(emailData);
  } 
}
