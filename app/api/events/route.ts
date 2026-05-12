import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Ambil ID dan Judul saja untuk kebutuhan dropdown di form tambah kategori tiket
    const result = await query('SELECT event_id AS id, event_title AS title FROM EVENT ORDER BY event_title ASC');
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil daftar event' }, { status: 500 });
  }
}