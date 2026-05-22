export const initialArtists = [
  { id: "1", name: "Taylor Swift", genre: "Pop" },
  { id: "2", name: "Arctic Monkeys", genre: "Rock" },
  { id: "3", name: "NIKI", genre: "R&B" },
];
export const ROLES = [
  { role_id: "r1", role_name: "Customer" },
  { role_id: "r2", role_name: "Organizer" },
  { role_id: "r3", role_name: "Administrator" }
];

export const USERS = [
  { user_id: "u1", username: "budisantoso", password: "password123" },
  { user_id: "u2", username: "alyazahra", password: "password123" },
  { user_id: "u3", username: "dianpelangi", password: "password123" },
  { user_id: "u4", username: "andiwijaya", password: "password123" },
  { user_id: "u5", username: "budievents", password: "password123" },
  { user_id: "u6", username: "citraprod", password: "password123" },
  { user_id: "u7", username: "diptaent", password: "password123" },
  { user_id: "u8", username: "ekopratama", password: "password123" },
  { user_id: "u9", username: "firaanindita", password: "password123" },
  { user_id: "u10", username: "gilangmahardika", password: "password123" },
  { user_id: "u11", username: "admin_utama", password: "password123" },
  { user_id: "u12", username: "admin_kedua", password: "password123" }
];

export const ACCOUNT_ROLES = [
  { user_id: "u1", role_id: "r1" },
  { user_id: "u2", role_id: "r1" },
  { user_id: "u3", role_id: "r1" },
  { user_id: "u8", role_id: "r1" },
  { user_id: "u9", role_id: "r1" },
  { user_id: "u10", role_id: "r1" },
  { user_id: "u4", role_id: "r2" },
  { user_id: "u5", role_id: "r2" },
  { user_id: "u6", role_id: "r2" },
  { user_id: "u7", role_id: "r2" },
  { user_id: "u11", role_id: "r3" },
  { user_id: "u12", role_id: "r3" }
];

export const VENUES = [
  { venue_id: "v1", venue_name: "Jakarta Convention Center", capacity: 5000, address: "Jl. Gatot Subroto", city: "Jakarta Selatan", seating_type: "reserved seating" },
  { venue_id: "v2", venue_name: "Taman Impian Jaya Ancol", capacity: 20000, address: "Jl. Lodan Timur", city: "Jakarta Utara", seating_type: "free seating" },
  { venue_id: "v3", venue_name: "Bandung Hall Center", capacity: 3000, address: "Jl. Asia Afrika", city: "Bandung", seating_type: "reserved seating" },
  { venue_id: "v4", venue_name: "Stadion Gelora Bung Karno", capacity: 77000, address: "Jl. Pintu Satu Senayan", city: "Jakarta Pusat", seating_type: "reserved seating" },
  { venue_id: "v5", venue_name: "Senayan Park", capacity: 1500, address: "Jl. Gerbang Pemuda", city: "Jakarta Pusat", seating_type: "free seating" }
];

export const ORGANIZERS = [
  { organizer_id: "o1", organizer_name: "Andi Wijaya", contact_email: "andi@organizer.com", user_id: "u4" },
  { organizer_id: "o2", organizer_name: "Budi Santoso Events", contact_email: "budi.events@organizer.com", user_id: "u5" },
  { organizer_id: "o3", organizer_name: "Citra Production", contact_email: "citra@production.com", user_id: "u6" },
  { organizer_id: "o4", organizer_name: "Dipta Entertainment", contact_email: "dipta@ent.com", user_id: "u7" }
];

export const EVENTS = [
  { event_id: "e1", event_datetime: "2024-05-15T19:00:00Z", event_title: "Konser Melodi Senja", venue_id: "v1", organizer_id: "o1", status: "LIVE" },
  { event_id: "e2", event_datetime: "2024-05-22T15:00:00Z", event_title: "Festival Seni Budaya", venue_id: "v2", organizer_id: "o1", status: "LIVE" },
  { event_id: "e3", event_datetime: "2024-06-10T18:00:00Z", event_title: "Malam Akustik Bandung", venue_id: "v3", organizer_id: "o1", status: "LIVE" },
  { event_id: "e4", event_datetime: "2024-07-01T20:00:00Z", event_title: "Rock in GBK", venue_id: "v4", organizer_id: "o2", status: "UPCOMING" },
  { event_id: "e5", event_datetime: "2024-08-15T10:00:00Z", event_title: "Pameran Teknologi 2024", venue_id: "v5", organizer_id: "o3", status: "UPCOMING" },
  { event_id: "e6", event_datetime: "2024-08-20T19:00:00Z", event_title: "EDM Night", venue_id: "v1", organizer_id: "o4", status: "UPCOMING" }
];

