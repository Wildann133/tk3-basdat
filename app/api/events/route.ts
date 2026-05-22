import { randomUUID } from "crypto";
import { getClient, query } from "@/lib/db";
import { requireDashboardRoles } from "@/lib/dashboard";

function getPgErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function isPgError(error: unknown): error is { code?: string; message?: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

type EventRow = {
  event_id: string;
  event_title: string;
  event_datetime: string;
  venue_id: string;
  organizer_id: string;
  artists: string[] | null;
  ticket_categories:
    | Array<{
        id: string;
        name: string;
        price: number;
        capacity: number;
      }>
    | null;
};

async function getOrganizerIdForUser(userId: string) {
  const result = await query("SELECT organizer_id FROM ORGANIZER WHERE user_id = $1", [userId]);
  return result.rows[0]?.organizer_id ?? null;
}

function toEventPayload(row: EventRow) {
  return {
    id: row.event_id,
    event_id: row.event_id,
    title: row.event_title,
    event_title: row.event_title,
    event_datetime: row.event_datetime,
    venue_id: row.venue_id,
    organizer_id: row.organizer_id,
    artists: row.artists ?? [],
    ticket_categories: row.ticket_categories ?? [],
  };
}

async function getEventRows(whereClause = "", params: string[] = []) {
  const result = await query(
    `SELECT
      e.event_id,
      e.event_title,
      e.event_datetime,
      e.venue_id,
      e.organizer_id,
      COALESCE(artists.artists, ARRAY[]::text[]) AS artists,
      COALESCE(categories.ticket_categories, '[]'::json) AS ticket_categories
     FROM EVENT e
     LEFT JOIN LATERAL (
       SELECT ARRAY_AGG(a.name ORDER BY a.name) AS artists
       FROM EVENT_ARTIST ea
       JOIN ARTIST a ON a.artist_id = ea.artist_id
       WHERE ea.event_id = e.event_id
     ) artists ON TRUE
     LEFT JOIN LATERAL (
       SELECT JSON_AGG(
         JSON_BUILD_OBJECT(
           'id', tc.category_id,
           'name', tc.category_name,
           'price', tc.price,
           'capacity', tc.quota
         )
         ORDER BY tc.price ASC, tc.category_name ASC
       ) AS ticket_categories
       FROM TICKET_CATEGORY tc
       WHERE tc.tevent_id = e.event_id
     ) categories ON TRUE
     ${whereClause}
     ORDER BY e.event_datetime ASC`,
    params
  );

  return result.rows as EventRow[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizerFilter = searchParams.get("organizer_id");
    const mine = searchParams.get("mine") === "1";

    const sessionResult = await requireDashboardRoles(["admin", "organizer", "customer"]);
    const hasSession = sessionResult.ok;

    let rows: EventRow[] = [];

    if (organizerFilter) {
      if (hasSession && sessionResult.session.role === "organizer") {
        const myOrganizerId = await getOrganizerIdForUser(sessionResult.session.user_id);
        if (myOrganizerId !== organizerFilter) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      rows = await getEventRows("WHERE e.organizer_id = $1", [organizerFilter]);
    } else if (mine && hasSession && sessionResult.session.role === "organizer") {
      const myOrganizerId = await getOrganizerIdForUser(sessionResult.session.user_id);
      rows = await getEventRows("WHERE e.organizer_id = $1", [myOrganizerId]);
    } else {
      rows = await getEventRows();
    }

    return Response.json(rows.map(toEventPayload), { status: 200 });
  } catch (error) {
    console.error("Error GET Event:", error);
    return Response.json({ error: "Gagal memuat daftar event" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessionResult = await requireDashboardRoles(["admin", "organizer"]);

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await request.json();
    const title = (body.event_title ?? body.title ?? "").trim();
    const eventDatetime = (body.event_datetime ?? "").trim();
    const venueId = (body.venue_id ?? "").trim();
    const organizerIdFromBody = (body.organizer_id ?? "").trim();
    const artists = Array.isArray(body.artists)
      ? body.artists.map((artist: unknown) => String(artist).trim()).filter(Boolean)
      : [];
    const ticketCategories: { name: string; price: number; capacity: number }[] = Array.isArray(body.ticket_categories)
      ? body.ticket_categories
          .map((category: unknown) => {
            const parsedCategory = typeof category === "object" && category !== null ? category : {};
            const record = parsedCategory as Record<string, unknown>;
            return {
              name: String(record.name ?? "").trim(),
              price: Number(record.price),
              capacity: Number(record.capacity),
            };
          })
          .filter(
            (category: { name: string; price: number; capacity: number }) =>
              category.name && Number.isFinite(category.price) && Number.isFinite(category.capacity)
          )
      : [];

    if (!title || !eventDatetime || !venueId) {
      return Response.json({ error: "Judul, tanggal acara, dan venue wajib diisi" }, { status: 400 });
    }
    if (ticketCategories.some((category) => category.capacity <= 0)) {
      return Response.json({ error: "Kapasitas kategori tiket harus lebih dari 0" }, { status: 400 });
    }
    if (ticketCategories.some((category) => category.price < 0)) {
      return Response.json({ error: "Harga kategori tiket tidak boleh negatif" }, { status: 400 });
    }

    let organizerId = organizerIdFromBody;
    if (sessionResult.session.role === "organizer") {
      organizerId = await getOrganizerIdForUser(sessionResult.session.user_id);
      if (!organizerId) {
        return Response.json({ error: "Organizer tidak ditemukan" }, { status: 404 });
      }
    }

    if (!organizerId) {
      return Response.json({ error: "Organizer wajib diisi" }, { status: 400 });
    }

    const eventId = randomUUID();
    const client = await getClient();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO EVENT (event_id, event_datetime, event_title, venue_id, organizer_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING event_id, event_title, event_datetime, venue_id, organizer_id`,
        [eventId, eventDatetime, title, venueId, organizerId]
      );

      for (const artistName of artists) {
        const artistResult = await client.query("SELECT artist_id FROM ARTIST WHERE name = $1 LIMIT 1", [artistName]);
        const artistId = artistResult.rows[0]?.artist_id ?? randomUUID();

        if (!artistResult.rows[0]?.artist_id) {
          await client.query(
            "INSERT INTO ARTIST (artist_id, name, genre) VALUES ($1, $2, $3)",
            [artistId, artistName, null]
          );
        }

        await client.query(
          `INSERT INTO EVENT_ARTIST (event_id, artist_id, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (event_id, artist_id) DO NOTHING`,
          [eventId, artistId, null]
        );
      }

      for (const category of ticketCategories) {
        await client.query(
          `INSERT INTO TICKET_CATEGORY (category_id, category_name, quota, price, tevent_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [randomUUID(), category.name, category.capacity, category.price, eventId]
        );
      }

      await client.query("COMMIT");
      const rows = await getEventRows("WHERE e.event_id = $1", [eventId]);
      return Response.json(toEventPayload(rows[0] ?? result.rows[0]), { status: 201 });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error("Error POST Event:", error);

    if (isPgError(error) && error.code === "23503") {
      return Response.json({ error: getPgErrorMessage(error, "Venue atau organizer tidak ditemukan") }, { status: 409 });
    }

    return Response.json({ error: getPgErrorMessage(error, "Gagal menambahkan event") }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const sessionResult = await requireDashboardRoles(["admin", "organizer"]);

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await request.json();
    const id = (body.id ?? body.event_id ?? "").trim();
    const title = (body.event_title ?? body.title ?? "").trim();
    const eventDatetime = (body.event_datetime ?? "").trim();
    const venueId = (body.venue_id ?? "").trim();
    const organizerIdFromBody = (body.organizer_id ?? "").trim();
    const artists = Array.isArray(body.artists)
      ? body.artists.map((artist: unknown) => String(artist).trim()).filter(Boolean)
      : [];
    const ticketCategories: { name: string; price: number; capacity: number }[] = Array.isArray(body.ticket_categories)
      ? body.ticket_categories
          .map((category: unknown) => {
            const parsedCategory = typeof category === "object" && category !== null ? category : {};
            const record = parsedCategory as Record<string, unknown>;
            return {
              name: String(record.name ?? "").trim(),
              price: Number(record.price),
              capacity: Number(record.capacity),
            };
          })
          .filter(
            (category: { name: string; price: number; capacity: number }) =>
              category.name && Number.isFinite(category.price) && Number.isFinite(category.capacity)
          )
      : [];

    if (!id || !title || !eventDatetime || !venueId) {
      return Response.json({ error: "ID, judul, tanggal acara, dan venue wajib diisi" }, { status: 400 });
    }
    if (ticketCategories.some((category) => category.capacity <= 0)) {
      return Response.json({ error: "Kapasitas kategori tiket harus lebih dari 0" }, { status: 400 });
    }
    if (ticketCategories.some((category) => category.price < 0)) {
      return Response.json({ error: "Harga kategori tiket tidak boleh negatif" }, { status: 400 });
    }

    let organizerId = organizerIdFromBody;
    if (sessionResult.session.role === "organizer") {
      const myOrganizerId = await getOrganizerIdForUser(sessionResult.session.user_id);
      const ownershipCheck = await query(
        "SELECT 1 FROM EVENT WHERE event_id = $1 AND organizer_id = $2",
        [id, myOrganizerId]
      );
      if (ownershipCheck.rowCount === 0) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      organizerId = myOrganizerId;
    }

    if (!organizerId) {
      const currentEvent = await query("SELECT organizer_id FROM EVENT WHERE event_id = $1", [id]);
      organizerId = currentEvent.rows[0]?.organizer_id ?? "";
    }

    if (!organizerId) {
      return Response.json({ error: "Organizer wajib diisi" }, { status: 400 });
    }

    const client = await getClient();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE EVENT
         SET event_datetime = $1, event_title = $2, venue_id = $3, organizer_id = $4
         WHERE event_id = $5
         RETURNING event_id, event_title, event_datetime, venue_id, organizer_id`,
        [eventDatetime, title, venueId, organizerId, id]
      );

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return Response.json({ error: "Event tidak ditemukan" }, { status: 404 });
      }

      await client.query("DELETE FROM EVENT_ARTIST WHERE event_id = $1", [id]);
      for (const artistName of artists) {
        const artistResult = await client.query("SELECT artist_id FROM ARTIST WHERE name = $1 LIMIT 1", [artistName]);
        const artistId = artistResult.rows[0]?.artist_id ?? randomUUID();

        if (!artistResult.rows[0]?.artist_id) {
          await client.query(
            "INSERT INTO ARTIST (artist_id, name, genre) VALUES ($1, $2, $3)",
            [artistId, artistName, null]
          );
        }

        await client.query(
          `INSERT INTO EVENT_ARTIST (event_id, artist_id, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (event_id, artist_id) DO NOTHING`,
          [id, artistId, null]
        );
      }

      await client.query("DELETE FROM TICKET_CATEGORY WHERE tevent_id = $1", [id]);
      for (const category of ticketCategories) {
        await client.query(
          `INSERT INTO TICKET_CATEGORY (category_id, category_name, quota, price, tevent_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [randomUUID(), category.name, category.capacity, category.price, id]
        );
      }

      await client.query("COMMIT");
      const rows = await getEventRows("WHERE e.event_id = $1", [id]);
      return Response.json(toEventPayload(rows[0] ?? result.rows[0]), { status: 200 });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error("Error PUT Event:", error);

    if (isPgError(error) && error.code === "23503") {
      return Response.json({ error: getPgErrorMessage(error, "Venue atau organizer tidak ditemukan") }, { status: 409 });
    }

    return Response.json({ error: getPgErrorMessage(error, "Gagal mengupdate event") }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const sessionResult = await requireDashboardRoles(["admin", "organizer"]);

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID event wajib disertakan" }, { status: 400 });
    }

    if (sessionResult.session.role === "organizer") {
      const myOrganizerId = await getOrganizerIdForUser(sessionResult.session.user_id);
      const ownershipCheck = await query(
        "SELECT 1 FROM EVENT WHERE event_id = $1 AND organizer_id = $2",
        [id, myOrganizerId]
      );
      if (ownershipCheck.rowCount === 0) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const result = await query("DELETE FROM EVENT WHERE event_id = $1 RETURNING event_id", [id]);

    if (result.rowCount === 0) {
      return Response.json({ error: "Event tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ message: "Event berhasil dihapus" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error DELETE Event:", error);

    if (isPgError(error) && error.code === "23503") {
      return Response.json(
        {
          error: getPgErrorMessage(
            error,
            "Gagal menghapus event karena masih dipakai data lain seperti tiket atau kategori tiket"
          ),
        },
        { status: 409 }
      );
    }

    return Response.json({ error: getPgErrorMessage(error, "Gagal menghapus event") }, { status: 500 });
  }
}
