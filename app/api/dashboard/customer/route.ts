import { query } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

export async function GET() {
  const sessionResult = await requireDashboardSession("customer");

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const customerResult = await query(
      "SELECT customer_id, full_name FROM CUSTOMER WHERE user_id = $1",
      [sessionResult.session.user_id]
    );

    if (customerResult.rowCount === 0) {
      return Response.json({ error: "Customer tidak ditemukan" }, { status: 404 });
    }

    const customerId = customerResult.rows[0].customer_id as string;
    const customerName = customerResult.rows[0].full_name as string;

    const [
      activeTicketsResult,
      eventsAttendedResult,
      promoResult,
      totalSpentResult,
      upcomingResult,
    ] = await Promise.all([
      query(
        `SELECT COUNT(t.ticket_id)::int AS count
         FROM TICKET t
         JOIN "ORDER" o ON o.order_id = t.torder_id
         JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id
         JOIN EVENT e ON e.event_id = tc.tevent_id
         WHERE o.customer_id = $1
           AND o.payment_status = 'Paid'
           AND e.event_datetime >= NOW()`,
        [customerId]
      ),
      query(
        `SELECT COUNT(DISTINCT e.event_id)::int AS count
         FROM TICKET t
         JOIN "ORDER" o ON o.order_id = t.torder_id
         JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id
         JOIN EVENT e ON e.event_id = tc.tevent_id
         WHERE o.customer_id = $1
           AND o.payment_status = 'Paid'
           AND e.event_datetime < NOW()`,
        [customerId]
      ),
      query("SELECT COUNT(*)::int AS count FROM PROMOTION WHERE CURRENT_DATE BETWEEN start_date AND end_date"),
      query(
        "SELECT COALESCE(SUM(total_amount), 0) AS total FROM \"ORDER\" WHERE customer_id = $1 AND payment_status = 'Paid'",
        [customerId]
      ),
      query(
        `SELECT DISTINCT ON (e.event_id)
           e.event_id,
           e.event_title,
           e.event_datetime,
           e.venue_id,
           tc.category_name
         FROM TICKET t
         JOIN "ORDER" o ON o.order_id = t.torder_id
         JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id
         JOIN EVENT e ON e.event_id = tc.tevent_id
         WHERE o.customer_id = $1
           AND o.payment_status = 'Paid'
           AND e.event_datetime >= NOW()
         ORDER BY e.event_id, e.event_datetime ASC
         LIMIT 2`,
        [customerId]
      ),
    ]);

    const activeTickets = Number(activeTicketsResult.rows[0]?.count ?? 0);
    const eventsAttended = Number(eventsAttendedResult.rows[0]?.count ?? 0);
    const availablePromos = Number(promoResult.rows[0]?.count ?? 0);
    const totalSpent = Number(totalSpentResult.rows[0]?.total ?? 0);

    return Response.json(
      {
        customerName,
        activeTickets,
        eventsAttended,
        availablePromos,
        totalSpent,
        upcomingEvents: upcomingResult.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error GET Customer Dashboard:", error);
    return Response.json({ error: "Gagal memuat dashboard customer" }, { status: 500 });
  }
}
