import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallets } from './wallet.entity';

@Entity()
export class SubWallets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
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
  })
  balance: string;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'NGN',
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

  @ManyToOne(() => Wallets, (wallet) => wallet.subwallets)
  @JoinColumn({ name: 'superwalletid' })
  superwallet: Wallets;
}
