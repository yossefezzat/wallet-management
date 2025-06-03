import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsPositive,
  MaxLength,
} from 'class-validator';

/**
 * Data Transfer Object for withdrawal transactions
 */
export class WithdrawDto {
  @ApiProperty({
    description: 'Account ID to withdraw funds from',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({
    description: 'Amount to withdraw',
    example: 50.75,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'ATM withdrawal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}