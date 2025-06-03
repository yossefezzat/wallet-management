import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';
import { ACCOUNT_MESSAGES } from '../../common/constants/error-messages';

describe('AccountsController', () => {
  let controller: AccountsController;
  let accountsService: Partial<AccountsService>;

  beforeEach(async () => {
    accountsService = {
      create: jest.fn(),
      findOne: jest.fn(),
      getBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: accountsService,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    let createAccountDto: CreateAccountDto;
    let expectedAccount: Account;

    beforeEach(() => {
      createAccountDto = {
        name: 'Test Account',
        description: 'Test Description',
      };

      expectedAccount = {
        id: 'test-id',
        name: 'Test Account',
        description: 'Test Description',
        balance: 0,
        isActive: true,
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      };

      jest.spyOn(accountsService, 'create').mockResolvedValue(expectedAccount);
    });

    afterEach(() => {
      jest.spyOn(accountsService, 'create').mockRestore();
    });

    it('should create a new account', async () => {
      const result = await controller.create(createAccountDto);

      expect(accountsService.create).toHaveBeenCalledWith(createAccountDto);
      expect(result.data).toEqual(expectedAccount);
      expect(result.message).toBe(ACCOUNT_MESSAGES.CREATED);
    });
  });

  describe('findOne', () => {
    let accountId: string;
    let expectedAccount: Account;

    beforeEach(() => {
      accountId = 'test-id';
      expectedAccount = {
        id: accountId,
        name: 'Test Account',
        description: 'Test Description',
        balance: 100,
        isActive: true,
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      };

      jest.spyOn(accountsService, 'findOne').mockResolvedValue(expectedAccount);
    });

    afterEach(() => {
      jest.spyOn(accountsService, 'findOne').mockRestore();
    });

    it('should return an account by id', async () => {
      const result = await controller.findOne(accountId);

      expect(accountsService.findOne).toHaveBeenCalledWith(accountId);
      expect(result.data).toEqual(expectedAccount);
      expect(result.message).toBe(ACCOUNT_MESSAGES.FOUND);
    });
  });

  describe('getBalance', () => {
    let accountId: string;
    let expectedBalance: { accountId: string; balance: number };

    beforeEach(() => {
      accountId = 'test-id';
      expectedBalance = {
        accountId: accountId,
        balance: 100,
      };

      jest.spyOn(accountsService, 'getBalance').mockResolvedValue(expectedBalance);
    });

    afterEach(() => {
      jest.spyOn(accountsService, 'getBalance').mockRestore();
    });

    it('should return account balance', async () => {
      const result = await controller.getBalance(accountId);

      expect(accountsService.getBalance).toHaveBeenCalledWith(accountId);
      expect(result.data).toEqual(expectedBalance);
      expect(result.message).toBe(ACCOUNT_MESSAGES.BALANCE_RETRIEVED);
    });
  });
});
