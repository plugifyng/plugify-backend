import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserMapper } from 'src/mappers/user.mapper';
import { DataConflictException, UserNotFoundException } from 'src/exceptions';
import { hashCred } from 'src/utils';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userMapper: UserMapper,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const emailUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      })
  
      if (emailUser) {
        throw new DataConflictException("A user with this email already exists");
      }
  
      const phoneUser = await this.userRepository.findOne({
        where: {
          phone: createUserDto.phone,
        },
      })
  
      if (phoneUser) {
        throw new DataConflictException("A user with this phone number already exists");
      }
  
      const hashedPassword = hashCred(createUserDto.password);
      createUserDto.password = hashedPassword;
  
      let newUser = await this.userRepository.create(createUserDto);
      
      newUser = await this.userRepository.save(newUser);
  
      return this.userMapper.mapToUserDto(newUser);
      
    } catch(err) {
      throw new BadRequestException(err.message)
    }

  }

  async findAll() {
    try {
      const users = await this.userRepository.find();
      return this.userMapper.mapToUserArrayDto(users);
    } catch(err) {
      throw new BadRequestException(err.message)
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: id,
        }
      });

      if (!user) {
        throw new UserNotFoundException;
      }
  
      return this.userMapper.mapToUserDto(user);

    } catch(err) {
      throw new BadRequestException(err.message);
    }
    
  }

  async findByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: email
        },
      });

      if (!user) {
        throw new UserNotFoundException;
      }

      return this.userMapper.mapToUserDto(user);

    } catch(err) {
      throw new BadRequestException(err.message);
    }
    
  }

  async findByPhone(phone: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          phone: phone,
        },
      });

      if (!user) {
        throw new UserNotFoundException;
      }

      return this.userMapper.mapToUserDto(user);
    } catch(err) {
      throw new BadRequestException(err.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {

      const user = await this.userRepository.findOne({
        where: {
          id: id
        }
      })

      if (!user) {
        throw new UserNotFoundException;
      }

      if (updateUserDto.password) {
        throw new BadRequestException(
          'Update your password with the change-password endpoint'
        )
      }

      if (updateUserDto.email) {
        throw new BadRequestException(
          'You cannot update you email'
        )
      }

      const updatedUser = await this.userRepository.save({
        id: user.id,
        ...updateUserDto
      });

      return updatedUser;

    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  async remove(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: id
        }
      });

      if (!user) {
        throw new UserNotFoundException;
      }
      
      await this.userRepository.remove(user);
    } catch(err) {
      throw new BadRequestException(err.message);
    }
    
  }
}
