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
  { venue_id: "v1", venue_name: "Jakarta Convention Center", capacity: 5000, address: "Jl. Gatot Subroto", city: "Jakarta Selatan" },
  { venue_id: "v2", venue_name: "Taman Impian Jaya Ancol", capacity: 20000, address: "Jl. Lodan Timur", city: "Jakarta Utara" },
  { venue_id: "v3", venue_name: "Bandung Hall Center", capacity: 3000, address: "Jl. Asia Afrika", city: "Bandung" },
  { venue_id: "v4", venue_name: "Stadion Gelora Bung Karno", capacity: 77000, address: "Jl. Pintu Satu Senayan", city: "Jakarta Pusat" },
  { venue_id: "v5", venue_name: "Senayan Park", capacity: 1500, address: "Jl. Gerbang Pemuda", city: "Jakarta Pusat" }
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
