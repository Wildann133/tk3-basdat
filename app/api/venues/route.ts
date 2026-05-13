import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireDashboardRoles } from "@/lib/dashboard";

const allowedManageRoles = ["admin", "organizer"] as const;

export async function GET() {
  try {
    const result = await query(`
      SELECT
        venue_id AS id,
        venue_id,
        venue_name AS name,
        venue_name,
        capacity,
        address,
        city,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM SEAT s
            WHERE s.venue_id = VENUE.venue_id
          ) THEN 'reserved seating'
          ELSE 'free seating'
        END AS seating_type
      FROM VENUE
      ORDER BY venue_name ASC
    `);

    return Response.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error GET Venue:", error);
    return Response.json({ error: "Gagal memuat daftar venue" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessionResult = await requireDashboardRoles([...allowedManageRoles]);

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await request.json();
    const venueName = (body.venue_name ?? body.name ?? "").trim();
    const address = (body.address ?? "").trim();
    const city = (body.city ?? "").trim();
    const capacity = Number(body.capacity);

    if (!venueName || !address || !city || !Number.isFinite(capacity) || capacity <= 0) {
      return Response.json({ error: "Nama venue, alamat, kota, dan kapasitas wajib diisi" }, { status: 400 });
    }

    const venueId = randomUUID();
    const result = await query(
      `INSERT INTO VENUE (venue_id, venue_name, capacity, address, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING venue_id AS id, venue_id, venue_name AS name, venue_name, capacity, address, city`,
      [venueId, venueName, capacity, address, city]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error POST Venue:", error);
    return Response.json({ error: "Gagal menambahkan venue" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const sessionResult = await requireDashboardRoles([...allowedManageRoles]);

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await request.json();
    const id = (body.id ?? body.venue_id ?? "").trim();
    const venueName = (body.venue_name ?? body.name ?? "").trim();
    const address = (body.address ?? "").trim();
    const city = (body.city ?? "").trim();
    const capacity = Number(body.capacity);

    if (!id || !venueName || !address || !city || !Number.isFinite(capacity) || capacity <= 0) {
      return Response.json({ error: "ID, nama venue, alamat, kota, dan kapasitas wajib diisi" }, { status: 400 });
    }

    const result = await query(
      `UPDATE VENUE
       SET venue_name = $1, capacity = $2, address = $3, city = $4
       WHERE venue_id = $5
       RETURNING venue_id AS id, venue_id, venue_name AS name, venue_name, capacity, address, city`,
      [venueName, capacity, address, city, id]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: "Venue tidak ditemukan" }, { status: 404 });
    }

    return Response.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error("Error PUT Venue:", error);

    if (error.code === "23503") {
      return Response.json(
        { error: "Gagal mengupdate venue karena masih dipakai oleh data lain" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Gagal mengupdate venue" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const sessionResult = await requireDashboardRoles([...allowedManageRoles]);

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID venue wajib disertakan" }, { status: 400 });
    }

    const result = await query("DELETE FROM VENUE WHERE venue_id = $1 RETURNING venue_id", [id]);

    if (result.rowCount === 0) {
      return Response.json({ error: "Venue tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ message: "Venue berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    console.error("Error DELETE Venue:", error);

    if (error.code === "23503") {
      return Response.json(
        { error: "Gagal menghapus venue karena masih dipakai event atau data terkait" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Gagal menghapus venue" }, { status: 500 });
  }
}
