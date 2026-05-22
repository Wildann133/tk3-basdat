"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

/* ── types ── */
type OrderOption = {
  order_id: string;
  customer_name: string;
  event_title: string;
  event_id: string;
  venue_id: string;
};

type CategoryOption = {
  id: string;
  name: string;
  quota: number;
  price: number;
  event_id: string;
  ticket_count?: number;
};

type SeatOption = {
  seat_id: string;
  section: string;
  row: string;
  number: number;
  venue_id: string;
  is_assigned: boolean;
};

type VenueOption = {
  venue_id: string;
  venue_name: string;
  seating_type: string;
};

/* ── props ── */
interface TicketFormProps {
  onSave: () => void;
  userId?: string;
}

export default function TicketForm({ onSave, userId }: TicketFormProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* form state */
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [error, setError] = useState("");

  /* data from API */
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [seats, setSeats] = useState<SeatOption[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);

  /* ── fetch orders ── */
  const fetchOrders = useCallback(async () => {
    try {
      const url = userId ? `/api/tickets/orders?userId=${userId}` : "/api/tickets/orders";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Gagal memuat orders:", err);
    }
  }, [userId]);

  /* ── fetch categories ── */
  const fetchCategories = useCallback(async () => {
    try {
      const url = userId ? `/api/ticket-categories?userId=${userId}` : "/api/ticket-categories";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Gagal memuat categories:", err);
    }
  }, [userId]);

  /* ── fetch seats ── */
  const fetchSeats = useCallback(async () => {
    try {
      const res = await fetch("/api/seats");
      if (!res.ok) return;
      const data = await res.json();
      setSeats(data);
    } catch (err) {
      console.error("Gagal memuat seats:", err);
    }
  }, []);

  /* ── fetch venues ── */
  const fetchVenues = useCallback(async () => {
    try {
      const res = await fetch("/api/venues");
      if (!res.ok) return;
      const data = await res.json();
      setVenues(data);
    } catch (err) {
      console.error("Gagal memuat venues:", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchCategories();
    fetchSeats();
    fetchVenues();
  }, [fetchOrders, fetchCategories, fetchSeats, fetchVenues]);

  /* ── derived: selected order → event ── */
  const selectedOrder = orders.find((o) => o.order_id === selectedOrderId);

  /* ── derived: venue from event ── */
  const selectedVenue = selectedOrder
    ? venues.find((v) => v.venue_id === selectedOrder.venue_id)
    : null;

  const isReservedSeating = selectedVenue?.seating_type === "reserved seating";

  /* ── ticket categories filtered by event ── */
  const availableCategories = useMemo(() => {
    if (!selectedOrder) return [];
    return categories.filter((tc) => tc.event_id === selectedOrder.event_id);
  }, [selectedOrder, categories]);

  /* ── available seats: venue seats minus already-assigned seats ── */
  const availableSeats = useMemo(() => {
    if (!selectedVenue || !isReservedSeating) return [];
    return seats.filter(
      (s) => s.venue_id === selectedVenue.venue_id && !s.is_assigned
    );
  }, [selectedVenue, isReservedSeating, seats]);

  /* ── order dropdown labels ── */
  const orderOptions = useMemo(() => {
    return orders.map((ord) => ({
      value: ord.order_id,
      label: `${ord.order_id} — ${ord.customer_name ?? "?"} — ${ord.event_title ?? "?"}`,
    }));
  }, [orders]);

  /* ── category dropdown labels ── */
  const categoryOptions = useMemo(() => {
    return availableCategories.map((tc) => {
      const used = tc.ticket_count ?? 0;
      const isFull = used >= tc.quota;
      return {
        value: tc.id,
        label: `${tc.name} — Rp ${Number(tc.price).toLocaleString("id-ID")} (${used}/${tc.quota})`,
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
    // Refresh data saat buka modal
    fetchOrders();
    fetchCategories();
    fetchSeats();
    setOpen(true);
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!selectedOrderId) {
      setError("Pilih Order terlebih dahulu.");
      return;
    }
    if (!selectedCategoryId) {
      setError("Pilih Kategori Tiket terlebih dahulu.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrderId,
          tcategory_id: selectedCategoryId,
          seat_id: selectedSeatId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal membuat tiket");
      }

      setOpen(false);
      setError("");
      onSave(); // Refresh parent table
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleOrderChange(e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCategoryId(e.target.value); setError(""); }}
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
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSeatId(e.target.value)}
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
                  disabled={saving}
                  className="flex-1 py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 py-2.5 border-2 border-black bg-[#ffdb33] text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-[#ffcc00] hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Membuat..." : "Buat Tiket"}
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
