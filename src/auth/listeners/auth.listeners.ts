import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { AuthNotification } from "../events";
import { MailService } from "src/mail/mail.service";


@Injectable()
export class AuthEventListener {
    constructor (
        private readonly mailService: MailService
    ) {}

    @OnEvent('auth.*')
    async handleUserEvent(event: AuthNotification) {
        const emailEvent = await this.mailService.send(event);
        return emailEvent;
    }
}