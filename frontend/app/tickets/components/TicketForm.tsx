"use client";

import { useState, useMemo } from "react";
import type { TicketRow } from "./TicketTable";
import {
  ORDERS,
  CUSTOMERS,
  EVENTS,
  TICKET_CATEGORIES,
  VENUES,
  SEATS,
  HAS_RELATIONSHIP,
} from "@/lib/dummyData";

/* ── helpers ── */
const generateTicketCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "TKTTK-";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const generateTicketId = () => `tkt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;

/* ── props ── */
interface TicketFormProps {
  onSave: (row: TicketRow) => void;
  existingTickets: TicketRow[];
}

export default function TicketForm({ onSave, existingTickets }: TicketFormProps) {
  const [open, setOpen] = useState(false);

  /* form state */
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [error, setError] = useState("");

  /* ── derived: event from selected order ── */
  const selectedOrder = ORDERS.find((o) => o.order_id === selectedOrderId);
  const selectedEvent = selectedOrder
    ? EVENTS.find((e) => e.event_id === selectedOrder.event_id)
    : null;

  /* ── derived: venue from event ── */
  const selectedVenue = selectedEvent
    ? VENUES.find((v) => v.venue_id === selectedEvent.venue_id)
    : null;

  const isReservedSeating = selectedVenue?.seating_type === "reserved seating";

  /* ── ticket categories filtered by event ── */
  const availableCategories = useMemo(() => {
    if (!selectedEvent) return [];
    return TICKET_CATEGORIES.filter((tc) => tc.event_id === selectedEvent.event_id);
  }, [selectedEvent]);

  /* ── available seats: venue seats minus already-assigned seats ── */
  const availableSeats = useMemo(() => {
    if (!selectedVenue || !isReservedSeating) return [];

    // all seats for this venue
    const venueSeats = SEATS.filter((s) => s.venue_id === selectedVenue.venue_id);

    // seats already taken (from initial data + locally-created tickets)
    const takenSeatIds = new Set<string>();

    // from initial data
    HAS_RELATIONSHIP.forEach((r) => takenSeatIds.add(r.seat_id));

    // from locally-created tickets in current session
    existingTickets.forEach((t) => {
      if (t.seat_id) takenSeatIds.add(t.seat_id);
    });

    return venueSeats.filter((s) => !takenSeatIds.has(s.seat_id));
  }, [selectedVenue, isReservedSeating, existingTickets]);

  /* ── order dropdown labels ── */
  const orderOptions = useMemo(() => {
    return ORDERS.map((ord) => {
      const cust = CUSTOMERS.find((c) => c.customer_id === ord.customer_id);
      const ev = EVENTS.find((e) => e.event_id === ord.event_id);
      return {
        value: ord.order_id,
        label: `${ord.order_id} — ${cust?.full_name ?? "?"} — ${ev?.event_title ?? "?"}`,
      };
    });
  }, []);

  /* ── category dropdown labels ── */
  const categoryOptions = useMemo(() => {
    return availableCategories.map((tc) => {
      const isFull = tc.used >= tc.quota;
      return {
        value: tc.tcategory_id,
        label: `${tc.category_name} — Rp ${tc.price.toLocaleString("id-ID")} (${tc.used}/${tc.quota})`,
        disabled: isFull,
      };
    });
  }, [availableCategories]);

  /* ── seat dropdown labels ── */
  const seatOptions = useMemo(() => {
    return availableSeats.map((s) => ({
      value: s.seat_id,
      label: `Section ${s.section}, Baris ${s.row}, No. ${s.number}`,
    }));
  }, [availableSeats]);

  /* ── open handler ── */
  const handleOpen = () => {
    setSelectedOrderId("");
    setSelectedCategoryId("");
    setSelectedSeatId("");
    setError("");
    setOpen(true);
  };

  /* ── submit ── */
  const handleSubmit = () => {
    if (!selectedOrderId) {
      setError("Pilih Order terlebih dahulu.");
      return;
    }
    if (!selectedCategoryId) {
      setError("Pilih Kategori Tiket terlebih dahulu.");
      return;
    }

    const newTicket: TicketRow = {
      ticket_id: generateTicketId(),
      ticket_code: generateTicketCode(),
      order_id: selectedOrderId,
      tcategory_id: selectedCategoryId,
      seat_id: selectedSeatId || undefined,
      created_at: new Date().toISOString(),
    };

    onSave(newTicket);
    setOpen(false);
    setError("");
  };

  /* ── reset category + seat when order changes ── */
  const handleOrderChange = (val: string) => {
    setSelectedOrderId(val);
    setSelectedCategoryId("");
    setSelectedSeatId("");
    setError("");
  };

  return (
    <>
      {/* TRIGGER */}
      <button
        onClick={handleOpen}
        className="font-head text-sm px-4 py-2 border-2 border-black bg-[#ffdb33] text-black shadow-[4px_4px_0_0_#000] hover:bg-[#ffcc00] hover:translate-y-px hover:shadow-[3px_3px_0_0_#000] active:translate-y-1 active:shadow-none transition-all duration-100 cursor-pointer"
      >
        + Tambah Tiket
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div
            className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md"
            style={{ animation: "modalIn .18s ease" }}
          >
            {/* Top accent */}
            <div className="h-[5px] bg-[#ffdb33] border-b-2 border-black" />

            <div className="p-6">
              <h2 className="font-head text-xl text-black mb-4">
                Tambah Tiket Baru
              </h2>

              {error && (
                <p className="font-head text-[0.65rem] tracking-wide text-[#e63946] border-2 border-[#e63946] px-3 py-2 mb-4 shadow-[2px_2px_0_0_#e63946]">
                  {error}
                </p>
              )}

              <div className="space-y-4">
                {/* ORDER */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Order
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000] cursor-pointer"
                    value={selectedOrderId}
                    onChange={(e) => handleOrderChange(e.target.value)}
                  >
                    <option value="">Pilih Order</option>
                    {orderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* KATEGORI TIKET */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Kategori Tiket
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={selectedCategoryId}
                    onChange={(e) => { setSelectedCategoryId(e.target.value); setError(""); }}
                    disabled={!selectedOrderId}
                  >
                    <option value="">
                      {selectedOrderId ? "Pilih Kategori" : "Pilih Order dahulu"}
                    </option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}{opt.disabled ? " — PENUH" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* KURSI (Opsional — only for reserved seating) */}
                {isReservedSeating && (
                  <div>
                    <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                      Kursi <span className="text-gray-400 normal-case">(Opsional)</span>
                    </label>
                    <select
                      className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000] cursor-pointer"
                      value={selectedSeatId}
                      onChange={(e) => setSelectedSeatId(e.target.value)}
                    >
                      <option value="">Tanpa kursi</option>
                      {seatOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* KODE TIKET INFO */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Kode Tiket
                  </label>
                  <div className="w-full px-3 py-2.5 border-2 border-dashed border-gray-400 bg-gray-50 text-gray-400 font-sans text-sm italic">
                    Auto-generate saat dibuat
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 border-2 border-black bg-[#ffdb33] text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-[#ffcc00] hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Buat Tiket
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
    </>
  );
}
