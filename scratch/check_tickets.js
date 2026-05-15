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
      SELECT 
        t.ticket_code, 
        e.event_title, 
        e.organizer_id, 
        org.user_id AS organizer_user_id 
      FROM TICKET t 
      JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id 
      JOIN EVENT e ON e.event_id = tc.tevent_id 
      LEFT JOIN ORGANIZER org ON org.organizer_id = e.organizer_id 
      WHERE t.ticket_code LIKE 'TKTTK-%'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
