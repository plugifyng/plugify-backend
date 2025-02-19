import { Column, Entity } from "typeorm";
import BaseModel from "src/utils/base.model";


@Entity('password-reset')
export class PasswordReset extends BaseModel {
    @Column()
    email: string;

    @Column()
    token: string;

    @Column({ default: 2 + 15 * 60 * 1000, type: 'bigint' })
    tokenExpiry: number;
}