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
    // Set up templates directory
    this.templatesDir = path.join(__dirname, 'templates');
    
    // Create templates directory if it doesn't exist
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
      this.logger.log(`Created templates directory: ${this.templatesDir}`);
    }

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
      
      if (!fs.existsSync(templatePath)) {
        this.logger.warn(`Template not found: ${templatePath}`);
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

  // Create default email templates
  async createDefaultTemplates() {
    const templates = {
      'notification': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= subject %></title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Schedule Express</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="color: #374151; margin-bottom: 20px;"><%= title %></h2>
            
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #374151; line-height: 1.6;"><%= message %></p>
            </div>
            
            <% if (actionUrl) { %>
            <div style="text-align: center; margin: 30px 0;">
                <a href="<%= actionUrl %>" style="background-color: #4F46E5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    <%= actionText || 'View Details' %>
                </a>
            </div>
            <% } %>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6B7280; font-size: 14px; margin: 0;">
                    This is an automated message from Schedule Express. Please do not reply to this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      
      'grade-notification': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grade Update - <%= courseName %></title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Schedule Express</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="color: #374151; margin-bottom: 20px;">Grade Update</h2>
            
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #374151; line-height: 1.6;">
                    Dear <strong><%= studentName %></strong>,
                </p>
                <br>
                <p style="margin: 0; color: #374151; line-height: 1.6;">
                    Your grade for <strong><%= courseName %></strong> has been updated.
                </p>
                <br>
                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border-left: 4px solid #4F46E5;">
                    <p style="margin: 0; font-size: 18px;">
                        <strong>Grade:</strong> <span style="color: #4F46E5; font-weight: bold;"><%= grade %></span>
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #6B7280;">
                        <strong>Status:</strong> <%= isPassed ? 'Passing' : 'Failing' %>
                    </p>
                </div>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6B7280; font-size: 14px; margin: 0;">
                    This is an automated message from Schedule Express. Please do not reply to this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      
      'schedule-change': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Schedule Change Request</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Schedule Express</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="color: #374151; margin-bottom: 20px;">Schedule Change Request</h2>
            
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #374151; line-height: 1.6;">
                    A new schedule change request has been submitted.
                </p>
                <br>
                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px;">
                    <p style="margin: 0; font-size: 14px;"><strong>Requested By:</strong> <%= requesterName %></p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Course:</strong> <%= courseName %></p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Reason:</strong> <%= reason %></p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Status:</strong> <%= status %></p>
                </div>
            </div>
            
            <% if (actionUrl) { %>
            <div style="text-align: center; margin: 30px 0;">
                <a href="<%= actionUrl %>" style="background-color: #4F46E5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Review Request
                </a>
            </div>
            <% } %>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6B7280; font-size: 14px; margin: 0;">
                    This is an automated message from Schedule Express. Please do not reply to this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`
    };

    for (const [templateName, content] of Object.entries(templates)) {
      const templatePath = path.join(this.templatesDir, `${templateName}.ejs`);
      if (!fs.existsSync(templatePath)) {
        fs.writeFileSync(templatePath, content);
        this.logger.log(`Created template: ${templateName}.ejs`);
      }
    }
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