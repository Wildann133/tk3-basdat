import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireDashboardRoles } from "@/lib/dashboard";

type EventRow = {
  event_id: string;
  event_title: string;
  event_datetime: string;
  venue_id: string;
  organizer_id: string;
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
  };
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

      const result = await query(
        `SELECT event_id, event_title, event_datetime, venue_id, organizer_id
         FROM EVENT
         WHERE organizer_id = $1
         ORDER BY event_datetime ASC`,
        [organizerFilter]
      );
      rows = result.rows;
    } else if (mine && hasSession && sessionResult.session.role === "organizer") {
      const myOrganizerId = await getOrganizerIdForUser(sessionResult.session.user_id);
      const result = await query(
        `SELECT event_id, event_title, event_datetime, venue_id, organizer_id
         FROM EVENT
         WHERE organizer_id = $1
         ORDER BY event_datetime ASC`,
        [myOrganizerId]
      );
      rows = result.rows;
    } else {
      const result = await query(
        `SELECT event_id, event_title, event_datetime, venue_id, organizer_id
         FROM EVENT
         ORDER BY event_datetime ASC`
      );
      rows = result.rows;
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

    if (!title || !eventDatetime || !venueId) {
      return Response.json({ error: "Judul, tanggal acara, dan venue wajib diisi" }, { status: 400 });
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
    const result = await query(
      `INSERT INTO EVENT (event_id, event_datetime, event_title, venue_id, organizer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING event_id, event_title, event_datetime, venue_id, organizer_id`,
      [eventId, eventDatetime, title, venueId, organizerId]
    );

    return Response.json(toEventPayload(result.rows[0]), { status: 201 });
  } catch (error: any) {
    console.error("Error POST Event:", error);

    if (error.code === "23503") {
      return Response.json({ error: "Venue atau organizer tidak ditemukan" }, { status: 409 });
    }

    return Response.json({ error: "Gagal menambahkan event" }, { status: 500 });
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

    if (!id || !title || !eventDatetime || !venueId) {
      return Response.json({ error: "ID, judul, tanggal acara, dan venue wajib diisi" }, { status: 400 });
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

    const result = await query(
      `UPDATE EVENT
       SET event_datetime = $1, event_title = $2, venue_id = $3, organizer_id = $4
       WHERE event_id = $5
       RETURNING event_id, event_title, event_datetime, venue_id, organizer_id`,
      [eventDatetime, title, venueId, organizerId, id]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: "Event tidak ditemukan" }, { status: 404 });
    }

    return Response.json(toEventPayload(result.rows[0]), { status: 200 });
  } catch (error: any) {
    console.error("Error PUT Event:", error);

    if (error.code === "23503") {
      return Response.json({ error: "Venue atau organizer tidak ditemukan" }, { status: 409 });
    }

    return Response.json({ error: "Gagal mengupdate event" }, { status: 500 });
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
  } catch (error: any) {
    console.error("Error DELETE Event:", error);

    if (error.code === "23503") {
      return Response.json(
        { error: "Gagal menghapus event karena masih dipakai data lain seperti tiket atau kategori tiket" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Gagal menghapus event" }, { status: 500 });
  }
}
