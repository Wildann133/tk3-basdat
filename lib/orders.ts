import { randomUUID } from "crypto";
import { query, getClient } from "@/lib/db";
import type {
  CheckoutEvent,
  CheckoutPromotion,
  CheckoutVenue,
  Order,
  PaymentStatus,
  PersistedOrder,
  TicketCategory,
} from "@/lib/types/order";

type DbTimestamp = string | Date;

type CustomerRow = {
  customer_id: string;
};

type OrganizerRow = {
  organizer_id: string;
};

type CheckoutEventRow = {
  event_id: string;
  event_title: string;
  event_datetime: DbTimestamp;
  venue_id: string;
  venue_name: string;
  seating_type: string;
};

type TicketCategoryRow = {
  id: string;
  name: string;
  price: string | number;
  capacity: number;
};

type PromotionRow = {
  promotion_id: string;
  promo_code: string;
  discount_type: string;
  discount_value: string | number;
  usage_limit: number;
  start_date: DbTimestamp;
  end_date: DbTimestamp;
};

type PersistedOrderRow = {
  order_id: string;
  order_date: DbTimestamp;
  payment_status: PaymentStatus;
  total_amount: string | number;
  customer_id: string;
};

export type CheckoutPageData = {
  customerId: string;
  event: CheckoutEvent;
  venue: CheckoutVenue;
  ticketCategories: TicketCategory[];
  promotions: CheckoutPromotion[];
};

export type CreateOrderPayload = {
  event_id: string;
  ticket_category_id: string;
  quantity: number;
  seats_input?: string;
  promo_code?: string;
};

export type UpdateOrderPayload = {
  id: string;
  payment_status?: PaymentStatus;
  total_amount?: number;
};

function toIsoString(value: DbTimestamp) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

function parseSeats(seatsInput: string) {
  return seatsInput
    .split(",")
    .map((seat) => seat.trim())
    .filter(Boolean);
}

function calculateDiscountAmount(subtotal: number, promotion: CheckoutPromotion | null) {
  if (!promotion) return 0;

  const discountAmount =
    promotion.discountType === "PERCENTAGE"
      ? Math.floor((subtotal * promotion.discountValue) / 100)
      : promotion.discountValue;

  return Math.min(subtotal, Math.max(0, discountAmount));
}

function mapPromotion(row: PromotionRow): CheckoutPromotion {
  return {
    promotionId: row.promotion_id,
    promoCode: row.promo_code,
    discountType: row.discount_type === "PERCENTAGE" ? "PERCENTAGE" : "NOMINAL",
    discountValue: toNumber(row.discount_value),
    usageLimit: Number(row.usage_limit),
    startDate: toIsoString(row.start_date),
    endDate: toIsoString(row.end_date),
  };
}

function mapPersistedOrder(row: PersistedOrderRow): PersistedOrder {
  return {
    order_id: row.order_id,
    order_date: toIsoString(row.order_date),
    payment_status: row.payment_status,
    total_amount: toNumber(row.total_amount),
    customer_id: row.customer_id,
  };
}

export async function getCustomerIdByUserId(userId: string) {
  const result = await query("SELECT customer_id FROM CUSTOMER WHERE user_id = $1", [userId]);
  return (result.rows[0] as CustomerRow | undefined)?.customer_id ?? null;
}

export async function getOrganizerIdByUserId(userId: string) {
  const result = await query("SELECT organizer_id FROM ORGANIZER WHERE user_id = $1", [userId]);
  return (result.rows[0] as OrganizerRow | undefined)?.organizer_id ?? null;
}

export async function getCheckoutPageData(
  userId: string,
  eventId: string
): Promise<CheckoutPageData | null> {
  const customerId = await getCustomerIdByUserId(userId);
  if (!customerId) return null;

  const eventResult = await query(
    `SELECT
       e.event_id,
       e.event_title,
       e.event_datetime,
       e.venue_id,
       v.venue_name,
       CASE
         WHEN EXISTS (
           SELECT 1
           FROM SEAT s
           WHERE s.venue_id = v.venue_id
         ) THEN 'reserved seating'
         ELSE 'free seating'
       END AS seating_type
     FROM EVENT e
     JOIN VENUE v ON v.venue_id = e.venue_id
     WHERE e.event_id = $1`,
    [eventId]
  );

  if (eventResult.rowCount === 0) return null;

  const ticketCategoryResult = await query(
    `SELECT
       category_id AS id,
       category_name AS name,
       price,
       quota AS capacity
     FROM TICKET_CATEGORY
     WHERE tevent_id = $1
     ORDER BY price ASC, category_name ASC`,
    [eventId]
  );

  if (ticketCategoryResult.rowCount === 0) return null;

  const promotionResult = await query(
    `SELECT
       promotion_id,
       promo_code,
       discount_type,
       discount_value,
       usage_limit,
       start_date,
       end_date
     FROM PROMOTION
     WHERE CURRENT_DATE BETWEEN start_date AND end_date
     ORDER BY promo_code ASC`
  );

  const eventRow = eventResult.rows[0] as CheckoutEventRow;

  return {
    customerId,
    event: {
      event_id: eventRow.event_id,
      event_title: eventRow.event_title,
      event_datetime: toIsoString(eventRow.event_datetime),
      venue_id: eventRow.venue_id,
    },
    venue: {
      venue_id: eventRow.venue_id,
      venue_name: eventRow.venue_name,
      seating_type: eventRow.seating_type,
    },
    ticketCategories: (ticketCategoryResult.rows as TicketCategoryRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      price: toNumber(row.price),
      capacity: Number(row.capacity),
    })),
    promotions: (promotionResult.rows as PromotionRow[]).map(mapPromotion),
  };
}

