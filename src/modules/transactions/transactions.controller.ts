import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AppLoggerService } from '../../common/services/logger/logger.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { Transaction } from './entities/transaction.entity';
import { TRANSACTION_MESSAGES, TRANSACTION_ERRORS, ACCOUNT_ERRORS } from '../../common/constants/error-messages';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/pagination.interface';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly logger: AppLoggerService
  ) {
    this.logger.setContext(TransactionsController.name);
  }

  @Post('deposit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Deposit funds to an account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: TRANSACTION_MESSAGES.DEPOSIT_SUCCESSFUL,
    type: Transaction,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: TRANSACTION_ERRORS.INVALID_AMOUNT,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: ACCOUNT_ERRORS.NOT_FOUND(''),
  })
  @ApiBody({ type: DepositDto })
  async deposit(
    @Body() depositDto: DepositDto,
  ): Promise<{ data: Transaction; message: string }> {
    this.logger.debug('Processing deposit request', 'deposit', {
      accountId: depositDto.accountId,
      amount: depositDto.amount,
      transactionType: 'deposit'
    });
    const transaction = await this.transactionsService.deposit(depositDto);
    this.logger.debug('Deposit successful', 'deposit', {
      accountId: depositDto.accountId,
      amount: depositDto.amount,
      transactionType: 'deposit'
    });
    return {
      data: transaction,
      message: TRANSACTION_MESSAGES.DEPOSIT_SUCCESSFUL,
    };
  }
  
  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Withdraw funds from an account' })
  @ApiBody({ type: WithdrawDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: TRANSACTION_MESSAGES.WITHDRAWAL_SUCCESSFUL,
    type: Transaction,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: ACCOUNT_ERRORS.INSUFFICIENT_FUNDS,
  })
  async withdraw(
    @Body() withdrawDto: WithdrawDto,
  ): Promise<{ data: Transaction; message: string }> {
    const transaction = await this.transactionsService.withdraw(withdrawDto);
    this.logger.debug('withdrawal successful', 'withdraw', {
      accountId: withdrawDto.accountId,
      amount: withdrawDto.amount,
      transactionType: 'withdrawal'
    });
    return {
      data: transaction,
      message: TRANSACTION_MESSAGES.WITHDRAWAL_SUCCESSFUL,
    };
  }

  @Get('account/:accountId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all transactions for an account with pagination' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiQuery({ type: PaginationDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: TRANSACTION_MESSAGES.TRANSACTIONS_RETRIEVED,
    schema: {
      allOf: [
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Transaction' },
            },
            meta: {
              type: 'object',
              properties: {
                totalItems: { type: 'number' },
                itemsPerPage: { type: 'number' },
                currentPage: { type: 'number' },
                totalPages: { type: 'number' },
                hasNextPage: { type: 'boolean' },
                hasPreviousPage: { type: 'boolean' },
              },
            },
            message: { type: 'string' },
          },
        },
      ],
    },
  })
  async findByAccountId(
    @Param('accountId') accountId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Transaction>> {
    this.logger.debug('Retrieving transactions', 'findByAccountId', {
      accountId,
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
    });
    const { transactions, total } = await this.transactionsService.findByAccountId(
      accountId,
      paginationDto,
    );
    
    const totalPages = Math.ceil(total / (paginationDto.limit || 10));
    const currentPage = paginationDto.page;
    
    return {
      data: transactions,
      meta: {
        totalItems: total,
        itemsPerPage: paginationDto.limit || 10,
        currentPage: currentPage || 1,
        totalPages: totalPages,
        hasNextPage: (currentPage || 1) < totalPages,
        hasPreviousPage: (currentPage || 1) > 1,
      },
      message: TRANSACTION_MESSAGES.TRANSACTIONS_RETRIEVED,
    };
  }
}
