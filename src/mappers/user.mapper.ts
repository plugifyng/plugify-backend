import { Injectable } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import { UserDto } from "src/users/dto/user.dto";


@Injectable()
export class UserMapper {
    mapToUserDto(user: UserDto): UserDto {
        const userData = new UserDto();

        userData.id = user.id;
        userData.email = user.email;
        userData.phone = user.phone;
        userData.name = user.name;
        userData.role = user.role;
        userData.isActive = user.isActive;
        userData.createdAt = user.createdAt;
        userData.updatedAt = user.updatedAt;
        userData.deletedDate = user.deletedDate;

        return userData;
    }

    mapToUserArrayDto(users: User[]): UserDto[] {
        return users.map((user) => this.mapToUserDto(user))
    }
}