export async function createOrderForCustomer(
  userId: string,
  payload: CreateOrderPayload
): Promise<Order> {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const customerResult = await client.query("SELECT customer_id FROM CUSTOMER WHERE user_id = $1", [userId]);
    const customerId = (customerResult.rows[0] as CustomerRow | undefined)?.customer_id ?? null;
    if (!customerId) {
      throw new Error("Customer tidak ditemukan.");
    }

    const quantity = Number(payload.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error("Jumlah tiket harus bilangan bulat antara 1 sampai 10.");
    }

    const eventResult = await client.query(
      `SELECT
         e.event_id,
         e.event_title,
         e.event_datetime,
         e.venue_id,
         v.venue_name,
         CASE
           WHEN EXISTS (
             SELECT 1
             FROM SEAT s
             WHERE s.venue_id = v.venue_id
           ) THEN 'reserved seating'
           ELSE 'free seating'
         END AS seating_type
       FROM EVENT e
       JOIN VENUE v ON v.venue_id = e.venue_id
       WHERE e.event_id = $1`,
      [payload.event_id]
    );

    if (eventResult.rowCount === 0) {
      throw new Error("Event tidak ditemukan.");
    }

    const eventRow = eventResult.rows[0] as CheckoutEventRow;

    const ticketCategoryResult = await client.query(
      `SELECT
         category_id AS id,
         category_name AS name,
         price,
         quota AS capacity
       FROM TICKET_CATEGORY
       WHERE category_id = $1
         AND tevent_id = $2`,
      [payload.ticket_category_id, payload.event_id]
    );

    if (ticketCategoryResult.rowCount === 0) {
      throw new Error("Kategori tiket tidak valid.");
    }

    const ticketCategoryRow = ticketCategoryResult.rows[0] as TicketCategoryRow;
    const selectedSeats = parseSeats(payload.seats_input ?? "");
    if (eventRow.seating_type === "reserved seating" && selectedSeats.length > quantity) {
      throw new Error("Jumlah kursi yang dipilih tidak boleh melebihi jumlah tiket.");
    }

    const subtotalAmount = toNumber(ticketCategoryRow.price) * quantity;

    let promotion: CheckoutPromotion | null = null;
    const normalizedPromoCode = (payload.promo_code ?? "").trim();
    if (normalizedPromoCode) {
      const promotionResult = await client.query(
        `SELECT
           promotion_id,
           promo_code,
           discount_type,
           discount_value,
           usage_limit,
           start_date,
           end_date
         FROM PROMOTION
         WHERE LOWER(promo_code) = LOWER($1)
           AND CURRENT_DATE BETWEEN start_date AND end_date
         LIMIT 1`,
        [normalizedPromoCode]
      );

      if (promotionResult.rowCount === 0) {
        throw new Error("Kode promo tidak ditemukan.");
      }

      promotion = mapPromotion(promotionResult.rows[0] as PromotionRow);
    }

    const discountAmount = calculateDiscountAmount(subtotalAmount, promotion);
    const totalAmount = subtotalAmount - discountAmount;
    const orderId = randomUUID();

    const insertResult = await client.query(
      `INSERT INTO "ORDER" (order_id, order_date, payment_status, total_amount, customer_id)
       VALUES ($1, NOW(), 'Pending', $2, $3)
       RETURNING order_id, order_date, payment_status, total_amount, customer_id`,
      [orderId, totalAmount, customerId]
    );

    const orderRow = insertResult.rows[0] as PersistedOrderRow;

    // Generate Tickets
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < quantity; i++) {
      const ticketId = randomUUID();
      let ticketCode = 'TKTTK-';
      for (let j = 0; j < 5; j++) {
        ticketCode += chars[Math.floor(Math.random() * chars.length)];
      }

      await client.query(
        `INSERT INTO TICKET (ticket_id, ticket_code, torder_id, tcategory_id) VALUES ($1, $2, $3, $4)`,
        [ticketId, ticketCode, orderId, payload.ticket_category_id]
      );

      if (selectedSeats[i]) {
        await client.query(
          `INSERT INTO HAS_RELATIONSHIP (ticket_id, seat_id) VALUES ($1, $2)`,
          [ticketId, selectedSeats[i]]
        );
      }
    }

    await client.query('COMMIT');

    return {
      order_id: orderRow.order_id,
      order_date: toIsoString(orderRow.order_date),
      payment_status: orderRow.payment_status,
      total_amount: toNumber(orderRow.total_amount),
      customer_id: customerId,
      event_id: eventRow.event_id,
      ticket_category_id: ticketCategoryRow.id,
      ticket_category_name: ticketCategoryRow.name,
      ticket_price: toNumber(ticketCategoryRow.price),
      quantity,
      selected_seats: selectedSeats,
      promo_code: promotion?.promoCode ?? null,
      discount_amount: discountAmount,
      subtotal_amount: subtotalAmount,
    };
  } catch (err: any) {
    await client.query('ROLLBACK');
    // Tangkap custom exception dari PostgreSQL trigger
    if (err.code === 'P0001') {
      throw new Error(err.message);
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function getOrdersForCustomer(userId: string) {
  const customerId = await getCustomerIdByUserId(userId);
  if (!customerId) {
    throw new Error("Customer tidak ditemukan.");
  }

  const result = await query(
    `SELECT order_id, order_date, payment_status, total_amount, customer_id
     FROM "ORDER"
     WHERE customer_id = $1
     ORDER BY order_date DESC`,
    [customerId]
  );

  return (result.rows as PersistedOrderRow[]).map(mapPersistedOrder);
}

export async function getOrdersForAdmin() {
  const result = await query(
    `SELECT order_id, order_date, payment_status, total_amount, customer_id
     FROM "ORDER"
     ORDER BY order_date DESC`
  );

  return (result.rows as PersistedOrderRow[]).map(mapPersistedOrder);
}

/**
 * Orders visible to an organizer: at least one TICKET row links the order to an EVENT
 * for this organizer. Orders with no TICKET rows (e.g. minimal checkout) do not appear.
 */
export async function getOrdersForOrganizer(userId: string) {
  const organizerId = await getOrganizerIdByUserId(userId);
  if (!organizerId) {
    throw new Error("Organizer tidak ditemukan.");
  }

  const result = await query(
    `SELECT DISTINCT o.order_id, o.order_date, o.payment_status, o.total_amount, o.customer_id
     FROM "ORDER" o
     WHERE EXISTS (
       SELECT 1
       FROM TICKET t
       JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id
       JOIN EVENT e ON e.event_id = tc.tevent_id
       WHERE t.torder_id = o.order_id
         AND e.organizer_id = $1
     )
     ORDER BY o.order_date DESC`,
    [organizerId]
  );

  return (result.rows as PersistedOrderRow[]).map(mapPersistedOrder);
}

export async function updateOrderById(payload: UpdateOrderPayload) {
  const fields: string[] = [];
  const params: Array<string | number> = [];

  if (payload.payment_status !== undefined) {
    if (!["Pending", "Paid", "Cancelled"].includes(payload.payment_status)) {
      throw new Error("Status pembayaran tidak valid.");
    }

    fields.push(`payment_status = $${params.length + 1}`);
    params.push(payload.payment_status);
  }

  if (payload.total_amount !== undefined) {
    const totalAmount = Number(payload.total_amount);
    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      throw new Error("Total amount tidak valid.");
    }

    fields.push(`total_amount = $${params.length + 1}`);
    params.push(totalAmount);
  }

  if (fields.length === 0) {
    throw new Error("Tidak ada perubahan order yang dikirim.");
  }

  params.push(payload.id);

  const result = await query(
    `UPDATE "ORDER"
     SET ${fields.join(", ")}
     WHERE order_id = $${params.length}
     RETURNING order_id, order_date, payment_status, total_amount, customer_id`,
    params
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapPersistedOrder(result.rows[0] as PersistedOrderRow);
}

export async function deleteOrderById(orderId: string) {
  const result = await query(
    `DELETE FROM "ORDER"
     WHERE order_id = $1
     RETURNING order_id, order_date, payment_status, total_amount, customer_id`,
    [orderId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapPersistedOrder(result.rows[0] as PersistedOrderRow);
}
