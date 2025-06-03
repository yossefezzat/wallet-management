/**
 * Centralized error messages for the application
 * This file contains all error messages used throughout the application
 * to ensure consistency and easy maintenance.
 */

// Account related error messages
export const ACCOUNT_ERRORS = {
  NOT_FOUND: (id: string) => `Account with ID ${id} not found`,
  INSUFFICIENT_FUNDS: 'Insufficient funds for withdrawal',
  INACTIVE: (id: string) => `Account with ID ${id} is inactive`,
};

// Account related success messages
export const ACCOUNT_MESSAGES = {
  CREATED: 'Account created successfully',
  FOUND: 'Account retrieved successfully',
  FOUND_ALL: 'Accounts retrieved successfully',
  UPDATED: 'Account updated successfully',
  DELETED: 'Account deleted successfully',
  BALANCE_RETRIEVED: 'Account balance retrieved successfully',
};

// Transaction related error messages
export const TRANSACTION_ERRORS = {
  INVALID_AMOUNT: 'Transaction amount must be greater than zero',
  INVALID_TYPE: 'Invalid transaction type',
  NOT_FOUND: (id: string) => `Transaction with ID ${id} not found`,
  CREATION_FAILED: 'Failed to create transaction',
};

// Transaction related success messages
export const TRANSACTION_MESSAGES = {
  CREATED: 'Transaction created successfully',
  FOUND: 'Transaction retrieved successfully',
  FOUND_ALL: 'Transactions retrieved successfully',
  FOUND_BY_ACCOUNT: 'Transactions retrieved successfully',
  TRANSACTIONS_RETRIEVED: 'Transactions retrieved successfully',
  DEPOSIT_SUCCESSFUL: 'Deposit successful',
  WITHDRAWAL_SUCCESSFUL: 'Withdrawal successful',
  STATUS_UPDATED: 'Transaction status updated successfully',
};

// Authentication related error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  TOKEN_EXPIRED: 'Authentication token has expired',
  TOKEN_INVALID: 'Invalid authentication token',
};

// Validation related error messages
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_FORMAT: (field: string) => `${field} format is invalid`,
  MIN_LENGTH: (field: string, length: number) => 
    `${field} must be at least ${length} characters long`,
  MAX_LENGTH: (field: string, length: number) => 
    `${field} must not exceed ${length} characters`,
  MIN_VALUE: (field: string, value: number) => 
    `${field} must be greater than or equal to ${value}`,
  MAX_VALUE: (field: string, value: number) => 
    `${field} must be less than or equal to ${value}`,
};

// Generic error messages
export const GENERIC_ERRORS = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  FORBIDDEN: 'Forbidden',
  CONFLICT: 'Resource already exists',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
};

// Database related error messages
export const DATABASE_ERRORS = {
  CONNECTION_FAILED: 'Failed to connect to database',
  QUERY_FAILED: 'Database query failed',
  TRANSACTION_FAILED: 'Database transaction failed',
  CONSTRAINT_VIOLATION: 'Database constraint violation',
};

/**
 * Helper function to format error messages with parameters
 * @param template Error message template with placeholders
 * @param params Parameters to replace placeholders
 * @returns Formatted error message
 */
export const formatErrorMessage = (
  template: string,
  params: Record<string, string | number>,
): string => {
  let message = template;
  Object.entries(params).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, String(value));
  });
  return message;
};