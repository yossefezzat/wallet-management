/**
 * Database initialization script
 * 
 * This script can be used to initialize the database with sample data for testing.
 * Run with: node scripts/init-db.js
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function initDb() {
  try {
    await client.connect();
    console.log('Connected to database');

    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        balance DECIMAL(20, 2) NOT NULL DEFAULT 0,
        description VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
          CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL');
        END IF;
      END
      $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type transaction_type NOT NULL,
        amount DECIMAL(20, 2) NOT NULL,
        description VARCHAR(255),
        account_id UUID NOT NULL REFERENCES accounts(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );
    `);

    // Insert sample data
    const account1 = await client.query(`
      INSERT INTO accounts (name, balance, description)
      VALUES ('John Doe', 1000, 'Personal account')
      RETURNING id;
    `);

    const account2 = await client.query(`
      INSERT INTO accounts (name, balance, description)
      VALUES ('Jane Smith', 500, 'Savings account')
      RETURNING id;
    `);

    const account1Id = account1.rows[0].id;
    const account2Id = account2.rows[0].id;

    // Insert sample transactions
    await client.query(`
      INSERT INTO transactions (type, amount, description, account_id)
      VALUES 
        ('DEPOSIT', 1000, 'Initial deposit', $1),
        ('WITHDRAWAL', 200, 'ATM withdrawal', $1),
        ('DEPOSIT', 200, 'Salary', $1),
        ('DEPOSIT', 500, 'Initial deposit', $2);
    `, [account1Id, account2Id]);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

initDb();