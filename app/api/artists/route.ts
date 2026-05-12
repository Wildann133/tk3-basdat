import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomUUID } from 'crypto';

// 1. READ: Mengambil semua data artist
export async function GET() {
  try {
    const result = await query('SELECT artist_id AS id, name, genre FROM ARTIST ORDER BY name ASC');
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error GET Artist:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar artis' }, { status: 500 });
  }
}

// 2. CREATE: Menambahkan artist baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, genre } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama artis wajib diisi' }, { status: 400 });
    }

    // Generate UUID baru secara manual karena DUMP tidak pakai auto-generate
    const newArtistId = randomUUID();

    // RETURNING dikembalikan dengan alias 'id' agar sesuai dengan properti di frontend
    const result = await query(
      'INSERT INTO ARTIST (artist_id, name, genre) VALUES ($1, $2, $3) RETURNING artist_id AS id, name, genre',
      [newArtistId, name, genre]
    );
    
    // Pakai supaya mengembalikan object tunggal, bukan array
    return NextResponse.json(result.rows, { status: 201 });
  } catch (error) {
    console.error('Error POST Artist:', error);
    return NextResponse.json({ error: 'Gagal menambahkan artis' }, { status: 500 });
  }
}

// 3. UPDATE: Mengubah data artist yang sudah ada
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, genre } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID dan Nama artis wajib diisi' }, { status: 400 });
    }

    // Sesuaikan nama kolom dengan DUMP
    const result = await query(
      'UPDATE ARTIST SET name = $1, genre = $2 WHERE artist_id = $3 RETURNING artist_id AS id, name, genre',
      [name, genre, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Artis tidak ditemukan' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error PUT Artist:', error);
    return NextResponse.json({ error: 'Gagal mengupdate artis' }, { status: 500 });
  }
}

// 4. DELETE: Menghapus artist berdasarkan ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID artis wajib disertakan' }, { status: 400 });
    }

    // Hapus menggunakan artist_id
    const result = await query('DELETE FROM ARTIST WHERE artist_id = $1 RETURNING artist_id', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Artis tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Artis berhasil dihapus' }, { status: 200 });
  } catch (error: any) {
    console.error('Error DELETE Artist:', error);
    
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Gagal menghapus. Artis ini sudah terdaftar di suatu Event.' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json({ error: 'Gagal menghapus artis' }, { status: 500 });
  }
}