export const CUSTOMERS = [
  { customer_id: "c1", full_name: "Budi Santoso", phone_number: "08123456789", user_id: "u1" },
  { customer_id: "c2", full_name: "Alya Zahra", phone_number: "08234567890", user_id: "u2" },
  { customer_id: "c3", full_name: "Dian Pelangi", phone_number: "08345678901", user_id: "u3" },
  { customer_id: "c4", full_name: "Eko Pratama", phone_number: "08456789012", user_id: "u8" },
  { customer_id: "c5", full_name: "Fira Anindita", phone_number: "08567890123", user_id: "u9" },
  { customer_id: "c6", full_name: "Gilang Mahardika", phone_number: "08678901234", user_id: "u10" }
];

export const PROMOTIONS = [
  { promotion_id: "p1", promo_code: "EARLYBIRD", discount_type: "PERCENTAGE", discount_value: 15, start_date: "2024-04-01", end_date: "2024-05-01", usage_limit: 100 },
  { promotion_id: "p2", promo_code: "DISKON50K", discount_type: "NOMINAL", discount_value: 50000, start_date: "2024-04-10", end_date: "2024-05-10", usage_limit: 50 },
  { promotion_id: "p3", promo_code: "MERDEKA", discount_type: "PERCENTAGE", discount_value: 17, start_date: "2024-08-01", end_date: "2024-08-31", usage_limit: 200 },
  { promotion_id: "p4", promo_code: "WEEKEND", discount_type: "NOMINAL", discount_value: 20000, start_date: "2024-05-01", end_date: "2024-12-31", usage_limit: 500 },
  { promotion_id: "p5", promo_code: "NEWUSER", discount_type: "PERCENTAGE", discount_value: 10, start_date: "2024-01-01", end_date: "2024-12-31", usage_limit: 1000 },
  { promotion_id: "p6", promo_code: "FLASH", discount_type: "NOMINAL", discount_value: 100000, start_date: "2024-06-01", end_date: "2024-06-02", usage_limit: 10 }
];

// ─── ORDERS ─────────────────────────────────────────────────────────
export const ORDERS = [
  { order_id: "ord_001", customer_id: "c1", event_id: "e1", order_date: "2024-05-10", total_amount: 500000 },
  { order_id: "ord_002", customer_id: "c1", event_id: "e2", order_date: "2024-05-12", total_amount: 150000 },
  { order_id: "ord_003", customer_id: "c2", event_id: "e1", order_date: "2024-05-13", total_amount: 1000000 },
  { order_id: "ord_004", customer_id: "c3", event_id: "e3", order_date: "2024-06-01", total_amount: 350000 },
  { order_id: "ord_005", customer_id: "c4", event_id: "e4", order_date: "2024-06-20", total_amount: 750000 },
  { order_id: "ord_006", customer_id: "c5", event_id: "e2", order_date: "2024-05-18", total_amount: 300000 },
  { order_id: "ord_007", customer_id: "c6", event_id: "e5", order_date: "2024-08-01", total_amount: 200000 },
  { order_id: "ord_008", customer_id: "c2", event_id: "e6", order_date: "2024-08-15", total_amount: 450000 },
];

