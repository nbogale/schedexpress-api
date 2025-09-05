import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { NotificationType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService) {}

  // Send grade notification to student
  async sendGradeNotification(data: {
    studentEmail: string;
    studentName: string;
    courseName: string;
    grade: string;
    isPassed: boolean;
  }) {
    try {
      await this.emailService.sendTemplatedEmail({
        to: data.studentEmail,
        subject: `Grade Update - ${data.courseName}`,
        template: 'grade-notification',
        data: {
          studentName: data.studentName,
          courseName: data.courseName,
          grade: data.grade,
          isPassed: data.isPassed,
        },
      });
      
      this.logger.log(`Grade notification sent to ${data.studentEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send grade notification: ${error.message}`);
      throw error;
    }
  }

  // Send general notification
  async sendGeneralNotification(data: {
    to: string;
    subject: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  }) {
    try {
      await this.emailService.sendTemplatedEmail({
        to: data.to,
        subject: data.subject,
        template: 'notification',
        data: {
          subject: data.subject, // Add subject to template data
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          actionText: data.actionText,
        },
      });
      
      this.logger.log(`General notification sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send general notification: ${error.message}`);
      throw error;
    }
  }

  // Send schedule change notification
  async sendScheduleChangeNotification(data: {
    to: string;
    requesterName: string;
    courseName: string;
    reason: string;
    status: string;
    actionUrl?: string;
  }) {
    try {
      await this.emailService.sendTemplatedEmail({
        to: data.to,
        subject: 'Schedule Change Request',
        template: 'schedule-change',
        data: {
          requesterName: data.requesterName,
          courseName: data.courseName,
          reason: data.reason,
          status: data.status,
          actionUrl: data.actionUrl,
        },
      });
      
      this.logger.log(`Schedule change notification sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send schedule change notification: ${error.message}`);
      throw error;
    }
  }

  // Send bulk grade notification
  async sendBulkGradeNotification(data: {
    studentEmail: string;
    studentName: string;
    courseName: string;
    grades: Array<{
      courseName: string;
      grade: string;
      isPassed: boolean;
    }>;
  }) {
    try {
      // Create a custom message for bulk grades
      const gradeList = data.grades.map(g => 
        `${g.courseName}: ${g.grade} (${g.isPassed ? 'Passing' : 'Failing'})`
      ).join('\n');

      await this.emailService.sendTemplatedEmail({
        to: data.studentEmail,
        subject: `Bulk Grade Update - ${data.courseName}`,
        template: 'notification',
        data: {
          subject: `Bulk Grade Update - ${data.courseName}`, // Add subject to template data
          title: 'Bulk Grade Update',
          message: `Dear ${data.studentName},\n\nYour grades have been updated for the following courses:\n\n${gradeList}\n\nPlease check your student portal for detailed information.`,
        },
      });
      
      this.logger.log(`Bulk grade notification sent to ${data.studentEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send bulk grade notification: ${error.message}`);
      throw error;
    }
  }

  // Send system notification
  async sendSystemNotification(data: {
    to: string;
    subject: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }) {
    try {
      const typeColors = {
        info: '#3B82F6',
        warning: '#F59E0B',
        error: '#EF4444',
        success: '#10B981',
      };

      await this.emailService.sendTemplatedEmail({
        to: data.to,
        subject: data.subject,
        template: 'notification',
        data: {
          subject: data.subject, // Add subject to template data
          title: data.subject,
          message: data.message,
          type: data.type,
          typeColor: typeColors[data.type],
        },
      });
      
      this.logger.log(`System notification sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send system notification: ${error.message}`);
      throw error;
    }
  }


  //TODO: Clean up
  async createNotification(data: {
    studentId?: string;
    userId?: string;
    parentGuardianId?: string;
    message: string;
    type: NotificationType;
  }, sendEmail: boolean = false) {
    //If userId, studentId, or parentGuardianId is not provided throw exception
    if (!data.studentId && !data.userId && !data.parentGuardianId) {
      throw new Error('StudentId, UserId, or ParentGuardianId is required');
    }

    const notification = await this.prisma.notification.create({
      data: {
        ...data,
        read: false,
      },
    });

    if(sendEmail) {
      let email: string | null = null;
      
      if (data.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: data.userId },
        });
        email = user?.email || null;
      } else if (data.parentGuardianId) {
        const parentGuardian = await this.prisma.parentGuardian.findUnique({
          where: { id: data.parentGuardianId },
        });
        email = parentGuardian?.email || null;
      }
  
      if (email) {
        await this.sendGeneralNotification({
          to: email,
          subject: this.populateNotiicationSubject(data.type),
          title: this.populateNotiicationSubject(data.type),
          message: data.message,
        });
      }
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
    subject: string;
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
  
    const body = data.message;
    const emailData = {
      to: email,
      subject: data.subject,
      text: body,
    };    
    
    //Send email
    await this.emailService.sendEmail(emailData);
  }

  populateNotiicationSubject(type: NotificationType) {
    switch(type) {
      case NotificationType.SCHEDULE_UPDATE:
        return 'Schedule Update';
      case NotificationType.REQUEST_UPDATE:
        return 'Request Update';
      case NotificationType.PARENT_MEETING_REQUEST:
        return 'Meeting Request';
      case NotificationType.PARENT_MEETING_SCHEDULED:
        return 'Meeting Scheduled';
      case NotificationType.PARENT_MEETING_CANCELLED:
        return 'Meeting Cancelled';
      case NotificationType.PARENT_EMERGENCY_ALERT:
        return 'Emergency Alert';
      case NotificationType.PARENT_GRADE_UPDATE:
        return 'Grade Update';
      case NotificationType.PARENT_ATTENDANCE_ALERT:
        return 'Attendance Alert';
      default:
        return 'Notification';
    }
  }

  // Parent/Guardian specific notification methods
  async createParentNotification(data: {
    parentGuardianId: string;
    message: string;
    type: NotificationType;
    studentId?: string;
  }, sendEmail: boolean = true) {
    const parentGuardian = await this.prisma.parentGuardian.findUnique({
      where: { id: data.parentGuardianId },
      include: { notificationPreferences: true }
    });

    if (!parentGuardian) {
      throw new Error(`Parent/Guardian with ID ${data.parentGuardianId} not found`);
    }

    // Check if parent wants to receive this type of notification
    const preferences = parentGuardian.notificationPreferences;
    if (preferences && !this.shouldSendNotification(preferences, data.type)) {
      this.logger.log(`Skipping notification for parent ${parentGuardian.firstName} ${parentGuardian.lastName} - preferences disabled`);
      return null;
    }

    const notification = await this.createNotification({
      parentGuardianId: data.parentGuardianId,
      studentId: data.studentId,
      message: data.message,
      type: data.type
    }, sendEmail && preferences?.emailEnabled);

    this.logger.log(`Created parent notification for ${parentGuardian.firstName} ${parentGuardian.lastName}`);
    return notification;
  }

  async notifyStudentParents(studentId: string, data: {
    message: string;
    type: NotificationType;
    priority?: 'primary' | 'secondary' | 'emergency' | 'all';
  }, sendEmail: boolean = true) {
    const priority = data.priority || 'primary';
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        primaryParent: {
          include: { notificationPreferences: true }
        },
        secondaryParent: {
          include: { notificationPreferences: true }
        },
        emergencyContact: {
          include: { notificationPreferences: true }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    const notifications = [];

    // Notify based on priority
    if (priority === 'primary' || priority === 'all') {
      if (student.primaryParent) {
        const notification = await this.createParentNotification({
          parentGuardianId: student.primaryParent.id,
          message: data.message,
          type: data.type,
          studentId
        }, sendEmail);
        if (notification) notifications.push(notification);
      }
    }

    if (priority === 'secondary' || priority === 'all') {
      if (student.secondaryParent) {
        const notification = await this.createParentNotification({
          parentGuardianId: student.secondaryParent.id,
          message: data.message,
          type: data.type,
          studentId
        }, sendEmail);
        if (notification) notifications.push(notification);
      }
    }

    if (priority === 'emergency' || priority === 'all') {
      if (student.emergencyContact) {
        const notification = await this.createParentNotification({
          parentGuardianId: student.emergencyContact.id,
          message: data.message,
          type: data.type,
          studentId
        }, sendEmail);
        if (notification) notifications.push(notification);
      }
    }

    this.logger.log(`Notified ${notifications.length} parents for student ${student.user.firstName} ${student.user.lastName}`);
    return notifications;
  }

  private shouldSendNotification(preferences: any, type: NotificationType): boolean {
    switch (type) {
      case 'PARENT_MEETING_REQUEST':
      case 'PARENT_MEETING_SCHEDULED':
      case 'PARENT_MEETING_CANCELLED':
        return preferences.counselorMeetings;
      case 'PARENT_GRADE_UPDATE':
        return preferences.gradeUpdates;
      case 'PARENT_ATTENDANCE_ALERT':
        return preferences.attendanceAlerts;
      case 'PARENT_EMERGENCY_ALERT':
        return preferences.emergencyAlerts;
      case 'REQUEST_CREATED':
      case 'REQUEST_UPDATE':
      case 'REQUEST_APPROVED':
      case 'REQUEST_DENIED':
        return preferences.scheduleChanges;
      default:
        return preferences.generalAnnouncements;
    }
  }
}
