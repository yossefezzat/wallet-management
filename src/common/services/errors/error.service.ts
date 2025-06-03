import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as ErrorMessages from '../../constants/error-messages';

/**
 * Service for handling errors consistently throughout the application
 * This service provides methods for throwing standardized errors
 */
@Injectable()
export class ErrorService {
  /**
   * Throw a BadRequestException with a standardized message
   * @param message Error message
   * @param error Optional error object
   */
  badRequest(message: string, error?: any): never {
    throw new BadRequestException({
      message,
      error: error || 'Bad Request',
    });
  }

  /**
   * Throw a NotFoundException with a standardized message
   * @param message Error message
   * @param error Optional error object
   */
  notFound(message: string, error?: any): never {
    throw new NotFoundException({
      message,
      error: error || 'Not Found',
    });
  }

  /**
   * Throw a ForbiddenException with a standardized message
   * @param message Error message
   * @param error Optional error object
   */
  forbidden(message: string, error?: any): never {
    throw new ForbiddenException({
      message,
      error: error || 'Forbidden',
    });
  }

  /**
   * Throw an InternalServerErrorException with a standardized message
   * @param message Error message
   * @param error Optional error object
   */
  internal(message: string, error?: any): never {
    throw new InternalServerErrorException({
      message,
      error: error || 'Internal Server Error',
    });
  }

  /**
   * Handle account not found error
   * @param id Account ID
   */
  accountNotFound(id: string): never {
    return this.notFound(ErrorMessages.ACCOUNT_ERRORS.NOT_FOUND(id));
  }

  /**
   * Handle insufficient funds error
   */
  insufficientFunds(): never {
    return this.badRequest(ErrorMessages.ACCOUNT_ERRORS.INSUFFICIENT_FUNDS);
  }

  /**
   * Handle transaction not found error
   * @param id Transaction ID
   */
  transactionNotFound(id: string): never {
    return this.notFound(ErrorMessages.TRANSACTION_ERRORS.NOT_FOUND(id));
  }

  /**
   * Handle invalid transaction amount error
   */
  invalidTransactionAmount(): never {
    return this.badRequest(ErrorMessages.TRANSACTION_ERRORS.INVALID_AMOUNT);
  }

  /**
   * Handle database error
   * @param error Database error
   */
  databaseError(error: any): never {
    console.error('Database error:', error);
    return this.internal(ErrorMessages.DATABASE_ERRORS.QUERY_FAILED, error);
  }
}