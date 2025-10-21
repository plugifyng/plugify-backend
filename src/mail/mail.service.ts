import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import * as Mailbit from "mailbit-library-nodejs";
import * as fs from "fs";
import * as path from "path";
import { EmailOption } from 'src/types/mail.types';
import { InternalErrorException } from 'src/exceptions';

@Injectable()
export class MailService {
    private mailbit;
    private logger = new Logger(MailService.name);
    private apiKey = this.configService.get('MAILBIT_API_KEY');
    private apiUrl = this.configService.get('MAILBIT_API_URL');


    constructor (
        private configService: ConfigService,
        private httpService: HttpService,
    ) {
        const apiKey = configService.get('MAILBIT_API_KEY');
        this.mailbit = new Mailbit(apiKey);
    }


    private loadTemplate(templateName: string, replacements: { [key: string]: string }): string {
        try {
            const filePath = path.join(__dirname, '../../src/mail/templates', templateName);
            let template = fs.readFileSync(filePath, 'utf8');
            for (const key in replacements) {
                template = template.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
            }
            return template;
        } catch (error) {
            console.error('Error loading email template:', error);
            throw new InternalErrorException('Email template loading failed');
        }
    }

    private handleError(error: any): { code: string; message: string }[] {
        const errors: { code: string; message: string }[] = [];
    
        if (error.response) {
          const errorData = error.response.data;
          if (Array.isArray(errorData)) {
            errorData.forEach((err) => {
              errors.push({
                code: err.code || 'Unknown',
                message: err.message || 'No error message provided',
              });
            });
          } else {
            errors.push({
              code: errorData.code || 'Unknown',
              message: errorData.message || 'No error message provided',
            });
          }
        } else {
          errors.push({
            code: error.code || 'Unknown',
            message: error.message || 'No error message provided',
          });
        }
    
        return errors;
      }

    async sendWithMailbit(emailData) {
        try {

            const response: AxiosResponse = await firstValueFrom(
                this.httpService.post(this.apiUrl, emailData, {
                  headers: { token: this.apiKey },
                }),
            );
        
            console.log('Email successfully sent:', response.data);
            return response.data;

        } catch (error) {
            const errors = this.handleError(error);
            this.logger.error('Error sending email:', errors);
            throw new InternalErrorException('Failed to send email'); 
        }
    }

    async send(options: EmailOption) {
        try {
            const htmlContent = this.loadTemplate(options.templateName, options.replacements);
            const emailData = {
                toAddress: options.recipients[0],
                subject: options.subject || 'Account Notification',
                template: htmlContent,
                from: 'support@plugify.ng',
                senderName: 'Plugify Support',
                replyTo: options.from || 'support@plugify.ng',
            };
            this.logger.log('Sending email with data:', emailData);
            const response = await this.sendWithMailbit(emailData);
            this.logger.log('Email sent successfully:', response);
            return response;
        } catch (error) {
            this.logger.error('Error sending email:', error.message);
            throw new InternalErrorException('Failed to send email');
        }
    }
}
