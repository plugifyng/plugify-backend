import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { EmailOption } from './types/mail.types';
import { InternalErrorException } from '../exceptions';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    // Create SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE', false), // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });

    // Verify connection
    //this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('SMTP connection verification failed:', error);
    }
  }

  private loadTemplate(
    templateName: string,
    replacements: { [key: string]: string },
  ): string {
    try {
      console.log('Loading template:', templateName);

      // Try multiple possible paths
      const possiblePaths = [
        path.join(__dirname, '../../src/mail/templates', templateName),
        path.join(__dirname, '../mail/templates', templateName),
        path.join(process.cwd(), 'src/mail/templates', templateName),
        path.join(process.cwd(), 'dist/mail/templates', templateName),
      ];

      console.log('Checking paths:', possiblePaths);

      let template: string = '';
      let usedPath: string = '';

      // Try each path until we find one that works
      for (const filePath of possiblePaths) {
        try {
          if (fs.existsSync(filePath)) {
            template = fs.readFileSync(filePath, 'utf8');
            usedPath = filePath;
            break;
          }
        } catch (e) {
          console.log(`Failed to read from path: ${filePath}`, e.message);
        }
      }

      if (!template || template == null) {
        throw new Error(`Template not found: ${templateName}`);
      }

      console.log(`Template loaded successfully from: ${usedPath}`);

      // Apply replacements
      for (const key in replacements) {
        template = template.replace(
          new RegExp(`{{${key}}}`, 'g'),
          replacements[key],
        );
      }

      console.log('Template processed with replacements');
      return template;
    } catch (error) {
      this.logger.error('Error loading email template:', error);
      throw new InternalErrorException(
        `Email template loading failed: ${error.message}`,
      );
    }
  }

  async send(options: EmailOption) {
    try {
      console.log('inside mail service');

      const htmlContent = this.loadTemplate(
        options.templateName,
        options.replacements,
      );

      console.log('loaded component');

      const mailOptions = {
        from: {
          name: 'MrMonei',
          address: 'accounts@mg.mrmonei.goviral.africa',
        },
        to: options.recipients,
        subject: options.subject || 'Account Notification',
        html: htmlContent,
        replyTo: options.from || 'accounts@mg.monei.goviral.africa',
      };

      this.logger.log('Sending email with data:', mailOptions);

      const info = await this.transporter.sendMail(mailOptions);
      console.log(info);
      this.logger.log('Email sent successfully:', info);

      return info;
    } catch (error) {
      this.logger.error('Error sending email:', error.message);
      throw new InternalErrorException('Failed to send email');
    }
  }
}
