import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { ErrorService } from '../../common/services/errors/error.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly errorService: ErrorService,
  ) {}

  /**
   * Create a new account
   * @param createAccountDto Account creation data
   * @returns Newly created account
   */
  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create({
      ...createAccountDto,
      balance: 0,
      isActive: true,
    });

    return this.accountRepository.save(account);
  }

  /**
   * Find all accounts
   * @returns List of accounts
   */
  async findAll(): Promise<Account[]> {
    return this.accountRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find account by ID
   * @param id Account ID
   * @returns Account if found
   * @throws NotFoundException if account not found
   */
  async findOne(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, isActive: true },
    });

    if (!account) {
      this.errorService.accountNotFound(id);
    }

    return account;
  }

  /**
   * Get account balance
   * @param id Account ID
   * @returns Account balance
   */
  async getBalance(
    id: string,
  ): Promise<{ accountId: string; balance: number }> {
    const account = await this.findOne(id);
    return {
      accountId: account.id,
      balance: account.balance,
    };
  }

  /**
   * Update account balance
   * @param id Account ID
   * @param amount Amount to add (positive) or subtract (negative)
   * @returns Updated account
   */
  async updateBalance(id: string, amount: number): Promise<Account> {
    const account = await this.findOne(id);
    const newBalance = Number(account.balance) + amount;
    if (newBalance < 0) {
      this.errorService.insufficientFunds();
    }
    account.balance = newBalance;
    return this.accountRepository.save(account);
  }
}
