import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User email address (must be unique)',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User phone number (must be unique)',
    example: '+2348123456789',
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Password (must be at least 6 characters)',
    example: 'strongpassword123',
  })
  @MinLength(6)
  password: string;
}
