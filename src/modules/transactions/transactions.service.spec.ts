import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionManager } from '../../common/database/transaction.manager';
import { BadRequestException } from '@nestjs/common';
import { AppLoggerService } from '../../common/services/logger/logger.service';

type MockRepository<T extends object = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends object = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
  findAndCount: jest.fn(), // Add findAndCount method
});

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: MockRepository<Transaction>;
  let accountsService: Partial<AccountsService>;
  let transactionManager: Partial<TransactionManager>;
  let loggerService: Partial<AppLoggerService>;

  beforeEach(async () => {
    accountsService = {
      findOne: jest.fn(),
      updateBalance: jest.fn(),
    };

    loggerService = {
      setContext: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    transactionManager = {
      executeTransaction: jest.fn().mockImplementation((callback) => {
        const entityManager = {
          save: jest.fn().mockImplementation((entityClass, entity) => Promise.resolve(entity)),
        };
        return callback(entityManager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: createMockRepository(),
        },
        {
          provide: AccountsService,
          useValue: accountsService,
        },
        {
          provide: TransactionManager,
          useValue: transactionManager,
        },
        {
          provide: AppLoggerService,
          useValue: loggerService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get<MockRepository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    let accountId: string;
    let amount: number;
    let description: string;
    let transaction: Transaction;

    beforeEach(() => {
      accountId = 'test-account-id';
      amount = 100;
      description = 'Test deposit';

      transaction = {
        account: {
          id: 'someAccountId',
          name: 'Test Account',
          balance: 1000,
          isActive: true,
          transactions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        id: 'test-transaction-id' as string,
        type: TransactionType.DEPOSIT,
        amount,
        accountId,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create!.mockReturnValue(transaction);
      repository.save!.mockResolvedValue(transaction);
      (accountsService.findOne as jest.Mock).mockResolvedValue({ id: accountId, balance: 0 });
      (accountsService.updateBalance as jest.Mock).mockResolvedValue({
        id: accountId,
        balance: amount,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create a deposit transaction and update account balance', async () => {
      const result = await service.deposit({ accountId, amount, description });

      expect(transactionManager.executeTransaction).toHaveBeenCalled();
      expect(accountsService.findOne).toHaveBeenCalledWith(accountId);
      expect(repository.create).toHaveBeenCalledWith({
        type: TransactionType.DEPOSIT,
        amount,
        accountId,
        description,
      });
      expect(result).toEqual(transaction);
    });
  });

  describe('withdraw', () => {
    let accountId: string;
    let amount: number;
    let description: string;
    let initialBalance: number;
    let transaction: Transaction;

    beforeEach(() => {
      accountId = 'test-account-id';
      amount = 50;
      description = 'Test withdrawal';
      initialBalance = 100;

      transaction = {
        account: {
          id: 'someAccountId',
          name: 'Test Account',
          balance: 1000,
          isActive: true,
          transactions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        id: 'test-transaction-id',
        type: TransactionType.WITHDRAWAL,
        amount,
        accountId,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create!.mockReturnValue(transaction);
      repository.save!.mockResolvedValue(transaction);
      (accountsService.findOne as jest.Mock).mockResolvedValue({
        id: accountId,
        balance: initialBalance,
      });
      (accountsService.updateBalance as jest.Mock).mockResolvedValue({
        id: accountId,
        balance: initialBalance - amount,
      });

      // Update transaction manager mock for withdraw tests
      transactionManager.executeTransaction = jest.fn().mockImplementation(async (callback) => {
        const entityManager = {
          save: jest.fn().mockImplementation((entityClass, entity) => Promise.resolve(entity)),
        };
        try {
          return await callback(entityManager);
        } catch (error) {
          throw error;
        }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create a withdrawal transaction and update account balance', async () => {
      const result = await service.withdraw({accountId, amount, description});

      expect(transactionManager.executeTransaction).toHaveBeenCalled();
      expect(accountsService.findOne).toHaveBeenCalledWith(accountId);
      expect(repository.create).toHaveBeenCalledWith({
        type: TransactionType.WITHDRAWAL,
        amount,
        accountId,
        description,
      });
      expect(accountsService.updateBalance).toHaveBeenCalledWith(accountId, -amount);
      expect(result).toEqual(transaction);
    });

    it('should throw BadRequestException when insufficient funds', async () => {
      const largeAmount = 150;
      (accountsService.updateBalance as jest.Mock).mockRejectedValueOnce(
        new BadRequestException('Insufficient funds')
      );

      await expect(
        service.withdraw({accountId, amount: largeAmount, description})
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByAccountId', () => {
    let accountId: string;
    let page: number;
    let limit: number;
    let transactions: Transaction[];
    let total: number;

    beforeEach(() => {
      accountId = 'test-account-id';
      page = 1;
      limit = 10;
      transactions = [
        {
          account: {
            id: 'someAccountId',
            name: 'Test Account',
            balance: 1000,
            isActive: true,
            transactions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          id: 'trans1',
          accountId,
          amount: 100,
          type: TransactionType.DEPOSIT,
          description: 'Deposit 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          account: {
            id: 'someAccountId',
            name: 'Test Account',
            balance: 1000,
            isActive: true,
            transactions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          id: 'trans2',
          accountId,
          amount: 50,
          type: TransactionType.WITHDRAWAL,
          description: 'Withdrawal 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      total = 2;
      
      repository.findAndCount!.mockResolvedValue([transactions, total]);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return paginated transactions for a given accountId', async () => {
      const result = await service.findByAccountId(accountId);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { accountId },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' }, // Add this if your service uses it
      });
      expect(result.transactions).toEqual(transactions);
      expect(result.total).toEqual(total);
    });

    it('should return an empty array and zero total if no transactions are found', async () => {
      repository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findByAccountId(accountId);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { accountId },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' }, // Add this if your service uses it
      });
      expect(result.transactions).toEqual([]);
      expect(result.total).toEqual(0);
    });
  });
});
