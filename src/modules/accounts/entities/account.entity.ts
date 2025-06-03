import { BaseEntity } from '../../../common/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';
@Entity('accounts')
export class Account extends BaseEntity {
  @ApiProperty({ description: 'The name of the account', maxLength: 100 })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ 
    description: 'The current balance of the account',
    type: 'number',
    default: 0,
    example: 1000.50
  })
  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  balance: number;
 
  @ApiProperty({ 
    description: 'Optional description of the account',
    maxLength: 255,
    required: false
  })
  @Column({ length: 255, nullable: true })
  description?: string;

  @ApiProperty({ 
    description: 'Whether the account is active',
    default: true
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ 
    description: 'Transactions associated with this account',
    type: () => [Transaction]
  })
  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];
}
