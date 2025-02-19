import { Column, Entity } from "typeorm";
import BaseModel from "src/utils/base.model";

@Entity('emailver')
export class EmailVer extends BaseModel {
    @Column({ type: 'varchar', default: '' })
    token?: string;

    @Column({ type: 'varchar', default: '' })
    email?: string;

    @Column({ default: 2 + 15 * 60 * 1000, type: 'bigint' })
    tokenExpiry: number;

    @Column({ default: true })
    valid: boolean;
}