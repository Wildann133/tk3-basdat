import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomUUID } from 'crypto';

// MEMATIKAN CACHE: Agar data selalu fresh tanpa perlu di-refresh manual
export const dynamic = 'force-dynamic';

// 1. GET: Ambil semua kategori tiket
export async function GET() {
  try {
    // Kita JOIN ke EVENT hanya untuk ambil judulnya agar tabel di UI informatif
    const result = await query(`
      SELECT 
        tc.category_id AS id, 
        tc.category_name AS name, 
        tc.quota, 
        tc.price, 
        e.event_title AS event_name,
        tc.tevent_id AS event_id,
        (SELECT COUNT(*)::int FROM TICKET t WHERE t.tcategory_id = tc.category_id) AS ticket_count
      FROM TICKET_CATEGORY tc
      JOIN EVENT e ON tc.tevent_id = e.event_id
      ORDER BY e.event_title ASC
    `);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Error GET Ticket Category:", error);
    return NextResponse.json({ error: error.message || 'Gagal memuat kategori tiket' }, { status: 500 });
  }
}

// 2. POST: Tambah kategori tiket baru
export async function POST(request: Request) {
  try {
    const { name, quota, price, event_id } = await request.json();

    // Validasi field
    if (!name || quota == null || price == null || !event_id) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const newCategoryId = randomUUID();

    const result = await query(
      `INSERT INTO TICKET_CATEGORY (category_id, category_name, quota, price, tevent_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING category_id AS id, category_name AS name, quota, price, tevent_id AS event_id`,
      [newCategoryId, name, quota, price, event_id]
    );
    
    // Mengembalikan row agar frontend menerima object satuan, bukan array
    return NextResponse.json(result.rows, { status: 201 });
  } catch (error: any) {
    console.error("Error POST Ticket Category:", error);
    // KUNCI UTAMA: Mengembalikan pesan error asli dari PostgreSQL (Trigger)
    return NextResponse.json({ error: error.message || 'Gagal menambah kategori tiket' }, { status: 500 });
  }
}

// 3. PUT: Update kategori tiket (Fungsi yang sebelumnya hilang)
export async function PUT(request: Request) {
  try {
    const { id, name, quota, price, event_id } = await request.json();

    if (!id || !name || quota == null || price == null || !event_id) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const result = await query(
      `UPDATE TICKET_CATEGORY 
       SET category_name = $1, quota = $2, price = $3, tevent_id = $4 
       WHERE category_id = $5 
       RETURNING category_id AS id, category_name AS name, quota, price, tevent_id AS event_id`,
      [name, quota, price, event_id, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Error PUT Ticket Category:", error);
    return NextResponse.json({ error: error.message || 'Gagal mengupdate kategori tiket' }, { status: 500 });
  }
}

// 4. DELETE: Hapus kategori berdasarkan ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });

    const result = await query('DELETE FROM TICKET_CATEGORY WHERE category_id = $1 RETURNING category_id', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Kategori berhasil dihapus' }, { status: 200 });
  } catch (error: any) {
    console.error("Error DELETE Ticket Category:", error);
    // Cek error code khusus dari constraint foreign key database
    if (error.code === '23503') {
      return NextResponse.json({ error: 'Gagal hapus! Kategori ini sudah memiliki transaksi tiket.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Gagal menghapus kategori' }, { status: 500 });
  }
}