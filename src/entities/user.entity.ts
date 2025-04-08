import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AuditLogs } from './audit.entity';
import { Wallets } from './wallet.entity';
import { SubWallets } from './subwallet.entity';
import { AccountType, AccountTypes } from 'src/types/request.with.user.type';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    type: 'varchar',
    length: 100,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'enum', enum: AccountTypes, default: AccountType.user })
  accounttype: AccountType;

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

  @OneToMany(() => AuditLogs, (audit) => audit.userid)
  auditlogs: AuditLogs[];

  @OneToOne(() => Wallets, (wallet) => wallet.id)
  mainwallet: Wallets;

  @OneToMany(() => SubWallets, (sub) => sub.userid)
  subwallets: SubWallets[];
}
