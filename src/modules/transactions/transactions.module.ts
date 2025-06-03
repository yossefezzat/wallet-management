import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { AccountsModule } from '../accounts/accounts.module';
import { TransactionManager } from '../../common/database/transaction.manager';
import { ErrorModule } from '../../common/services/errors/error.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), AccountsModule, ErrorModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionManager],
  exports: [TransactionsService],
})
export class TransactionsModule {}
