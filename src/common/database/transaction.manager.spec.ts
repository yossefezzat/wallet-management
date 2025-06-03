import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { TransactionManager } from './transaction.manager';

describe('TransactionManager', () => {
  let service: TransactionManager;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let entityManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    entityManager = {
      save: jest.fn(),
    } as any;

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: entityManager,
    } as any;

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionManager,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<TransactionManager>(TransactionManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeTransaction', () => {
    it('should execute callback and commit transaction successfully', async () => {
      const expectedResult = { success: true };
      const callback = jest.fn().mockResolvedValue(expectedResult);

      const result = await service.executeTransaction(callback);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalledWith('REPEATABLE READ');
      expect(callback).toHaveBeenCalledWith(entityManager);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should use provided isolation level', async () => {
      const callback = jest.fn().mockResolvedValue({});
      const isolationLevel = 'READ COMMITTED';

      await service.executeTransaction(callback, isolationLevel);

      expect(queryRunner.startTransaction).toHaveBeenCalledWith(isolationLevel);
    });

    it('should rollback and throw error when callback fails', async () => {
      const error = new Error('Transaction failed');
      const callback = jest.fn().mockRejectedValue(error);

      await expect(service.executeTransaction(callback)).rejects.toThrow(error);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should ensure release is called even when commit fails', async () => {
      const error = new Error('Commit failed');
      const callback = jest.fn().mockResolvedValue({});
      queryRunner.commitTransaction.mockRejectedValue(error);

      await expect(service.executeTransaction(callback)).rejects.toThrow(error);

      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
