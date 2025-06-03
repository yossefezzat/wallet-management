import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { ErrorService } from '../../common/services/errors/error.service';

type MockRepository<T extends object = any> = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
};

const createMockRepository = (): MockRepository => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('AccountsService', () => {
  let service: AccountsService;
  let repository: MockRepository<Account>;
  let errorService: jest.Mocked<ErrorService>;
 
  beforeEach(async () => {
    const mockErrorService = {
      accountNotFound: jest.fn(),
      insufficientFunds: jest.fn(),
      badRequest: jest.fn(),
      notFound: jest.fn(),
      forbidden: jest.fn(),
      internal: jest.fn(),
      databaseError: jest.fn(),
      transactionNotFound: jest.fn(),
      invalidTransactionAmount: jest.fn(),
    };

    mockErrorService.accountNotFound.mockImplementation((id: string) => {
      throw new NotFoundException(`Account with ID ${id} not found`);
    });

    mockErrorService.insufficientFunds.mockImplementation(() => {
      throw new BadRequestException('Insufficient funds for withdrawal');
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: createMockRepository(),
        },
        {
          provide: ErrorService,
          useValue: mockErrorService,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    repository = module.get<MockRepository<Account>>(
      getRepositoryToken(Account),
    );
    errorService = module.get(ErrorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    let createAccountDto;
    let account: Account;

    beforeEach(() => {
      createAccountDto = {
        name: 'Test Account',
        description: 'Test Description',
      };

      account = {
        id: 'test-id',
        ...createAccountDto,
        balance: 0,
        isActive: true,
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      };

      repository.create.mockReturnValue(account);
      repository.save.mockResolvedValue(account);
    });

    it('should create a new account with zero balance', async () => {
      const result = await service.create(createAccountDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createAccountDto,
        balance: 0,
        isActive: true,
      });
      expect(repository.save).toHaveBeenCalledWith(account);
      expect(result).toEqual(account);
    });
  });

  describe('findOne', () => {
    let accountId: string;
    let account: Account;

    beforeEach(() => {
      accountId = 'test-id';
      account = {
        id: accountId,
        name: 'Test Account',
        balance: 100,
        isActive: true,
        description: 'Test Description',
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      };
    });

    it('should return an account if it exists', async () => {
      repository.findOne.mockResolvedValue(account);

      const result = await service.findOne(accountId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: accountId, isActive: true },
      });
      expect(result).toEqual(account);
    });

    it('should throw NotFoundError when account does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(accountId)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: accountId, isActive: true },
      });
      expect(errorService.accountNotFound).toHaveBeenCalledWith(accountId);
    });
  });

  describe('findAll', () => {
    it('should return all active accounts', async () => {
      const accounts: Account[] = [
        {
          id: 'test-id-1',
          name: 'Test Account 1',
          balance: 100,
          isActive: true,
          description: 'Test Description 1',
          transactions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
        },
        {
          id: 'test-id-2',
          name: 'Test Account 2',
          balance: 200,
          isActive: true,
          description: 'Test Description 2',
          transactions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
        },
      ];

      repository.find.mockResolvedValue(accounts);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(accounts);
    });

    it('should return an empty array when no accounts exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('getBalance', () => {
    it('should return the account balance', async () => {
      const accountId = 'test-id';
      const account: Account = {
        id: accountId,
        name: 'Test Account',
        balance: 100,
        isActive: true,
        description: 'Test Description',
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      };

      repository.findOne.mockResolvedValue(account);

      const result = await service.getBalance(accountId);

      expect(result).toEqual({
        accountId: account.id,
        balance: account.balance,
      });
    });

    it('should throw NotFoundError when account does not exist', async () => {
      const accountId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      await expect(service.getBalance(accountId)).rejects.toThrow(NotFoundException);
      expect(errorService.accountNotFound).toHaveBeenCalledWith(accountId);
    });
  });

  describe('updateBalance', () => {
    let accountId: string;
    let account: Account;

    beforeEach(() => {
      accountId = 'test-id';
      account = {
        id: accountId,
        name: 'Test Account',
        balance: 100,
        isActive: true,
        description: 'Test Description',
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      };
    });

    it('should update the account balance with positive amount', async () => {
      const amount = 50;
      const updatedAccount = {
        ...account,
        balance: account.balance + amount,
      };

      repository.findOne.mockResolvedValue(account);
      repository.save.mockResolvedValue(updatedAccount);

      const result = await service.updateBalance(accountId, amount);

      expect(repository.save).toHaveBeenCalledWith({
        ...account,
        balance: account.balance,
      });
      expect(result).toEqual(updatedAccount);
    });

    it('should throw InsufficientFundsError when resulting balance would be negative', async () => {
      const amount = -150;
      repository.findOne.mockResolvedValue(account);

      await expect(service.updateBalance(accountId, amount)).rejects.toThrow(BadRequestException);
      expect(errorService.insufficientFunds).toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});