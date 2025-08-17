import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import SMTPTransport = require('nodemailer/lib/smtp-transport');
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly templatesDir: string;

  constructor(private readonly configService: ConfigService) {
    // Set up templates directory - handle both development and production paths
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      // In production, templates are copied to dist/templates
      this.templatesDir = path.join(process.cwd(), 'dist', 'templates');
    } else {
      // In development, templates are in the root templates directory
      this.templatesDir = path.join(process.cwd(), 'templates');
    }
    
    // Create templates directory if it doesn't exist
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
      this.logger.log(`Created templates directory: ${this.templatesDir}`);
    }

    this.logger.log(`Using templates directory: ${this.templatesDir}`);

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
    
    // Initialize email templates
    this.initializeTemplates();
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

  // EJS Template Methods
  private async renderTemplate(templateName: string, data: any): Promise<string> {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.ejs`);
      
      this.logger.log(`Looking for template at: ${templatePath}`);
      this.logger.log(`Templates directory: ${this.templatesDir}`);
      this.logger.log(`Directory exists: ${fs.existsSync(this.templatesDir)}`);
      
      if (!fs.existsSync(templatePath)) {
        this.logger.warn(`Template not found: ${templatePath}`);
        // List files in templates directory for debugging
        if (fs.existsSync(this.templatesDir)) {
          const files = fs.readdirSync(this.templatesDir);
          this.logger.log(`Files in templates directory: ${files.join(', ')}`);
        }
        throw new Error(`Template not found: ${templateName}`);
      }

      const template = fs.readFileSync(templatePath, 'utf8');
      return ejs.render(template, data);
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      throw new Error(`Failed to render template: ${error.message}`);
    }
  }

  // Send email using EJS template
  async sendTemplatedEmail(emailData: {
    to: string;
    subject: string;
    template: string;
    data: any;
  }) {
    try {
      const html = await this.renderTemplate(emailData.template, emailData.data);
      
      return this.sendHtmlEmail({
        to: emailData.to,
        subject: emailData.subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send templated email: ${error.message}`);
      throw error;
    }
  }

  // Send verification code email
  async sendVerificationCodeEmail(emailData: {
    to: string;
    firstName?: string;
    verificationCode: string;
    actionUrl?: string;
    actionText?: string;
  }) {
    return this.sendTemplatedEmail({
      to: emailData.to,
      subject: 'Your SchedExpress Verification Code',
      template: 'verification-code',
      data: {
        firstName: emailData.firstName,
        verificationCode: emailData.verificationCode,
        actionUrl: emailData.actionUrl,
        actionText: emailData.actionText,
      },
    });
  }

  // Create default email templates (now just ensures templates directory exists)
  async createDefaultTemplates() {
    // Templates are now stored as separate .ejs files in the templates directory
    // This method now just ensures the templates directory exists
    this.logger.log('Email templates are stored as separate files in templates directory');
  }

  // Initialize default templates
  async initializeTemplates() {
    try {
      await this.createDefaultTemplates();
      this.logger.log('Email templates initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email templates:', error);
    }
  }
}   