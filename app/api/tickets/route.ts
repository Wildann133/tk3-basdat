import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { randomUUID } from 'crypto';

// MEMATIKAN CACHE: Agar data selalu fresh tanpa perlu di-refresh manual
export const dynamic = 'force-dynamic';

// Helper: Generate kode tiket unik (TKTTK-XXXXX)
function generateTicketCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TKTTK-';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 1. GET: Ambil semua tiket dengan relasi lengkap
export async function GET() {
  try {
    const result = await query(`
      SELECT
        t.ticket_id,
        t.ticket_code,
        t.torder_id AS order_id,
        t.tcategory_id,
        tc.category_name,
        tc.price AS category_price,
        e.event_title,
        e.event_id,
        o.order_id AS ord_id,
        o.payment_status,
        o.order_date,
        c.full_name AS customer_name,
        c.user_id,
        hr.seat_id,
        s.section AS seat_section,
        s.row_number AS seat_row,
        s.seat_number AS seat_number,
        v.venue_name
      FROM TICKET t
      JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id
      JOIN EVENT e ON e.event_id = tc.tevent_id
      JOIN VENUE v ON v.venue_id = e.venue_id
      JOIN "ORDER" o ON o.order_id = t.torder_id
      JOIN CUSTOMER c ON c.customer_id = o.customer_id
      LEFT JOIN HAS_RELATIONSHIP hr ON hr.ticket_id = t.ticket_id
      LEFT JOIN SEAT s ON s.seat_id = hr.seat_id
      ORDER BY o.order_date DESC
    `);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error('Error GET Ticket:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat daftar tiket' }, { status: 500 });
  }
}

// 2. POST: Buat tiket baru (trigger DB akan cek kuota kategori)
export async function POST(request: Request) {
  const client = await getClient();

  try {
    const { order_id, tcategory_id, seat_id } = await request.json();

    if (!order_id || !tcategory_id) {
      return NextResponse.json({ error: 'Order dan Kategori Tiket wajib diisi' }, { status: 400 });
    }

    await client.query('BEGIN');

    const newTicketId = randomUUID();
    const ticketCode = generateTicketCode();

    // Insert tiket baru — trigger akan cek kuota otomatis
    const ticketResult = await client.query(
      `INSERT INTO TICKET (ticket_id, ticket_code, torder_id, tcategory_id)
       VALUES ($1, $2, $3, $4)
       RETURNING ticket_id, ticket_code, torder_id AS order_id, tcategory_id`,
      [newTicketId, ticketCode, order_id, tcategory_id]
    );

    // Jika seat_id dipilih, insert ke HAS_RELATIONSHIP
    if (seat_id) {
      await client.query(
        `INSERT INTO HAS_RELATIONSHIP (ticket_id, seat_id) VALUES ($1, $2)`,
        [newTicketId, seat_id]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json(ticketResult.rows[0], { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error POST Ticket:', error);

    // Tangkap error dari trigger PostgreSQL (P0001 = RAISE EXCEPTION)
    if (error.code === 'P0001') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    // Tangkap error foreign key constraint
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Data order atau kategori tiket tidak valid.' },
        { status: 409 }
      );
    }

    // Tangkap error unique constraint (misalnya seat sudah di-assign)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Kursi sudah di-assign ke tiket lain.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error.message || 'Gagal membuat tiket' }, { status: 500 });
  } finally {
    client.release();
  }
}

// 3. DELETE: Hapus tiket beserta relasi seat-nya
export async function DELETE(request: Request) {
  const client = await getClient();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID tiket wajib disertakan' }, { status: 400 });
    }

    await client.query('BEGIN');

    // Hapus relasi seat terlebih dahulu (jika ada)
    await client.query('DELETE FROM HAS_RELATIONSHIP WHERE ticket_id = $1', [id]);

    // Hapus tiket
    const result = await client.query(
      'DELETE FROM TICKET WHERE ticket_id = $1 RETURNING ticket_id',
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 });
    }

    await client.query('COMMIT');

    return NextResponse.json({ message: 'Tiket berhasil dihapus' }, { status: 200 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error DELETE Ticket:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus tiket' }, { status: 500 });
  } finally {
    client.release();
  }
}
