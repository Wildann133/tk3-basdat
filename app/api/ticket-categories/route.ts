import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

function getPgErrorCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code?: string }).code;
  }
  return undefined;
}

// 1. GET: Ambil semua kategori tiket
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let result;
    if (userId) {
      result = await query(`
        SELECT 
          tc.category_id AS id, 
          tc.category_name AS name, 
          tc.quota, 
          tc.price, 
          e.event_title AS event_name,
          tc.tevent_id AS event_id,
          (SELECT COUNT(*)::int FROM TICKET t WHERE t.tcategory_id = tc.category_id) AS ticket_count,
          COALESCE(remaining.sisa_kuota, tc.quota)::int AS remaining_quota
        FROM TICKET_CATEGORY tc
        JOIN EVENT e ON tc.tevent_id = e.event_id
        JOIN ORGANIZER org ON org.organizer_id = e.organizer_id
        LEFT JOIN LATERAL (
          SELECT rq.sisa_kuota
          FROM fn_get_remaining_quota(e.event_id) rq
          WHERE rq.nama_kategori = tc.category_name
          LIMIT 1
        ) remaining ON TRUE
        WHERE org.user_id = $1
        ORDER BY e.event_title ASC
      `, [userId]);
    } else {
      result = await query(`
        SELECT 
          tc.category_id AS id, 
          tc.category_name AS name, 
          tc.quota, 
          tc.price, 
          e.event_title AS event_name,
          tc.tevent_id AS event_id,
          (SELECT COUNT(*)::int FROM TICKET t WHERE t.tcategory_id = tc.category_id) AS ticket_count,
          COALESCE(remaining.sisa_kuota, tc.quota)::int AS remaining_quota
        FROM TICKET_CATEGORY tc
        JOIN EVENT e ON tc.tevent_id = e.event_id
        LEFT JOIN LATERAL (
          SELECT rq.sisa_kuota
          FROM fn_get_remaining_quota(e.event_id) rq
          WHERE rq.nama_kategori = tc.category_name
          LIMIT 1
        ) remaining ON TRUE
        ORDER BY e.event_title ASC
      `);
    }
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: unknown) {
    console.error("Error GET Ticket Category:", error);
    return NextResponse.json({ error: getErrorMessage(error, 'Gagal memuat kategori tiket') }, { status: 500 });
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

    // --- Pengecekan Kapasitas Venue ---
    const checkQuery = await query(`
      SELECT 
        v.capacity,
        (SELECT COALESCE(SUM(quota), 0) FROM TICKET_CATEGORY WHERE tevent_id = $1) AS used_quota
      FROM EVENT e
      JOIN VENUE v ON e.venue_id = v.venue_id
      WHERE e.event_id = $1
    `, [event_id]);

    if (checkQuery.rows.length > 0) {
      const { capacity, used_quota } = checkQuery.rows[0];
      const sisaKapasitas = capacity - used_quota;

      // Jika kuota yang mau diinput melebihi sisa kapasitas
      if (Number(quota) > sisaKapasitas) {
        return NextResponse.json(
          { error: `Kuota melebihi kapasitas Venue! Sisa yang bisa ditambahkan hanya ${sisaKapasitas} tiket.` }, 
          { status: 400 }
        );
      }
    }
    // ---------------------------------

    const newCategoryId = randomUUID();

    const result = await query(
      `INSERT INTO TICKET_CATEGORY (category_id, category_name, quota, price, tevent_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING category_id AS id, category_name AS name, quota, price, tevent_id AS event_id`,
      [newCategoryId, name, quota, price, event_id]
    );
    
    // Mengembalikan row agar frontend menerima object satuan, bukan array
    return NextResponse.json(result.rows, { status: 201 });
  } catch (error: unknown) {
    console.error("Error POST Ticket Category:", error);
    return NextResponse.json({ error: getErrorMessage(error, 'Gagal menambah kategori tiket') }, { status: 500 });
  }
}

// 3. PUT: Update kategori tiket
export async function PUT(request: Request) {
  try {
    const { id, name, quota, price, event_id } = await request.json();

    if (!id || !name || quota == null || price == null || !event_id) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    // --- Pengecekan Kapasitas Venue saat Update ---
    const checkQuery = await query(`
      SELECT 
        v.capacity,
        (SELECT COALESCE(SUM(quota), 0) FROM TICKET_CATEGORY WHERE tevent_id = $1 AND category_id != $2) AS used_quota
      FROM EVENT e
      JOIN VENUE v ON e.venue_id = v.venue_id
      WHERE e.event_id = $1
    `, [event_id, id]);

    if (checkQuery.rows.length > 0) {
      const { capacity, used_quota } = checkQuery.rows[0];
      const sisaKapasitas = capacity - used_quota;

      // Jika kuota baru melebihi sisa kapasitas
      if (Number(quota) > sisaKapasitas) {
        return NextResponse.json(
          { error: `Update ditolak! Total kuota melebihi kapasitas Venue. Sisa maksimal: ${sisaKapasitas} tiket.` }, 
          { status: 400 }
        );
      }
    }
    // ----------------------------------------------

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
  } catch (error: unknown) {
    console.error("Error PUT Ticket Category:", error);
    return NextResponse.json({ error: getErrorMessage(error, 'Gagal mengupdate kategori tiket') }, { status: 500 });
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
  } catch (error: unknown) {
    console.error("Error DELETE Ticket Category:", error);
    // Cek error code khusus dari constraint foreign key database
    if (getPgErrorCode(error) === '23503') {
      return NextResponse.json({ error: 'Gagal hapus! Kategori ini sudah memiliki transaksi tiket.' }, { status: 409 });
    }
    return NextResponse.json({ error: getErrorMessage(error, 'Gagal menghapus kategori') }, { status: 500 });
  }
}
