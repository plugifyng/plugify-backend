import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsEnum } from "class-validator";
import { BaseModelDto } from "src/utils/base.model.dto";
import { UserRole } from "src/utils/enums";

export class UserDto extends BaseModelDto {
    @ApiProperty({ description: 'Full name of the user' })
    @IsString()
    name: string;
  
    @ApiProperty({ description: 'User email address' })
    @IsString()
    email: string;
  
    @ApiProperty({ description: 'User phone number' })
    @IsString()
    phone: string;
  
    @ApiProperty({enum: UserRole})
    @IsEnum(UserRole)
    role: UserRole;
  
    @ApiProperty({ description: 'Check if user is active' })
    isActive: boolean;
}