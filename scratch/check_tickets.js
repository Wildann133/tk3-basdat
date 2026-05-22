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
    const res = await pool.query(`
      SELECT event_id, event_title, organizer_id FROM EVENT 
      WHERE organizer_id = '53f31704-784c-4bc6-bd71-ca85065171c3'
    `);
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
