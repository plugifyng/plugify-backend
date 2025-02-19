import { IsNotEmpty, IsString, IsUUID, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
    @ApiProperty()
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    token: string;

    @ApiProperty()
    @IsString()
    @IsEmail()
    @IsEmail()
    email: string;
}
