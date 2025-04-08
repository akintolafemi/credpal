import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { SubWallets } from './subwallet.entity';

@Entity()
export class Wallets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    unique: true,
  })
  userid: number;

  @Column({
    type: 'varchar',
    length: 10,
    unique: true,
  })
  walletnumber: string;

  @Column({
    type: 'decimal',
    default: '0.00',
    precision: 20,
    scale: 2,
    comment: 'add this in case of all sub wallets aggregation',
  })
  balance: string;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'NGN',
    comment:
      'in case we want to aggregate all wallets balances into one currency',
  })
  currency: string;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  deleted: boolean;

  @DeleteDateColumn()
  deletedat: Date;

  @OneToMany(() => SubWallets, (sub) => sub.superwallet, {
    cascade: true,
  })
  subwallets: SubWallets[];
}
