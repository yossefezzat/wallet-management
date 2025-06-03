import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

@Injectable()
export class TransactionManager {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Execute a function within a transaction with a specified isolation level
   * @param callback Function to execute within the transaction
   * @param isolationLevel Transaction isolation level
   * @returns Result of the callback function
   */
  async executeTransaction<T>(
    callback: (entityManager: EntityManager) => Promise<T>,
    isolationLevel = 'REPEATABLE READ',
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(
      isolationLevel as IsolationLevel,
    );

    try {
      const result = await callback(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}