// ─── TICKET CATEGORIES (per event) ─────────────────────────────────
export const TICKET_CATEGORIES = [
  { tcategory_id: "tc1", category_name: "VVIP", price: 500000, quota: 50,  used: 2,  event_id: "e1" },
  { tcategory_id: "tc2", category_name: "VIP",  price: 350000, quota: 100, used: 5,  event_id: "e1" },
  { tcategory_id: "tc3", category_name: "Regular", price: 150000, quota: 500, used: 12, event_id: "e1" },
  { tcategory_id: "tc4", category_name: "General Admission", price: 150000, quota: 500, used: 1, event_id: "e2" },
  { tcategory_id: "tc5", category_name: "VIP",  price: 300000, quota: 200, used: 3,  event_id: "e2" },
  { tcategory_id: "tc6", category_name: "VIP",  price: 350000, quota: 100, used: 0,  event_id: "e3" },
  { tcategory_id: "tc7", category_name: "Regular", price: 200000, quota: 300, used: 1, event_id: "e3" },
  { tcategory_id: "tc8", category_name: "VVIP", price: 750000, quota: 30,  used: 0,  event_id: "e4" },
  { tcategory_id: "tc9", category_name: "VIP",  price: 500000, quota: 100, used: 0,  event_id: "e4" },
  { tcategory_id: "tc10", category_name: "Regular", price: 250000, quota: 500, used: 0, event_id: "e4" },
  { tcategory_id: "tc11", category_name: "General Admission", price: 100000, quota: 1000, used: 0, event_id: "e5" },
  { tcategory_id: "tc12", category_name: "VIP", price: 450000, quota: 80, used: 0, event_id: "e6" },
  { tcategory_id: "tc13", category_name: "Regular", price: 200000, quota: 400, used: 0, event_id: "e6" },
];

// ─── SEATS (only for reserved seating venues: v1, v3, v4) ──────────
export const SEATS = [
  // v1 - Jakarta Convention Center
  { seat_id: "s1",  section: "VVIP",    row: "A", number: 1, venue_id: "v1" },
  { seat_id: "s2",  section: "VVIP",    row: "A", number: 2, venue_id: "v1" },
  { seat_id: "s3",  section: "VVIP",    row: "A", number: 3, venue_id: "v1" },
  { seat_id: "s4",  section: "VVIP",    row: "B", number: 1, venue_id: "v1" },
  { seat_id: "s5",  section: "VVIP",    row: "B", number: 2, venue_id: "v1" },
  { seat_id: "s6",  section: "VIP",     row: "A", number: 1, venue_id: "v1" },
  { seat_id: "s7",  section: "VIP",     row: "A", number: 2, venue_id: "v1" },
  { seat_id: "s8",  section: "Regular", row: "A", number: 1, venue_id: "v1" },
  // v3 - Bandung Hall Center
  { seat_id: "s9",  section: "VIP",     row: "1", number: 1, venue_id: "v3" },
  { seat_id: "s10", section: "VIP",     row: "1", number: 2, venue_id: "v3" },
  { seat_id: "s11", section: "VIP",     row: "2", number: 1, venue_id: "v3" },
  { seat_id: "s12", section: "Tribune", row: "1", number: 1, venue_id: "v3" },
  // v4 - Stadion Gelora Bung Karno
  { seat_id: "s13", section: "VVIP",    row: "1", number: 1, venue_id: "v4" },
  { seat_id: "s14", section: "VVIP",    row: "1", number: 2, venue_id: "v4" },
  { seat_id: "s15", section: "VIP",     row: "1", number: 1, venue_id: "v4" },
  { seat_id: "s16", section: "VIP",     row: "1", number: 2, venue_id: "v4" },
  { seat_id: "s17", section: "Regular", row: "1", number: 1, venue_id: "v4" },
];

// ─── HAS_RELATIONSHIP – seat ↔ ticket assignment ───────────────────
export const HAS_RELATIONSHIP: { ticket_id: string; seat_id: string }[] = [
  { ticket_id: "tkt_001", seat_id: "s1" },
  { ticket_id: "tkt_002", seat_id: "s2" },
  { ticket_id: "tkt_004", seat_id: "s6" },
];

// ─── TICKETS ────────────────────────────────────────────────────────
export const TICKETS = [
  { ticket_id: "tkt_001", ticket_code: "TKTTK-A1X9Q", order_id: "ord_001", tcategory_id: "tc1", status: "Lunas",      created_at: "2024-05-10T10:00:00Z" },
  { ticket_id: "tkt_002", ticket_code: "TKTTK-B2Y8R", order_id: "ord_001", tcategory_id: "tc1", status: "Digunakan",  created_at: "2024-05-10T10:01:00Z" },
  { ticket_id: "tkt_003", ticket_code: "TKTTK-C3Z7S", order_id: "ord_002", tcategory_id: "tc4", status: "Lunas",      created_at: "2024-05-12T14:30:00Z" },
  { ticket_id: "tkt_004", ticket_code: "TKTTK-D4W6T", order_id: "ord_003", tcategory_id: "tc2", status: "Dibatalkan", created_at: "2024-05-13T09:15:00Z" },
  { ticket_id: "tkt_005", ticket_code: "TKTTK-E5V5U", order_id: "ord_004", tcategory_id: "tc7", status: "Lunas",      created_at: "2024-06-01T11:00:00Z" },
];
export const EVENT_TICKET_CATEGORIES: Record<
  string,
  { id: string; name: string; price: number; capacity: number }[]
