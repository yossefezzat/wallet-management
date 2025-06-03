import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Account description',
    example: 'Personal savings account',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
