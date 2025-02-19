import { BadRequestException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { EmailVer } from './entities/emailver.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JWT_EXPIRATION, JWT_SECRET } from './constants';
import { generateVerificationCode, Compare, hashCred } from 'src/utils';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { AccountNotVerifiedException, IncorrectCredentialsException, UserNotFoundException } from 'src/exceptions';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {

    constructor (
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectRepository(EmailVer)
        private emailVerRepository: Repository<EmailVer>,
        @InjectRepository(PasswordReset)
        private passwordResetRepo: Repository<PasswordReset>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async validateUser(email: string, password: string): Promise<User|null> {
        const user = await this.usersService.getUserByEmail(email);

        const passwordMatched = await Compare(password, user.password);

        if (!user.isActive) {
            throw new AccountNotVerifiedException();
        }

        if (user && passwordMatched) {
            return user;
        }

        return null
    }

    async login(data: LoginDto) {
        try {
            const user = await this.validateUser(data.email, data.password);

            if (!user) {
                throw new UnauthorizedException("Invalid Credentials");
            }

            const payload = { email: user.email, sub: user.id };

            return {
                accessToken: await this.jwtService.sign(payload, {
                    secret: JWT_SECRET,
                    expiresIn: JWT_EXPIRATION,
                }),
            };

        } catch (err) {
            throw new BadRequestException(err.message)
        }
    }

    async requestEmailVerification(email: string) {

        try {
            const user = await this.usersService.findByEmail(email);
            let emailVer = await this.emailVerRepository.findOne({
                where: {
                    email: email
                }
            })

            const token = generateVerificationCode();
            const expiry = Date.now() + 24 * 60 * 60 * 1000;

            if (emailVer) {
                emailVer.token = token;
                emailVer.tokenExpiry = expiry;
                emailVer.valid = true;
            } else {
                emailVer = await this.emailVerRepository.create({
                    email: email,
                    token: token,
                    tokenExpiry: expiry
                })
            }


            const newEmailVer = await this.emailVerRepository.save(emailVer);
            
            return newEmailVer;

        } catch(err) {
            throw new BadRequestException(err.message)
        }
    }

    async verifyEmail(data: VerifyEmailDto) {
        try {

            const findEmailVerifyToken = await this.emailVerRepository.findOne({
                where: {
                    token: data.token,
                    email: data.email,
                    valid: true
                }
            })

            if (!findEmailVerifyToken) {
                throw new BadRequestException('Invalid Token!');
            }

            if (findEmailVerifyToken.tokenExpiry < Date.now() || !findEmailVerifyToken.valid) {
                findEmailVerifyToken.valid = false;
                await this.emailVerRepository.save(findEmailVerifyToken)
                throw new BadRequestException(
                    'token expired!, please try verifying your email again',
                )
            }

            const user = await this.usersService.findByEmail(data.email);
            const newUser = {
                emailVerified: true,
                isActive: true,
            }
            newUser.emailVerified = true;
            newUser.isActive = true;
            await this.userRepository.save({
                id: user.id,
                ...newUser,
            })
            await this.emailVerRepository.remove(findEmailVerifyToken);

            return {
                statusCode: HttpStatus.OK,
                message: 'Email verified successfully!',
            };

        } catch (err) {
            throw new BadRequestException(err.message)
        }
    }

    async requestPasswordReset(data: RequestPasswordResetDto) {
        try {
            const user = await this.usersService.findByEmail(data.email);

            let passwordReset = await this.passwordResetRepo.findOne({
                where: {
                    email: user.email
                }
            })

            const token = generateVerificationCode();
            const expiry = Date.now() + 24 * 60 * 60 * 1000;

            if (passwordReset) {
                passwordReset.token = token;
                passwordReset.tokenExpiry = expiry;
            } else {

                passwordReset = await this.passwordResetRepo.create({
                    email: user.email,
                    token: token,
                    tokenExpiry: expiry
                })
            }


            const newPasswordReset = await this.passwordResetRepo.save(passwordReset);
            return newPasswordReset;
        } catch(err) {
            throw new BadRequestException(err.message)
        }
    }

    async resetPassword(data: ResetPasswordDto) {
        try {

            const passwordReset = await this.passwordResetRepo.findOne({
                where: {
                    email: data.email,
                    token: data.token,
                }
            });

            if(!passwordReset) {
                throw new BadRequestException('Invalid Token!');
            }

            if (passwordReset.tokenExpiry < Date.now()) {
                throw new BadRequestException(
                    'token expired!, please try requesting a reset password token',
                );
            }

            if (data.password !== data.confirmPassword) {
                throw new IncorrectCredentialsException('Password Mismatch!');
            }

            const user = await this.usersService.getUserByEmail(passwordReset.email);

            user.password = hashCred(data.password)

            await this.userRepository.save(user);

            return {
                statusCode: HttpStatus.OK,
                message: 'password reset successful!',
            };

        } catch(err) {
            throw new BadRequestException(err.message)
        }
    }

    async changePassword(data: ChangePasswordDto, id: string) {
        const user = await this.usersService.getUserById(id)

        if (!user) {
            throw new UserNotFoundException();
        }

        const validatedUser = await this.validateUser(user.email, data.oldPassword)

        if (!validatedUser) {
            throw new IncorrectCredentialsException('incorrect password!');
        }

        if (data.newPassword != data.confirmPassword) {
            throw new IncorrectCredentialsException('Password Mismatch');
        }

        user.password = hashCred(data.newPassword);

        await this.userRepository.save(user);

        return {
            statusCode: HttpStatus.OK,
            message: 'password changed successfully!',
        };
        
    }

}
