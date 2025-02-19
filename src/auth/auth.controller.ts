import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify.dto';
import { ApiOkResponse, ApiOperation, ApiBody, ApiParam, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password';
import { UserAuthGuard } from './guards/user-auth.guard';
import { User } from 'src/users/decorators/user.decorator';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'login a user' })
  @Post('login')
  async login(@Body() data: LoginDto) {
    return await this.authService.login(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: 'Send verification email to a user' })
  @ApiParam({ type: 'string', name: 'email' })
  @Post('send-verification-email/:email')
  async sendVerificationEmail(@Param('email') email: string) {
    return await this.authService.requestEmailVerification(email);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with token'})
  @ApiBody({type: VerifyEmailDto})
  @ApiOkResponse({ status: HttpStatus.OK })
  @Post('verify-email')
  async verifyEmail(@Body() data: VerifyEmailDto) {
    return await this.authService.verifyEmail(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request Password Reset Email'})
  @ApiOkResponse({ status: HttpStatus.OK })
  @ApiBody({ type: RequestPasswordResetDto })
  @Post('request-password-reset')
  async requestPasswordReset(@Body() data: RequestPasswordResetDto) {
    return await this.authService.requestPasswordReset(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset Password'})
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ status: HttpStatus.OK })
  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return await this.authService.resetPassword(data);
  }

  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password'})
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({ status: HttpStatus.OK })
  @Post('change-password')
  async changePassword(@Body() data: ChangePasswordDto, @User() user: any) {

    return await this.authService.changePassword(data, user.id)
  }
}