> = {
  e1: [
    { id: "e1-wvip", name: "WVIP", price: 900000, capacity: 60 },
    { id: "e1-vip", name: "VIP", price: 500000, capacity: 200 },
    { id: "e1-cat1", name: "Category 1", price: 250000, capacity: 1200 },
  ],
  e2: [
    { id: "e2-vip", name: "VIP", price: 420000, capacity: 250 },
    { id: "e2-cat1", name: "Category 1", price: 180000, capacity: 1500 },
  ],
  e3: [
    { id: "e3-vip", name: "VIP", price: 450000, capacity: 180 },
    { id: "e3-cat1", name: "Category 1", price: 210000, capacity: 900 },
  ],
  e4: [
    { id: "e4-wvip", name: "WVIP", price: 1200000, capacity: 80 },
    { id: "e4-vip", name: "VIP", price: 700000, capacity: 350 },
    { id: "e4-cat1", name: "Category 1", price: 320000, capacity: 3500 },
  ],
  e5: [
    { id: "e5-vip", name: "VIP", price: 300000, capacity: 150 },
    { id: "e5-cat1", name: "Category 1", price: 140000, capacity: 700 },
  ],
  e6: [
    { id: "e6-vip", name: "VIP", price: 650000, capacity: 300 },
    { id: "e6-cat1", name: "Category 1", price: 300000, capacity: 2000 },
  ],
};

export function getTicketCategoriesByEventId(eventId: string) {
  return EVENT_TICKET_CATEGORIES[eventId] ?? [];
}

export function getCustomerByUserId(userId: string) {
  return CUSTOMERS.find((customer) => customer.user_id === userId) ?? null;
}

export function getOrganizerByUserId(userId: string) {
  return ORGANIZERS.find((organizer) => organizer.user_id === userId) ?? null;
}

export function getEventById(eventId: string) {
  return EVENTS.find((event) => event.event_id === eventId) ?? null;
}

export function findPromotionByCode(promoCode: string) {
  const normalized = promoCode.trim().toLowerCase();
  if (!normalized) return null;
  return (
    PROMOTIONS.find(
      (promotion) => promotion.promo_code.toLowerCase() === normalized
    ) ?? null
  );
}

export function calculateDiscountedTotal(params: {
  subtotal: number;
  promoCode?: string;
}) {
  const subtotal = Math.max(0, params.subtotal);
  const promo = params.promoCode ? findPromotionByCode(params.promoCode) : null;

  if (!promo) {
    return {
      promo: null,
      discountAmount: 0,
      totalAmount: subtotal,
    };
  }

  const discountAmount =
    promo.discount_type === "PERCENTAGE"
      ? Math.floor((subtotal * promo.discount_value) / 100)
      : promo.discount_value;
  const clampedDiscount = Math.min(subtotal, Math.max(0, discountAmount));

  return {
    promo,
    discountAmount: clampedDiscount,
    totalAmount: subtotal - clampedDiscount,
  };
}

// Provide helper objects mimicking backend aggregation for the dashboards
export const ADMIN_STATS = {
  totalUsers: 2543,
  totalEvents: 156,
  omzetPlatform: "Rp 52.4M",
  activePromotions: PROMOTIONS.filter(p => new Date(p.end_date) >= new Date()).length,
  venues: VENUES.length,
};

export const ORGANIZER_STATS = {
  activeEvents: EVENTS.filter(e => e.organizer_id === "o1").length,
  ticketsSold: 1243,
  revenue: "Rp 4.8M",
  venuesMitra: Array.from(new Set(EVENTS.filter(e => e.organizer_id === "o1").map(e => e.venue_id))).length
};

export const CUSTOMER_STATS = {
  activeTickets: 2,
  eventsAttended: 12,
  availablePromos: 3,
  totalSpent: "Rp 1.6M"
};
