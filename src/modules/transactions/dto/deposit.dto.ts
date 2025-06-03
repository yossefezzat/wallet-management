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
 * Data Transfer Object for deposit transactions
 */
export class DepositDto {
  @ApiProperty({
    description: 'Account ID to deposit funds to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({
    description: 'Amount to deposit',
    example: 100.50,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'Salary deposit',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}