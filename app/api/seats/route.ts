import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomUUID } from 'crypto';

// MEMATIKAN CACHE: Agar data selalu fresh tanpa perlu di-refresh manual
export const dynamic = 'force-dynamic';

// 1. GET: Ambil semua kursi beserta info venue dan status assign
export async function GET() {
  try {
    const result = await query(`
      SELECT
        s.seat_id,
        s.section,
        s.row_number AS row,
        s.seat_number AS number,
        s.venue_id,
        v.venue_name,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM HAS_RELATIONSHIP hr WHERE hr.seat_id = s.seat_id
          ) THEN true
          ELSE false
        END AS is_assigned
      FROM SEAT s
      JOIN VENUE v ON v.venue_id = s.venue_id
      ORDER BY v.venue_name ASC, s.section ASC, s.row_number ASC, s.seat_number ASC
    `);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error('Error GET Seat:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat daftar kursi' }, { status: 500 });
  }
}

// 2. POST: Tambah kursi baru
export async function POST(request: Request) {
  try {
    const { section, row, number, venue_id } = await request.json();

    if (!section || !row || number == null || !venue_id) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const newSeatId = randomUUID();

    const result = await query(
      `INSERT INTO SEAT (seat_id, section, row_number, seat_number, venue_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING seat_id, section, row_number AS row, seat_number AS number, venue_id`,
      [newSeatId, section.trim(), row.trim(), number, venue_id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error POST Seat:', error);
    return NextResponse.json({ error: error.message || 'Gagal menambahkan kursi' }, { status: 500 });
  }
}

// 3. PUT: Update data kursi
export async function PUT(request: Request) {
  try {
    const { seat_id, section, row, number, venue_id } = await request.json();

    if (!seat_id || !section || !row || number == null || !venue_id) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const result = await query(
      `UPDATE SEAT
       SET section = $1, row_number = $2, seat_number = $3, venue_id = $4
       WHERE seat_id = $5
       RETURNING seat_id, section, row_number AS row, seat_number AS number, venue_id`,
      [section.trim(), row.trim(), number, venue_id, seat_id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Kursi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error('Error PUT Seat:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengupdate kursi' }, { status: 500 });
  }
}

// 4. DELETE: Hapus kursi (trigger DB akan cek apakah sudah di-assign)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID kursi wajib disertakan' }, { status: 400 });
    }

    const result = await query('DELETE FROM SEAT WHERE seat_id = $1 RETURNING seat_id', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Kursi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Kursi berhasil dihapus' }, { status: 200 });
  } catch (error: any) {
    console.error('Error DELETE Seat:', error);

    // Tangkap error dari trigger PostgreSQL (P0001 = RAISE EXCEPTION)
    if (error.code === 'P0001') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    // Tangkap error constraint DB dan teruskan pesan aslinya jika tersedia
    if (error.code === '23503') {
      return NextResponse.json(
        { error: error.message || 'Gagal menghapus kursi karena masih terkait dengan data lain.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error.message || 'Gagal menghapus kursi' }, { status: 500 });
  }
}
