import {
  TransactionStatus,
  TransactionStatusTypes,
  TransactionType,
  TransactionTypes,
} from 'src/types/wallet.types';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SubWallets } from './subwallet.entity';

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    type: 'varchar',
  })
  reference: string;

  @Column({
    type: 'varchar',
  })
  source: string;

  @Column({
    type: 'varchar',
  })
  destination: string;

  @Column({
    type: 'int',
  })
  userid: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
  })
  amount: string;

  @Column({
    type: 'enum',
    enum: TransactionStatusTypes,
    default: TransactionStatus.pending,
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: TransactionTypes,
    default: TransactionType.fund,
  })
  type: TransactionType;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: '0.00',
  })
  rate: string;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  @ManyToOne(() => SubWallets)
  @JoinColumn({ name: 'source', referencedColumnName: 'walletnumber' })
  sourcewallet: SubWallets;

  @ManyToOne(() => SubWallets)
  @JoinColumn({ name: 'destination', referencedColumnName: 'walletnumber' })
  destinationwallet: SubWallets;
}
