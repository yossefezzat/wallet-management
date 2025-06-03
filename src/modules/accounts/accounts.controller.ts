import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';
import { ACCOUNT_MESSAGES } from '../../common/constants/error-messages';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created successfully',
    type: Account,
  })
   @ApiBody({
    type: CreateAccountDto,
    description: 'Account creation data',
    examples: {
      example1: {
        value: {
          name: "John Doe",
          description: "Personal savings account"
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<{ data: Account; message: string }> {
    const account = await this.accountsService.create(createAccountDto);
    return {
      data: account,
      message: ACCOUNT_MESSAGES.CREATED,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account details',
    type: Account,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<{ data: Account; message: string }> {
    const account = await this.accountsService.findOne(id);
    return {
      data: account,
      message: ACCOUNT_MESSAGES.FOUND,
    };
  }

  @Get(':id/balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get account balance' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account balance',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async getBalance(@Param('id') id: string): Promise<{
    data: { accountId: string; balance: number };
    message: string;
  }> {
    const balance = await this.accountsService.getBalance(id);
    return {
      data: balance,
      message: ACCOUNT_MESSAGES.BALANCE_RETRIEVED,
    };
  }
}
