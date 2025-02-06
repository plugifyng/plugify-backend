import { Entity, Column } from 'typeorm';
import BaseModel from 'src/utils/base.model';
import { UserRole } from 'src/utils/enums';


@Entity({ name: 'users' }) // Explicitly naming the table
export class User extends BaseModel {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;
}
