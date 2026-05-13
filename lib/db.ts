import { Pool } from 'pg';

console.log('DB URL:', process.env.DATABASE_URL ? '✅ Terbaca' : '❌ TIDAK ADA');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 5,
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export async function getClient() {
  return pool.connect();
}