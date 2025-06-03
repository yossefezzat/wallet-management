import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AppLoggerService } from '../../common/services/logger/logger.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: Partial<TransactionsService>;
  let loggerService: Partial<AppLoggerService>;

  beforeEach(async () => {
    transactionsService = {
      deposit: jest.fn(),
      withdraw: jest.fn(),
      findByAccountId: jest.fn(),
    };

    loggerService = {
      setContext: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: transactionsService,
        },
        {
          provide: AppLoggerService,
          useValue: loggerService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deposit', () => {
    let depositDto: DepositDto;
    let expectedTransaction: Transaction;

    beforeEach(() => {
      depositDto = {
        accountId: 'someAccountId',
        amount: 100,
        description: 'Test Deposit',
      };
      expectedTransaction = {
        account: {
          id: 'someAccountId',
          name: 'Test Account',
          balance: 1000,
          isActive: true,
          transactions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        id: 'someTransactionId',
        accountId: 'someAccountId',
        amount: 100,
        type: TransactionType.DEPOSIT,
        description: 'Test Deposit',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(transactionsService, 'deposit').mockResolvedValue(expectedTransaction);
    });

    afterEach(() => {
        jest.spyOn(transactionsService, 'deposit').mockRestore();
    });

    it('should successfully deposit funds', async () => {
      const result = await controller.deposit(depositDto);

      expect(transactionsService.deposit).toHaveBeenCalledWith(depositDto);
      expect(loggerService.debug).toHaveBeenCalledWith(
        'Processing deposit request',
        'deposit',
        { accountId: depositDto.accountId, amount: depositDto.amount, transactionType: 'deposit' },
      );
      expect(loggerService.debug).toHaveBeenCalledWith(
        'Deposit successful',
        'deposit',
        { accountId: depositDto.accountId, amount: depositDto.amount, transactionType: 'deposit' },
      );
      expect(result.data).toEqual(expectedTransaction);
      expect(result.message).toBe('Deposit successful');
    });
  });

  describe('withdraw', () => {
    let withdrawDto: WithdrawDto;
    let expectedTransaction: Transaction;
    beforeEach(() => {
      withdrawDto = {
        accountId: 'someAccountId',
        amount: 50,
        description: 'Test Withdrawal',
      };
      expectedTransaction = {
        account: {
          id: 'someAccountId',
          name: 'Test Account',
          balance: 1000,
          isActive: true,
          transactions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        id: 'someTransactionId',
        accountId: 'someAccountId',
        amount: 50,
        type: TransactionType.WITHDRAWAL,
        description: 'Test Withdrawal',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(transactionsService, 'withdraw').mockResolvedValue(expectedTransaction);
    });

    afterEach(() => {
      jest.spyOn(transactionsService, 'withdraw').mockRestore();
    });

    it('should successfully withdraw funds', async () => {
      const result = await controller.withdraw(withdrawDto);

      expect(transactionsService.withdraw).toHaveBeenCalledWith(withdrawDto);
      expect(loggerService.debug).toHaveBeenCalledWith(
        'withdrawal successful',
        'withdraw',
        { accountId: withdrawDto.accountId, amount: withdrawDto.amount, transactionType: 'withdrawal' },
      );
      expect(result.data).toEqual(expectedTransaction);
      expect(result.message).toBe('Withdrawal successful');
    });
  });

  describe('findByAccountId', () => {
    let accountId: string;
    let paginationDto: PaginationDto;
    let transactions: Transaction[];
    let total: number;

    beforeEach(() => {
      accountId = 'someAccountId';
      paginationDto = { page: 1, limit: 10, skip: 0 };
      transactions = [
        {
          id: 'trans1',
          account: {
            id: 'someAccountId',
            name: 'Test Account',
            balance: 1000,
            isActive: true,
            transactions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          accountId,
          amount: 100,
          type: TransactionType.DEPOSIT,
          description: 'Deposit 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'trans2',
          accountId,
          account: {
            id: 'someAccountId',
            name: 'Test Account', 
            balance: 1000,
            isActive: true,
            transactions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          amount: 50,
          type: TransactionType.WITHDRAWAL,
          description: 'Withdrawal 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      total = 2;
      jest.spyOn(transactionsService, 'findByAccountId').mockResolvedValue({ transactions, total });
    });

    afterEach(() => {
      jest.spyOn(transactionsService, 'findByAccountId').mockRestore();
    });

    it('should return paginated transactions for an account', async () => {
      const result = await controller.findByAccountId(accountId, paginationDto);

      expect(transactionsService.findByAccountId).toHaveBeenCalledWith(accountId, paginationDto);
      expect(loggerService.debug).toHaveBeenCalledWith(
        'Retrieving transactions',
        'findByAccountId',
        { accountId, page: paginationDto.page, limit: paginationDto.limit },
      );
      expect(result.data).toEqual(transactions);
      expect(result.meta).toEqual({
        totalItems: total,
        itemsPerPage: paginationDto.limit,
        currentPage: paginationDto.page,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      expect(result.message).toBe('Transactions retrieved successfully');
    });

    it('should handle default pagination values', async () => {
      paginationDto = { page: 1, limit: 10, skip: 0 };
      transactions = [
        {
          id: 'trans1',
          accountId,
          account: {
            id: 'someAccountId',
            name: 'Test Account',
            balance: 1000,
            isActive: true,
            transactions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          amount: 100,
          type: TransactionType.DEPOSIT,
          description: 'Deposit 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      total = 1;

      jest.spyOn(transactionsService, 'findByAccountId').mockResolvedValue({ transactions, total });

      const result = await controller.findByAccountId(accountId, paginationDto);

      expect(transactionsService.findByAccountId).toHaveBeenCalledWith(accountId, paginationDto);
      expect(loggerService.debug).toHaveBeenCalledWith(
        'Retrieving transactions',
        'findByAccountId',
        { accountId, page: 1, limit: 10 },
      );
      expect(result.data).toEqual(transactions);
      expect(result.meta).toEqual({
        totalItems: total,
        itemsPerPage: 10,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      expect(result.message).toBe('Transactions retrieved successfully');
    });

    it('should return an empty array if no transactions are found', async () => {
      transactions = [];
      total = 0;
      jest.spyOn(transactionsService, 'findByAccountId').mockResolvedValue({ transactions, total });

      const result = await controller.findByAccountId(accountId, paginationDto);

      expect(transactionsService.findByAccountId).toHaveBeenCalledWith(accountId, paginationDto);
      expect(loggerService.debug).toHaveBeenCalledWith(
        'Retrieving transactions',
        'findByAccountId',
        { accountId, page: paginationDto.page, limit: paginationDto.limit },
      );
      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        totalItems: 0,
        itemsPerPage: paginationDto.limit,
        currentPage: paginationDto.page,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      expect(result.message).toBe('Transactions retrieved successfully');
    });
  });
});