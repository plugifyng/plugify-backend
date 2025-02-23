import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthGuard } from 'src/auth/guards/user-auth.guard';
import { User } from './entities/user.entity';
import { UserMapper } from 'src/mappers/user.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserMapper, UserAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
