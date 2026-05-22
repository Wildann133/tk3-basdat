const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.split('\n').find(l => l.startsWith('DATABASE_URL=')).split('=')[1].trim().replace(/^["']|["']$/g, '');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query('ALTER TABLE TICKET ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'Valid\'');
    console.log('Column status added successfully');
  } catch (err) {
    console.error('Error adding status column:', err);
  } finally {
    await pool.end();
  }
}

run();
