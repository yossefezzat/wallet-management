import { Module } from '@nestjs/common';
import { ErrorService } from '../errors/error.service';

/**
 * Module that provides the ErrorService
 */
@Module({
  providers: [ErrorService],
  exports: [ErrorService],
})
export class ErrorModule {}