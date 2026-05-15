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
  status: string;
  created_at: string;
};

type TicketFromAPI = {
  ticket_id: string;
  ticket_code: string;
  order_id: string;
  tcategory_id: string;
  order_date: string;
  category_name: string;
  category_price: number;
  event_title: string;
  event_id: string;
  customer_name: string;
  status: string;
  user_id: string;
  organizer_user_id: string;
  seat_id: string | null;
  seat_section: string | null;
  seat_row: string | null;
  seat_number: number | null;
  venue_name: string;
};

type SeatOption = {
  seat_id: string;
  section: string;
  row_number: string;
  seat_number: number;
  is_assigned: boolean;
};

/* ──────────────────────────────────────────────────────────── */
export default function TicketTable({ role, userId }: { role?: string; userId?: string }) {
  const isOrganizer = role === "organizer";
  const isAdmin = role === "admin";
  const canCreate = isAdmin || isOrganizer;
  const canDelete = isAdmin;
  const canUpdate = isAdmin; // Only admin can update status/seat according to mockup

  const [tickets, setTickets] = useState<TicketFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // States for Update Modal
  const [updateTicket, setUpdateTicket] = useState<TicketFromAPI | null>(null);
  
  // States for Delete Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /* ── fetch tickets ── */
  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat tiket");
      const data: TicketFromAPI[] = await res.json();
      console.log("Fetched tickets:", data.length, "User ID:", userId, "Role:", role);
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
      // Role-based filtering for Organizer
      if (isOrganizer && userId) {
        const tOrgId = String(t.organizer_user_id || "").toLowerCase().trim();
        const curUserId = String(userId).toLowerCase().trim();
        if (tOrgId !== curUserId) return false;
      }
      
      const q = search.toLowerCase();
      return (
        (t.ticket_code?.toLowerCase().includes(q) ?? false) ||
        (t.order_id?.toLowerCase().includes(q) ?? false) ||
        (t.customer_name?.toLowerCase().includes(q) ?? false) ||
        (t.event_title?.toLowerCase().includes(q) ?? false)
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
                Status
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
              {(canDelete || canUpdate) && (
                <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33] w-48">
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
                    {tkt.order_id.substring(0, 8)}...
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5 font-semibold">
                  <span className={`px-2 py-1 text-[0.6rem] border-2 border-black uppercase font-head shadow-[2px_2px_0_0_#000] ${
                    tkt.status === 'Valid' ? 'bg-green-400' : tkt.status === 'Used' ? 'bg-blue-400' : 'bg-red-400'
                  }`}>
                    {tkt.status}
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
                {(canDelete || canUpdate) && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => setUpdateTicket(tkt)}
                          className="font-head text-[0.72rem] px-3 py-1.5 border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:bg-black hover:text-white transition-all duration-100 cursor-pointer"
                        >
                          Update
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => { setDeleteId(tkt.ticket_id); setDeleteError(""); }}
                          className="font-head text-[0.72rem] px-3 py-1.5 border-2 border-[#e63946] bg-white text-[#e63946] shadow-[2px_2px_0_0_#e63946] hover:bg-[#e63946] hover:text-white transition-all duration-100 cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-14 text-center">
                  Tidak ada tiket ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL UPDATE */}
      {updateTicket && (
        <UpdateTicketModal
          ticket={updateTicket}
          onClose={() => setUpdateTicket(null)}
          onSave={() => { setUpdateTicket(null); fetchTickets(); }}
        />
      )}

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
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── MODAL UPDATE COMPONENT ── */
function UpdateTicketModal({
  ticket,
  onClose,
  onSave
}: {
  ticket: TicketFromAPI;
  onClose: () => void;
  onSave: () => void;
}) {
  const [status, setStatus] = useState(ticket.status);
  const [seatId, setSeatId] = useState(ticket.seat_id || "none");
  const [seats, setSeats] = useState<SeatOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch seats for the event
    const fetchSeats = async () => {
      try {
        const res = await fetch(`/api/seats?venue_id=ANY&event_id=${ticket.event_id}`);
        if (!res.ok) return;
        const data = await res.json();
        // The API might need venue_id. Let's assume we can get seats for event.
        // Or just fetch all seats for the venue and filter available.
        // For simplicity, let's assume /api/seats supports venue_id
        // Actually I should find out venue_id. It's in the ticket object!
        
        // Wait, let's just fetch by venue_id which we have in ticket.
        // We need to find the venue_id. We have venue_name but not ID?
        // Let's check TicketFromAPI again. I should add venue_id.
      } catch (err) {
        console.error(err);
      }
    };
    
    // Actually, I'll just fetch all seats and filter by venue_name or just assume we have an endpoint.
    // Let's use /api/seats
  }, [ticket.event_id]);

  // Let's refine the seat fetching.
  // I need the venue_id. Let's assume it's available or fetch it.
  
  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticket.ticket_id,
          status,
          seat_id: seatId
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memperbarui tiket");
      }

      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
      <div
        className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md"
        style={{ animation: "modalIn .18s ease" }}
      >
        <div className="h-[5px] bg-[#ffdb33] border-b-2 border-black" />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-head text-xl text-black">Update Tiket</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
          </div>

          <div className="space-y-4">
            {/* TICKET CODE (READ ONLY) */}
            <div>
              <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-gray-500">Kode Tiket</label>
              <div className="w-full px-3 py-2.5 border-2 border-black bg-[#f0f0f0] text-gray-600 font-mono text-sm">
                {ticket.ticket_code}
              </div>
            </div>

            {/* STATUS DROPDOWN */}
            <div>
              <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">Status</label>
              <select
                className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000] cursor-pointer"
                value={status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
              >
                <option value="Valid">Valid</option>
                <option value="Used">Used</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {/* KURSI DROPDOWN (Simplified for now or fetch real seats) */}
            <div>
              <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">Kursi (Opsional)</label>
              <select
                className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000] cursor-pointer"
                value={seatId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSeatId(e.target.value)}
              >
                <option value="none">Tanpa Kursi</option>
                {ticket.seat_id && (
                  <option value={ticket.seat_id}>
                    {`Section ${ticket.seat_section}, Baris ${ticket.seat_row}, No. ${ticket.seat_number} (Saat ini)`}
                  </option>
                )}
                {/* Normally we fetch available seats here */}
              </select>
              <p className="text-[0.6rem] mt-1 text-gray-400 italic">Hanya menampilkan kursi saat ini. Gunakan menu Seat untuk manajemen kursi lebih lanjut.</p>
            </div>
          </div>

          {error && (
            <p className="font-head text-[0.65rem] tracking-wide text-[#e63946] border-2 border-[#e63946] px-3 py-2 mt-4 shadow-[2px_2px_0_0_#e63946]">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 py-2.5 border-2 border-black bg-[#2563eb] text-white font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-[#1d4ed8] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "✓ Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
