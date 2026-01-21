#!/usr/bin/env node
/**
 * Run the CardHedger pricing migration
 *
 * Usage:
 *   SUPABASE_DB_PASSWORD=xxx node scripts/run-cardhedger-migration.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_HOST = 'db.ghdqbnjsfhjgyqlktfud.supabase.co';
const DB_NAME = 'postgres';
const DB_USER = 'postgres';
const DB_PORT = 5432;

async function runMigration() {
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!password) {
    console.error('ERROR: SUPABASE_DB_PASSWORD environment variable required');
    process.exit(1);
  }

  const client = new Client({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: password,
    port: DB_PORT,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/005_cardhedger_pricing.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: 005_cardhedger_pricing.sql');
    console.log('='.repeat(50));

    // Execute the entire migration as one statement
    await client.query(sql);

    console.log('✓ Migration executed successfully!');
    console.log('='.repeat(50));

    // Verify tables exist
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('card_prices', 'price_history')
    `);

    console.log('\nVerification:');
    rows.forEach(r => console.log(`  ✓ Table exists: ${r.table_name}`));

    // Show column count
    const { rows: cols } = await client.query(`
      SELECT COUNT(*) as col_count
      FROM information_schema.columns
      WHERE table_name = 'card_prices'
    `);
    console.log(`  ✓ card_prices has ${cols[0].col_count} columns`);

  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
