import { BaseEntity } from '../../../common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

@Entity('transactions')
export class Transaction extends BaseEntity {
  @ApiProperty({
    enum: TransactionType,
    description: 'Type of transaction (DEPOSIT or WITHDRAWAL)',
  })
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({
    type: Number,
    description: 'Transaction amount',
    example: 100.50
  })
  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @ApiProperty({
    type: String,
    description: 'Transaction description',
    required: false,
    example: 'Monthly salary deposit'
  })
  @Column({ length: 255, nullable: true })
  description?: string;

  @ApiProperty({
    type: String,
    description: 'ID of the associated account'
  })
  @Index()
  @Column({ name: 'account_id' })
  accountId: string;

  @ApiProperty({
    type: () => Account,
    description: 'Associated account details'
  })
  @ManyToOne(() => Account, (account) => account.transactions)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}