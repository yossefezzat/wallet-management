import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../common/services/logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionManager } from '../../common/database/transaction.manager';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginationDto, SortOrder } from '../../common/dto/pagination.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly accountsService: AccountsService,
    private readonly transactionManager: TransactionManager,
    private readonly logger: AppLoggerService
  ) {
    this.logger.setContext(TransactionsService.name);
  }

  /**
   * Creates a new transaction and updates the account balance accordingly
   * @param createTransactionDto The DTO containing transaction details
   * @returns The created transaction
   */
  private async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    this.logger.debug('Creating transaction', 'create', {
      accountId: createTransactionDto.accountId,
      amount: createTransactionDto.amount,
      transactionType: createTransactionDto.type,
    });
    const { type, amount, accountId } = createTransactionDto;

    this.logger.debug('Starting database transaction with REPEATABLE READ isolation level', 'create', {
        accountId: createTransactionDto.accountId,
        amount: createTransactionDto.amount,
        transactionType: createTransactionDto.type,
      });
    return this.transactionManager.executeTransaction(async (entityManager) => {

      this.logger.debug('Verifying account exists', 'create', {
        accountId: createTransactionDto.accountId,
        amount: createTransactionDto.amount,
        transactionType: createTransactionDto.type,
      });
      await this.accountsService.findOne(accountId);

      this.logger.debug('Creating transaction record', 'create', {
        accountId: createTransactionDto.accountId,
        amount: createTransactionDto.amount,
        transactionType: createTransactionDto.type,
      });
      const transaction = this.transactionRepository.create(createTransactionDto);
      const savedTransaction = await entityManager.save(Transaction, transaction);

      this.logger.debug('Transaction created', 'create', {
        accountId: createTransactionDto.accountId,
        amount: createTransactionDto.amount,
        transactionType: createTransactionDto.type,
        transactionId: savedTransaction.id
      });

      const balanceChange = type === TransactionType.DEPOSIT ? amount : -amount;
      const metadataWithBalance = {
        accountId: createTransactionDto.accountId,
        amount: createTransactionDto.amount,
        transactionType: createTransactionDto.type,
        balanceChange
      };
      this.logger.debug('Updating account balance', 'create', metadataWithBalance);

      try {
        await this.accountsService.updateBalance(accountId, balanceChange);
        this.logger.debug('Account balance updated successfully', 'create', metadataWithBalance);
      } catch (error) {
        const errorMetadata = {
          ...metadataWithBalance,
          errorMessage: error.message
        };
        this.logger.error('Failed to update account balance', error.stack, 'create', errorMetadata);
        throw error;
      }

      this.logger.debug('Transaction completed successfully', 'create', metadataWithBalance);
      return savedTransaction;
    }, 'REPEATABLE READ');
  }

  /**
   * Creates a deposit transaction for an account
   * @param depositDto The DTO containing deposit details
   * @returns The created deposit transaction
   */
  async deposit(depositDto: DepositDto): Promise<Transaction> {
    this.logger.debug('Processing deposit', 'deposit', {
      accountId: depositDto.accountId,
      amount: depositDto.amount,
      operation: 'deposit',
    });
    const { accountId, amount, description } = depositDto;
    return this.create({
      type: TransactionType.DEPOSIT,
      amount,
      accountId,
      description,
    });
  }

  /**
   * Creates a withdrawal transaction for an account
   * @param withdrawDto The DTO containing withdrawal details
   * @returns The created withdrawal transaction
   */
  async withdraw(withdrawDto: WithdrawDto): Promise<Transaction> {
    this.logger.debug('Processing withdrawal', 'withdraw', {
      accountId: withdrawDto.accountId,
      amount: withdrawDto.amount,
      operation: 'withdraw',
    });
    const { accountId, amount, description } = withdrawDto;
    return this.create({
      type: TransactionType.WITHDRAWAL,
      amount,
      accountId,
      description,
    });
  }

  /**
   * Retrieves paginated transactions for a specific account
   * @param accountId The ID of the account to find transactions for
   * @param paginationDto Optional pagination parameters
   * @returns Object containing the transactions and total count
   */
  async findByAccountId(
    accountId: string,
    paginationDto?: PaginationDto,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    this.logger.debug('Finding transactions', 'findByAccountId', { accountId });
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = SortOrder.DESC } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    
    this.logger.debug('Querying transactions with pagination', 'findByAccountId', {accountId});
    
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { accountId },
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });
    
    const resultMetadata = {
      accountId,
      resultCount: transactions.length,
      totalCount: total
    };
    this.logger.debug('Found transactions', 'findByAccountId', resultMetadata);
    return { transactions, total };
  }
}
