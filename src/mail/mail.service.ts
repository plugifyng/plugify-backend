import { Injectable, Logger } from '@nestjs/common';
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


    constructor (private configService: ConfigService) {
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

    async send(options: EmailOption) {
        try {
            const htmlContent = this.loadTemplate(options.templateName, options.replacements);
            const emailData = {
                toAddress: options.recipients[0],
                subject: options.subject || 'Account Notification',
                template: htmlContent,
                from: 'tech@goviral.africa',
                senderName: 'Mr Monei Support',
                replyTo: options.from || 'support@goviral.africa',
            };
            this.logger.log('Sending email with data:', emailData);
            const response = await this.mailbit.sendEmail(emailData);
            this.logger.log('Email sent successfully:', response);
            return response;
        } catch (error) {
            this.logger.error('Error sending email:', error.message);
            throw new InternalErrorException('Failed to send email');
        }
    }
}
