import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction amount',
    example: 100.50,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Account ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'Salary deposit',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}