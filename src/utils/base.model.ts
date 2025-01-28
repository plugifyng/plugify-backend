import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as AppConstant from './constants';

export default abstract class BaseModel {
  @PrimaryGeneratedColumn(AppConstant.UUID)
  id: string;

  @CreateDateColumn({
    type: AppConstant.TIMESTAMP,
    default: () => AppConstant.DEFAULT_TIMESTAMP,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: AppConstant.TIMESTAMP,
    default: () => AppConstant.DEFAULT_TIMESTAMP,
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    type: AppConstant.TIMESTAMP,
  })
  deletedDate?: Date;
}
