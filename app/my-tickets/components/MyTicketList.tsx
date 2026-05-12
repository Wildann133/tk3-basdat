"use client";

import { useState, useMemo } from "react";
import {
  TICKETS,
  ORDERS,
  CUSTOMERS,
  EVENTS,
  TICKET_CATEGORIES,
  VENUES,
  SEATS,
  HAS_RELATIONSHIP,
} from "@/lib/dummyData";

/* ─────────── types ─────────── */
type TicketData = (typeof TICKETS)[number];

/* ─────────── helpers ─────────── */
const getOrder = (orderId: string) => ORDERS.find((o) => o.order_id === orderId);
const getCustomer = (customerId: string) => CUSTOMERS.find((c) => c.customer_id === customerId);
const getEvent = (eventId: string) => EVENTS.find((e) => e.event_id === eventId);
const getCategory = (tcId: string) => TICKET_CATEGORIES.find((t) => t.tcategory_id === tcId);
const getVenue = (venueId: string) => VENUES.find((v) => v.venue_id === venueId);

const getSeatLabel = (ticketId: string) => {
  const rel = HAS_RELATIONSHIP.find((r) => r.ticket_id === ticketId);
  if (!rel) return null;
  const seat = SEATS.find((s) => s.seat_id === rel.seat_id);
  if (!seat) return null;
  return `Section ${seat.section}, Baris ${seat.row}, No. ${seat.number}`;
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Lunas:      { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-800" },
  Digunakan:  { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-800" },
  Dibatalkan: { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-700" },
};

/* ─────────── component ─────────── */
interface MyTicketListProps {
  role: string;
  userId: string;
}

export default function MyTicketList({ role, userId }: MyTicketListProps) {
  const isCustomer = role === "customer";
  const isAdmin = role === "admin";

  /* ── filter state ── */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ── determine which tickets this user can see ── */
  const visibleTickets = useMemo(() => {
    if (isAdmin) {
      // Admin sees ALL tickets
      return TICKETS;
    }

    if (isCustomer) {
      // Customer: TICKET → ORDER → CUSTOMER → user_id
      const customer = CUSTOMERS.find((c) => c.user_id === userId);
      if (!customer) return [];
      const customerOrderIds = ORDERS
        .filter((o) => o.customer_id === customer.customer_id)
        .map((o) => o.order_id);
      return TICKETS.filter((t) => customerOrderIds.includes(t.order_id));
    }

    // Organizer: show all tickets (in frontend; backend would filter per event)
    return TICKETS;
  }, [isAdmin, isCustomer, userId]);

  /* ── apply search + status filter ── */
  const filteredTickets = useMemo(() => {
    let result = visibleTickets;

    // status filter
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // search (code OR event title)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const order = getOrder(t.order_id);
        const ev = order ? getEvent(order.event_id) : null;
        return (
          t.ticket_code.toLowerCase().includes(q) ||
          (ev?.event_title ?? "").toLowerCase().includes(q)
        );
      });
    }

    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [visibleTickets, search, statusFilter]);

  /* ── unique statuses for filter dropdown ── */
  const availableStatuses = useMemo(
    () => Array.from(new Set(visibleTickets.map((t) => t.status))),
    [visibleTickets]
  );

  return (
    <div className="bg-white border-4 border-black">
      {/* Section header */}
      <div className="p-6 bg-black text-white">
        <h2 className="text-xl font-head">
          {isCustomer ? "Tiket Saya" : "Daftar Seluruh Tiket"}
        </h2>
      </div>

      <div className="p-6 bg-[#f9f6ef]">
        {/* ── TOOLBAR ── */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-black"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19A8 8 0 1 1 11 3a8 8 0 0 1 0 16z" />
            </svg>
            <input
              placeholder="Cari kode tiket / event..."
              className="w-full pl-9 pr-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Status filter */}
            <select
              className="px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-sm text-black font-sans outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000] cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Count badge */}
            <span className="font-head text-[0.65rem] tracking-[0.08em] uppercase bg-[#ffdb33] border-2 border-black shadow-[2px_2px_0_0_#000] px-3 py-1.5">
              {filteredTickets.length} tiket
            </span>
          </div>
        </div>

        {/* ── TICKET CARDS ── */}
        {filteredTickets.length === 0 ? (
          <div className="border-2 border-black bg-white py-14 text-center text-gray-500">
            Tidak ada tiket ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTickets.map((tkt) => (
              <TicketCard
                key={tkt.ticket_id}
                ticket={tkt}
                showCustomer={!isCustomer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────── Card sub-component ─────────── */
function TicketCard({
  ticket,
  showCustomer,
}: {
  ticket: TicketData;
  showCustomer: boolean;
}) {
  const order = getOrder(ticket.order_id);
  const customer = order ? getCustomer(order.customer_id) : null;
  const event = order ? getEvent(order.event_id) : null;
  const category = getCategory(ticket.tcategory_id);
  const venue = event ? getVenue(event.venue_id) : null;
  const seatLabel = getSeatLabel(ticket.ticket_id);
  const statusStyle = STATUS_COLORS[ticket.status] ?? STATUS_COLORS["Lunas"];

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-0.5 transition-all duration-150 flex flex-col">
      {/* Card top accent — color coded by status */}
      <div
        className={`h-[5px] border-b-2 border-black ${
          ticket.status === "Lunas"
            ? "bg-green-500"
            : ticket.status === "Digunakan"
            ? "bg-blue-500"
            : "bg-red-500"
        }`}
      />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Row 1: Ticket code + status badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎫</span>
            <span className="font-mono text-sm font-bold text-black tracking-wide">
              {ticket.ticket_code}
            </span>
          </div>
          <span
            className={`font-head text-[0.6rem] tracking-[0.1em] uppercase px-2.5 py-1 border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {ticket.status}
          </span>
        </div>

        {/* Row 2: Event */}
        <div>
          <p className="font-head text-[0.55rem] tracking-[0.1em] uppercase text-gray-500 mb-0.5">
            Event
          </p>
          <span className="font-head text-[0.65rem] uppercase bg-[#ffdb33] border-2 border-black px-2.5 py-1 inline-block">
            {event?.event_title ?? "—"}
          </span>
        </div>

        {/* Row 3: Category + Price */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-head text-[0.55rem] tracking-[0.1em] uppercase text-gray-500 mb-0.5">
              Kategori
            </p>
            <p className="text-sm font-semibold text-black">
              {category?.category_name ?? "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-head text-[0.55rem] tracking-[0.1em] uppercase text-gray-500 mb-0.5">
              Harga
            </p>
            <p className="text-sm font-bold text-black">
              Rp {category?.price.toLocaleString("id-ID") ?? "—"}
            </p>
          </div>
        </div>

        {/* Row 4: Venue + Seat */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-head text-[0.55rem] tracking-[0.1em] uppercase text-gray-500 mb-0.5">
              Venue
            </p>
            <p className="text-xs text-black">{venue?.venue_name ?? "—"}</p>
          </div>
          {seatLabel && (
            <div className="text-right">
              <p className="font-head text-[0.55rem] tracking-[0.1em] uppercase text-gray-500 mb-0.5">
                Kursi
              </p>
              <p className="text-xs text-black">{seatLabel}</p>
            </div>
          )}
        </div>

        {/* Row 5: Customer (admin/organizer only) */}
        {showCustomer && customer && (
          <div className="border-t-2 border-dashed border-gray-300 pt-3 mt-auto">
            <p className="font-head text-[0.55rem] tracking-[0.1em] uppercase text-gray-500 mb-0.5">
              Pelanggan
            </p>
            <p className="text-sm font-semibold text-black">{customer.full_name}</p>
          </div>
        )}

        {/* Row 6: Order + Date */}
        <div className="border-t-2 border-black pt-3 mt-auto flex items-center justify-between">
          <span className="font-head text-[0.6rem] uppercase bg-[#fae583] border-2 border-black px-2.5 py-1">
            {ticket.order_id}
          </span>
          <span className="text-[0.65rem] text-gray-500">
            {new Date(ticket.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
