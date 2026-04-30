"use client";

import { useState } from "react";
import TicketForm from "./TicketForm";
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

/* ── local types ── */
export type TicketRow = {
  ticket_id: string;
  ticket_code: string;
  order_id: string;
  tcategory_id: string;
  seat_id?: string;
  created_at: string;
};

/* ── helpers ── */
const getCustomerName = (orderId: string) => {
  const order = ORDERS.find((o) => o.order_id === orderId);
  if (!order) return "—";
  const cust = CUSTOMERS.find((c) => c.customer_id === order.customer_id);
  return cust?.full_name ?? "—";
};

const getEventTitle = (orderId: string) => {
  const order = ORDERS.find((o) => o.order_id === orderId);
  if (!order) return "—";
  const ev = EVENTS.find((e) => e.event_id === order.event_id);
  return ev?.event_title ?? "—";
};

const getCategoryLabel = (tcId: string) => {
  const tc = TICKET_CATEGORIES.find((t) => t.tcategory_id === tcId);
  if (!tc) return "—";
  return `${tc.category_name} — Rp ${tc.price.toLocaleString("id-ID")}`;
};

const getSeatLabel = (ticketId: string) => {
  const rel = HAS_RELATIONSHIP.find((r) => r.ticket_id === ticketId);
  if (!rel) return null;
  const seat = SEATS.find((s) => s.seat_id === rel.seat_id);
  if (!seat) return null;
  return `Section ${seat.section}, Baris ${seat.row}, No. ${seat.number}`;
};

/* ── build initial rows with seat ── */
const buildInitialRows = (): TicketRow[] =>
  TICKETS.map((t) => {
    const rel = HAS_RELATIONSHIP.find((r) => r.ticket_id === t.ticket_id);
    return { ...t, seat_id: rel?.seat_id };
  });

/* ──────────────────────────────────────────────────────────── */
export default function TicketTable({ role }: { role?: string }) {
  const canManage = role === "admin" || role === "organizer";

  const [tickets, setTickets] = useState<TicketRow[]>(buildInitialRows);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ── handlers ── */
  const handleDelete = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.ticket_id !== id));
  };

  const handleSave = (row: TicketRow) => {
    setTickets((prev) => {
      const exists = prev.find((t) => t.ticket_id === row.ticket_id);
      if (exists) return prev.map((t) => (t.ticket_id === row.ticket_id ? row : t));
      return [row, ...prev];
    });
  };

  /* ── filter ── */
  const filtered = tickets
    .filter((t) => {
      const q = search.toLowerCase();
      return (
        t.ticket_code.toLowerCase().includes(q) ||
        t.order_id.toLowerCase().includes(q) ||
        getCustomerName(t.order_id).toLowerCase().includes(q) ||
        getEventTitle(t.order_id).toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const ticketToDelete = tickets.find((t) => t.ticket_id === deleteId);

  return (
    <div>
      {/* TOOLBAR */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-black"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19A8 8 0 1 1 11 3a8 8 0 0 1 0 16z" />
          </svg>

          <input
            placeholder="Cari tiket / order / customer..."
            className="w-full pl-9 pr-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="font-head text-[0.65rem] tracking-[0.08em] uppercase bg-[#ffdb33] border-2 border-black shadow-[2px_2px_0_0_#000] px-3 py-1.5">
            {filtered.length} tiket
          </span>

          {canManage && <TicketForm onSave={handleSave} existingTickets={tickets} />}
        </div>
      </div>

      {/* TABLE */}
      <div className="border-2 border-black overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-black">
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Kode Tiket
              </th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Order
              </th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Customer
              </th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Event
              </th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Kategori
              </th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Kursi
              </th>
              {canManage && (
                <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33] w-32">
                  Aksi
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {filtered.map((tkt) => (
              <tr
                key={tkt.ticket_id}
                className="border-b-2 border-black bg-white hover:bg-[#ffdb33] transition-colors duration-100 group"
              >
                {/* Kode Tiket */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-black bg-[#ffdb33] group-hover:bg-white flex items-center justify-center font-head text-sm text-black shadow-[2px_2px_0_0_#000]">
                      🎫
                    </div>
                    <span className="font-semibold text-black font-mono text-xs">{tkt.ticket_code}</span>
                  </div>
                </td>

                {/* Order */}
                <td className="px-5 py-3.5">
                  <span className="font-head text-[0.6rem] uppercase bg-[#fae583] border-2 border-black px-2.5 py-1">
                    {tkt.order_id}
                  </span>
                </td>

                {/* Customer */}
                <td className="px-5 py-3.5 font-semibold text-black">
                  {getCustomerName(tkt.order_id)}
                </td>

                {/* Event */}
                <td className="px-5 py-3.5">
                  <span className="font-head text-[0.6rem] uppercase bg-[#ffdb33] border-2 border-black px-2.5 py-1">
                    {getEventTitle(tkt.order_id)}
                  </span>
                </td>

                {/* Kategori */}
                <td className="px-5 py-3.5 text-black text-xs">
                  {getCategoryLabel(tkt.tcategory_id)}
                </td>

                {/* Kursi */}
                <td className="px-5 py-3.5 text-xs text-black">
                  {getSeatLabel(tkt.ticket_id) ?? (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>

                {/* Aksi */}
                {canManage && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setDeleteId(tkt.ticket_id)}
                        className="font-head text-[0.72rem] px-3 py-1.5 border-2 border-[#e63946] bg-white text-[#e63946] shadow-[2px_2px_0_0_#e63946] hover:bg-[#e63946] hover:text-white transition-all duration-100 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-14 text-center">
                  Tidak ada tiket ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DELETE */}
      {deleteId && canManage && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div
            className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm"
            style={{ animation: "modalIn .18s ease" }}
          >
            <div className="h-[5px] bg-[#e63946] border-b-2 border-black" />
            <div className="p-6">
              <h2 className="font-head text-xl text-black mb-2">Hapus Tiket</h2>
              <p className="text-sm mb-1">
                Apakah Anda yakin ingin menghapus tiket berikut?
              </p>
              <p className="font-mono text-xs font-bold bg-[#f9f6ef] border-2 border-black px-3 py-2 mb-4">
                {ticketToDelete?.ticket_code}
              </p>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    handleDelete(deleteId);
                    setDeleteId(null);
                  }}
                  className="flex-1 py-2.5 border-2 border-black bg-[#e63946] text-white font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-[#c62f3b] hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: translate(-6px, 6px); }
              to   { opacity: 1; transform: translate(0, 0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
