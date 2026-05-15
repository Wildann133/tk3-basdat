"use client";

import { useState, useEffect, useCallback } from "react";
import TicketForm from "./TicketForm";

/* ── local types ── */
export type TicketRow = {
  ticket_id: string;
  ticket_code: string;
  order_id: string;
  tcategory_id: string;
  seat_id?: string;
  created_at: string;
};

type TicketFromAPI = {
  ticket_id: string;
  ticket_code: string;
  order_id: string;
  tcategory_id: string;
  created_at: string;
  category_name: string;
  category_price: number;
  event_title: string;
  event_id: string;
  customer_name: string;
  seat_id: string | null;
  seat_section: string | null;
  seat_row: string | null;
  seat_number: number | null;
};

/* ──────────────────────────────────────────────────────────── */
export default function TicketTable({ role }: { role?: string }) {
  const canCreate = role === "admin" || role === "organizer";
  const canDelete = role === "admin";

  const [tickets, setTickets] = useState<TicketFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /* ── fetch tickets ── */
  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Gagal memuat tiket");
      const data: TicketFromAPI[] = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  /* ── handlers ── */
  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/tickets?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus tiket");
      }
      setDeleteId(null);
      await fetchTickets();
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async () => {
    // Refresh dari DB setelah tiket baru dibuat
    await fetchTickets();
  };

  /* ── helpers ── */
  const getSeatLabel = (tkt: TicketFromAPI) => {
    if (!tkt.seat_id) return null;
    return `Section ${tkt.seat_section}, Baris ${tkt.seat_row}, No. ${tkt.seat_number}`;
  };

  const getCategoryLabel = (tkt: TicketFromAPI) => {
    return `${tkt.category_name} — Rp ${Number(tkt.category_price).toLocaleString("id-ID")}`;
  };

  /* ── filter ── */
  const filtered = tickets
    .filter((t) => {
      const q = search.toLowerCase();
      return (
        t.ticket_code.toLowerCase().includes(q) ||
        t.order_id.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.event_title.toLowerCase().includes(q)
      );
    });

  const ticketToDelete = tickets.find((t) => t.ticket_id === deleteId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="font-head text-sm tracking-widest uppercase text-gray-500 animate-pulse">
          Memuat data tiket...
        </div>
      </div>
    );
  }

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="font-head text-[0.65rem] tracking-[0.08em] uppercase bg-[#ffdb33] border-2 border-black shadow-[2px_2px_0_0_#000] px-3 py-1.5">
            {filtered.length} tiket
          </span>

          {canCreate && <TicketForm onSave={handleSave} />}
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
              {canDelete && (
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
                  {tkt.customer_name}
                </td>

                {/* Event */}
                <td className="px-5 py-3.5">
                  <span className="font-head text-[0.6rem] uppercase bg-[#ffdb33] border-2 border-black px-2.5 py-1">
                    {tkt.event_title}
                  </span>
                </td>

                {/* Kategori */}
                <td className="px-5 py-3.5 text-black text-xs">
                  {getCategoryLabel(tkt)}
                </td>

                {/* Kursi */}
                <td className="px-5 py-3.5 text-xs text-black">
                  {getSeatLabel(tkt) ?? (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>

                {/* Aksi */}
                {canDelete && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setDeleteId(tkt.ticket_id); setDeleteError(""); }}
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
      {deleteId && canDelete && (
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

              {deleteError && (
                <p className="font-head text-[0.65rem] tracking-wide text-[#e63946] border-2 border-[#e63946] px-3 py-2 mb-4 shadow-[2px_2px_0_0_#e63946]">
                  {deleteError}
                </p>
              )}

              <div className="flex gap-2.5">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 border-2 border-black bg-[#e63946] text-white font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-[#c62f3b] hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer disabled:opacity-50"
                >
                  {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
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
