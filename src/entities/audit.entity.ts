import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class AuditLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
  })
  userid: number;

  @Column({
    type: 'varchar',
    length: '100',
  })
  action: string;

  @Column({
    type: 'text',
  })
  note: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: null,
  })
  ip: string;

  @Column({
    type: 'varchar',
    default: null,
  })
  useragent: string;

  @CreateDateColumn()
  createdat: Date;
}
