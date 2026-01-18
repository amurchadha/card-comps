const { Client } = require('pg');

// You need to set SUPABASE_DB_PASSWORD env var or replace this
const client = new Client({
  host: 'db.ghdqbnjsfhjgyqlktfud.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

const migrations = [
  // Part 7 - View
  `CREATE OR REPLACE VIEW inventory_roi_analysis AS
  SELECT
    i.id,
    i.user_id,
    i.player_name,
    i.card_number,
    i.card_status,
    i.grading_company_used,
    i.actual_grade,
    i.total_cost_basis,
    i.sale_price,
    i.net_proceeds,
    i.net_profit,
    CASE
      WHEN i.total_cost_basis > 0 AND i.net_profit IS NOT NULL
      THEN ROUND((i.net_profit / i.total_cost_basis) * 100, 2)
      ELSE NULL
    END as roi_percent,
    i.grading_submitted_date,
    i.grading_received_date,
    CASE
      WHEN i.grading_submitted_date IS NOT NULL AND i.grading_received_date IS NOT NULL
      THEN i.grading_received_date - i.grading_submitted_date
      ELSE NULL
    END as grading_turnaround_days,
    i.created_at
  FROM inventory i;`,

  // Part 8 - Grading presets table
  `CREATE TABLE IF NOT EXISTS grading_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    service_level TEXT NOT NULL,
    base_fee DECIMAL(10,2) NOT NULL,
    max_value_threshold DECIMAL(10,2),
    percent_of_value DECIMAL(5,2),
    estimated_turnaround_days INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company, service_level)
  );`,

  // Part 8 - Insert presets
  `INSERT INTO grading_presets (company, service_level, base_fee, max_value_threshold, estimated_turnaround_days, notes)
  VALUES
    ('PSA', 'Value', 25, 499, 65, 'Cards valued $1-$499'),
    ('PSA', 'Regular', 50, 999, 30, 'Cards valued $1-$999'),
    ('PSA', 'Express', 100, 2499, 15, 'Cards valued $1-$2499'),
    ('PSA', 'Super Express', 200, 4999, 5, 'Cards valued $1-$4999'),
    ('PSA', 'Walk-Through', 600, NULL, 1, 'Same day'),
    ('BGS', 'Standard', 30, 999, 50, 'Standard service'),
    ('BGS', 'Express', 80, 2499, 10, '10 business days'),
    ('BGS', 'Premium', 250, NULL, 2, '2 business days'),
    ('SGC', 'Regular', 20, 499, 30, 'Most affordable'),
    ('SGC', 'Express', 50, 999, 10, 'Faster turnaround'),
    ('CGC', 'Standard', 25, 999, 45, 'Standard service'),
    ('CGC', 'Express', 60, 2499, 10, '10 business days')
  ON CONFLICT (company, service_level) DO NOTHING;`
];

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');

    for (let i = 0; i < migrations.length; i++) {
      console.log('Running migration ' + (i + 1) + '/' + migrations.length + '...');
      await client.query(migrations[i]);
      console.log('Migration ' + (i + 1) + ' complete');
    }

    console.log('All migrations complete!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
