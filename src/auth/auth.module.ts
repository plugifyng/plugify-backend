import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserAuthGuard } from './guards/user-auth.guard';
import { EmailVer } from './entities/emailver.entity';
import { PasswordReset } from './entities/password-reset.entity';

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('SECRET_KEY'),
          signOptions: { expiresIn: configService.get<string>('EXPIRES_IN') },
      }),
    }),
    TypeOrmModule.forFeature([EmailVer, User, PasswordReset])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserAuthGuard],
})
export class AuthModule {}
