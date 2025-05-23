import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import SMTPTransport = require('nodemailer/lib/smtp-transport');

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpUser || !smtpPass) {
      this.logger.error('Missing required SMTP credentials:', {
        hasUser: !!smtpUser,
        hasPassword: !!smtpPass
      });
      throw new Error('SMTP credentials are not properly configured');
    }

    const smtpConfig: SMTPTransport.Options = {
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      debug: true,
      logger: true
    };

    this.logger.log('Initializing Gmail SMTP with config:', {
      user: smtpUser,
      service: smtpConfig.service
    });

    // Create reusable transporter object using SMTP
    this.transporter = nodemailer.createTransport(smtpConfig);

    // Verify the transporter configuration
    this.verifyTransporter();
  }

  private async verifyTransporter() {
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter configured successfully');
    } catch (error) {
      this.logger.error('SMTP Configuration:', {
        service: 'gmail',
        user: this.configService.get<string>('SMTP_USER'),
      });
      this.logger.error('Failed to configure email transporter:', error);
      throw new Error('Failed to configure email service');
    }
  }

  async sendEmail(emailData: { 
    to: string; 
    subject: string; 
    text: string;
    html?: string;
  }) {
    try {
      const mailOptions = {
        from: {
          name: 'Schedule Express',
          address: this.configService.get<string>('SMTP_FROM_EMAIL')
        },
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html || emailData.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Helper method to send HTML emails
  async sendHtmlEmail(emailData: { 
    to: string; 
    subject: string; 
    html: string;
    text?: string;
  }) {
    return this.sendEmail({
      ...emailData,
      text: emailData.text || 'Please view this email in an HTML-compatible email client.',
    });
  }

  // Helper method to send notification emails
  async sendNotificationEmail(emailData: {
    to: string;
    subject: string;
    message: string;
    type: string;
  }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Schedule Express Notification</h2>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px;">
          <p style="margin: 0; color: #374151;">${emailData.message}</p>
        </div>
        <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
          This is an automated message from Schedule Express. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendHtmlEmail({
      to: emailData.to,
      subject: emailData.subject,
      html,
    });
  }
}   