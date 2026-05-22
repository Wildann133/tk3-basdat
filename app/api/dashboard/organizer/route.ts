import { query } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

export async function GET() {
  const sessionResult = await requireDashboardSession("organizer");

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const organizerResult = await query(
      "SELECT organizer_id, organizer_name FROM ORGANIZER WHERE user_id = $1",
      [sessionResult.session.user_id]
    );

    if (organizerResult.rowCount === 0) {
      return Response.json({ error: "Organizer tidak ditemukan" }, { status: 404 });
    }

    const organizerId = organizerResult.rows[0].organizer_id as string;
    const organizerName = organizerResult.rows[0].organizer_name as string;

    const [
      activeEventsResult,
      ticketsSoldResult,
      revenueResult,
      venuesResult,
      eventsResult,
    ] = await Promise.all([
      query(
        "SELECT COUNT(*)::int AS count FROM EVENT WHERE organizer_id = $1 AND event_datetime >= NOW()",
        [organizerId]
      ),
      query(
        `SELECT COUNT(t.ticket_id)::int AS count
         FROM TICKET t
         JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id
         JOIN EVENT e ON e.event_id = tc.tevent_id
         WHERE e.organizer_id = $1`,
        [organizerId]
      ),
      query(
        `SELECT COALESCE(SUM(o.total_amount), 0) AS total
         FROM "ORDER" o
         WHERE o.payment_status = 'Paid'
           AND EXISTS (
             SELECT 1
             FROM TICKET t
             JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id
             JOIN EVENT e ON e.event_id = tc.tevent_id
             WHERE t.torder_id = o.order_id
               AND e.organizer_id = $1
           )`,
        [organizerId]
      ),
      query(
        "SELECT COUNT(DISTINCT venue_id)::int AS count FROM EVENT WHERE organizer_id = $1",
        [organizerId]
      ),
      query(
        `SELECT e.event_id,
                e.event_title,
                e.event_datetime,
                e.venue_id,
                COALESCE(SUM(tc.quota), 0) AS total_quota,
                COALESCE(COUNT(t.ticket_id), 0) AS tickets_sold
         FROM EVENT e
         LEFT JOIN TICKET_CATEGORY tc ON tc.tevent_id = e.event_id
         LEFT JOIN TICKET t ON t.tcategory_id = tc.category_id
         WHERE e.organizer_id = $1
         GROUP BY e.event_id
         ORDER BY e.event_datetime DESC`,
        [organizerId]
      ),
    ]);

    const activeEvents = Number(activeEventsResult.rows[0]?.count ?? 0);
    const ticketsSold = Number(ticketsSoldResult.rows[0]?.count ?? 0);
    const revenue = Number(revenueResult.rows[0]?.total ?? 0);
    const venuesMitra = Number(venuesResult.rows[0]?.count ?? 0);

    const now = new Date();
    const events = eventsResult.rows
      .map((event) => {
        const eventDate = new Date(event.event_datetime as string);
        const totalQuota = Number(event.total_quota ?? 0);
        const sold = Number(event.tickets_sold ?? 0);
        const percentSold = totalQuota > 0 ? Math.round((sold / totalQuota) * 100) : 0;
        const status = eventDate >= now ? "UPCOMING" : "PAST";

        return {
          event_id: event.event_id,
          event_title: event.event_title,
          event_datetime: event.event_datetime,
          venue_id: event.venue_id,
          percent_sold: percentSold,
          status,
        };
      })
      .filter((event) => event.status === "UPCOMING")
      .slice(0, 5);

    return Response.json(
      {
        organizerName,
        activeEvents,
        ticketsSold,
        revenue,
        venuesMitra,
        events,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error GET Organizer Dashboard:", error);
    return Response.json({ error: "Gagal memuat dashboard organizer" }, { status: 500 });
  }
}
