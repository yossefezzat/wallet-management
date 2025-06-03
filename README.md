# Fintech Application

A NestJS-based fintech application that manages accounts and financial transactions.

## Features

- Account management (create accounts, check balance)
- Transaction processing (deposits, withdrawals)
- PostgreSQL database with transaction support
- API documentation with Swagger
- Docker support for easy deployment

## Architecture

The application follows a modular monolith architecture that can be easily transformed into microservices in the future. It is built with the following components:

- **Accounts Module**: Handles account creation and balance management
- **Transactions Module**: Manages financial transactions with proper isolation levels
- **Common Module**: Contains shared utilities, filters, and interceptors

### Database Design

- **Accounts Table**: Stores account information and balances
- **Transactions Table**: Records all financial transactions with references to accounts

### Transaction Management

The application uses database transactions with REPEATABLE READ isolation level to ensure data consistency during financial operations.

## API Endpoints

### Accounts

- `POST /api/accounts` - Create a new account
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get account by ID
- `GET /api/accounts/:id/balance` - Get account balance

### Transactions

- `POST /api/transactions` - Create a new transaction
- `POST /api/transactions/deposit` - Deposit funds to an account
- `POST /api/transactions/withdraw` - Withdraw funds from an account
- `GET /api/transactions/account/:accountId` - Get all transactions for an account

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Docker and Docker Compose (for running PostgreSQL)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd fintech-app
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env file with your configuration if needed
```

4. Start the PostgreSQL database

```bash
docker-compose up -d
```

5. Run the application

```bash
npm run start:dev
```

6. Access the API documentation at http://localhost:3000/api/docs

### Running with Docker

To run the entire application with Docker:

```bash
docker-compose up -d
```

## Testing

Run the tests with:

```bash
npm test
```

Run end-to-end tests with:

```bash
npm run test:e2e
```

## Design Decisions

### Modular Monolith

The application is designed as a modular monolith to balance development speed with future scalability. Each module is self-contained with its own controllers, services, and entities, making it easy to extract into microservices later.

### Database Transactions

Financial operations use database transactions with REPEATABLE READ isolation level to prevent race conditions and ensure data consistency.

### Global Response Format

All API responses follow a consistent format with success status, data, and message fields, making it easier for clients to process responses.

### Error Handling

A global exception filter captures and formats all errors consistently, providing clear error messages to clients.

## Challenges

- Ensuring data consistency during concurrent financial transactions
- Designing a flexible architecture that can scale to microservices
- Implementing proper validation for financial operations

## Future Improvements

- Add authentication and authorization
- Implement event sourcing for financial transactions
- Add more comprehensive logging and monitoring
- Implement rate limiting for API endpoints
