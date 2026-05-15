import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Endpoint khusus untuk mengambil data order dengan info lengkap
// Digunakan oleh TicketForm untuk dropdown order
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let result;
    let fallbackResult;

    if (userId) {
      // Filter by organizer's user_id
      result = await query(`
        SELECT
          o.order_id,
          c.full_name AS customer_name,
          e.event_title,
          e.event_id,
          e.venue_id
        FROM "ORDER" o
        JOIN CUSTOMER c ON c.customer_id = o.customer_id
        JOIN (
          SELECT DISTINCT tc.tevent_id AS event_id, t.torder_id AS order_id
          FROM TICKET t
          JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id
        ) te ON te.order_id = o.order_id
        JOIN EVENT e ON e.event_id = te.event_id
        JOIN ORGANIZER org ON org.organizer_id = e.organizer_id
        WHERE org.user_id = $1
        ORDER BY o.order_date DESC
      `, [userId]);

      fallbackResult = await query(`
        SELECT
          o.order_id,
          c.full_name AS customer_name,
          NULL AS event_title,
          NULL AS event_id,
          NULL AS venue_id
        FROM "ORDER" o
        JOIN CUSTOMER c ON c.customer_id = o.customer_id
        WHERE o.order_id NOT IN (
          SELECT DISTINCT torder_id FROM TICKET
        )
        -- Note: Fallback orders are hard to filter by event if they have no tickets yet
        -- but usually orders are created for specific events.
        ORDER BY o.order_date DESC
      `);
    } else {
      // Original logic for admin
      result = await query(`
        SELECT
          o.order_id,
          c.full_name AS customer_name,
          e.event_title,
          e.event_id,
          e.venue_id
        FROM "ORDER" o
        JOIN CUSTOMER c ON c.customer_id = o.customer_id
        JOIN (
          SELECT DISTINCT tc.tevent_id AS event_id, t.torder_id AS order_id
          FROM TICKET t
          JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id
        ) te ON te.order_id = o.order_id
        JOIN EVENT e ON e.event_id = te.event_id
        ORDER BY o.order_date DESC
      `);

      fallbackResult = await query(`
        SELECT
          o.order_id,
          c.full_name AS customer_name,
          NULL AS event_title,
          NULL AS event_id,
          NULL AS venue_id
        FROM "ORDER" o
        JOIN CUSTOMER c ON c.customer_id = o.customer_id
        WHERE o.order_id NOT IN (
          SELECT DISTINCT torder_id FROM TICKET
        )
        ORDER BY o.order_date DESC
      `);
    }

    const allOrders = [...result.rows, ...fallbackResult.rows];
    return NextResponse.json(allOrders, { status: 200 });
  } catch (error: any) {
    console.error('Error GET ticket-orders:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memuat daftar order' },
      { status: 500 }
    );
  }
}
