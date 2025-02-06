import { BadRequestException } from '@nestjs/common';
export class AccountNotVerifiedException extends BadRequestException {
    constructor(error?: string) {
        super(
            'you have to verify your account before you can perform any action!',
            error,
        );
    }
}
