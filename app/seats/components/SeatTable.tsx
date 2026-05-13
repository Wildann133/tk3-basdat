"use client";

import { useState, useMemo } from "react";
import SeatForm from "./SeatForm";
import { SEATS, VENUES, HAS_RELATIONSHIP } from "@/lib/dummyData";

/* ── local type ── */
export type SeatRow = {
  seat_id: string;
  section: string;
  row: string;
  number: number;
  venue_id: string;
};

/* ── helpers ── */
const getVenueName = (venueId: string) =>
  VENUES.find((v) => v.venue_id === venueId)?.venue_name ?? "—";

const isSeatAssigned = (seatId: string, assignedSet: Set<string>) =>
  assignedSet.has(seatId);

/* ── component ── */
export default function SeatTable({ role }: { role?: string }) {
  const canManage = role === "admin" || role === "organizer";

  const [seats, setSeats] = useState<SeatRow[]>(
    SEATS.map((s) => ({ ...s, row: String(s.row) }))
  );
  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* track which seats are assigned to tickets */
  const assignedSeatIds = useMemo(
    () => new Set(HAS_RELATIONSHIP.map((r) => r.seat_id)),
    []
  );

  /* reserved-seating venues only */
  const reservedVenues = useMemo(
    () => VENUES.filter((v) => v.seating_type === "reserved seating"),
    []
  );

  /* ── handlers ── */
  const handleSave = (seat: SeatRow) => {
    setSeats((prev) => {
      const exists = prev.find((s) => s.seat_id === seat.seat_id);
      if (exists) return prev.map((s) => (s.seat_id === seat.seat_id ? seat : s));
      return [...prev, seat];
    });
  };

  const handleDelete = (id: string) => {
    setSeats((prev) => prev.filter((s) => s.seat_id !== id));
    setDeleteId(null);
  };

  /* ── filtering ── */
  const filtered = useMemo(() => {
    let result = seats;

    if (venueFilter !== "all") {
      result = result.filter((s) => s.venue_id === venueFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.section.toLowerCase().includes(q) ||
          String(s.row).toLowerCase().includes(q) ||
          String(s.number).includes(q)
      );
    }

    return result;
  }, [seats, venueFilter, search]);

  /* ── stats ── */
  const totalSeats = seats.length;
  const terisiCount = seats.filter((s) => assignedSeatIds.has(s.seat_id)).length;
  const tersediaCount = totalSeats - terisiCount;

  const seatToDelete = seats.find((s) => s.seat_id === deleteId);
  const deleteIsAssigned = deleteId ? assignedSeatIds.has(deleteId) : false;

  return (
    <div>
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Kursi" value={totalSeats} />
        <StatCard label="Tersedia" value={tersediaCount} />
        <StatCard label="Terisi" value={terisiCount} />
      </div>

      {/* ── MAIN TABLE SECTION ── */}
      <div className="bg-white border-4 border-black">
        <div className="p-6 bg-black text-white flex items-center justify-between">
          <h2 className="text-xl font-head">Daftar Kursi</h2>
          {canManage && <SeatForm onSave={handleSave} venues={reservedVenues} />}
        </div>

        <div className="p-6 bg-[#f9f6ef]">
          {/* TOOLBAR */}
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
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
                placeholder="Cari section, baris, atau nomor..."
                className="w-full pl-9 pr-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Venue filter */}
              <select
                className="px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-sm text-black font-sans outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000] cursor-pointer"
                value={venueFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVenueFilter(e.target.value)}
              >
                <option value="all">Semua Venue</option>
                {reservedVenues.map((v) => (
                  <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>
                ))}
              </select>

              {/* Count */}
              <span className="font-head text-[0.65rem] tracking-[0.08em] uppercase bg-[#ffdb33] border-2 border-black shadow-[2px_2px_0_0_#000] px-3 py-1.5">
                {filtered.length} kursi
              </span>
            </div>
          </div>

          {/* TABLE */}
          <div className="border-2 border-black overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black">
                  <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                    Section
                  </th>
                  <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                    Baris
                  </th>
                  <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                    No. Kursi
                  </th>
                  <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                    Venue
                  </th>
                  <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                    Status
                  </th>
                  {canManage && (
                    <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33] w-36">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filtered.map((seat) => {
                  const assigned = isSeatAssigned(seat.seat_id, assignedSeatIds);
                  return (
                    <tr
                      key={seat.seat_id}
                      className="border-b-2 border-black bg-white hover:bg-[#ffdb33] transition-colors duration-100 group"
                    >
                      {/* Section */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border-2 border-black bg-[#ffdb33] group-hover:bg-white flex items-center justify-center font-head text-sm text-black shadow-[2px_2px_0_0_#000]">
                            💺
                          </div>
                          <span className="font-semibold text-black">{seat.section}</span>
                        </div>
                      </td>

                      {/* Baris */}
                      <td className="px-5 py-3.5 font-semibold text-black">
                        {seat.row}
                      </td>

                      {/* No. Kursi */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-head text-[0.6rem] uppercase bg-[#ffdb33] border-2 border-black px-2.5 py-1">
                          {seat.number}
                        </span>
                      </td>

                      {/* Venue */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🏟</span>
                          <span className="text-xs text-black">{getVenueName(seat.venue_id)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        {assigned ? (
                          <span className="font-head text-[0.6rem] tracking-[0.1em] uppercase px-2.5 py-1 border-2 bg-red-100 text-red-700 border-red-700">
                            ⊘ Terisi
                          </span>
                        ) : (
                          <span className="font-head text-[0.6rem] tracking-[0.1em] uppercase px-2.5 py-1 border-2 bg-green-100 text-green-800 border-green-800">
                            ✓ Tersedia
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      {canManage && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <SeatForm
                              seat={seat}
                              onSave={handleSave}
                              venues={reservedVenues}
                            />
                            <button
                              onClick={() => setDeleteId(seat.seat_id)}
                              disabled={assigned}
                              title={
                                assigned
                                  ? "Kursi ini sudah di-assign ke tiket dan tidak dapat dihapus."
                                  : "Hapus kursi"
                              }
                              className={`font-head text-[0.72rem] px-3 py-1.5 border-2 transition-all duration-100 cursor-pointer ${
                                assigned
                                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                  : "border-[#e63946] bg-white text-[#e63946] shadow-[2px_2px_0_0_#e63946] hover:bg-[#e63946] hover:text-white"
                              }`}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      Tidak ada kursi ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {deleteId && canManage && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div
            className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm"
            style={{ animation: "modalIn .18s ease" }}
          >
            <div className={`h-[5px] border-b-2 border-black ${deleteIsAssigned ? "bg-gray-400" : "bg-[#e63946]"}`} />
            <div className="p-6">
              {deleteIsAssigned ? (
                <>
                  <h2 className="font-head text-xl text-black mb-2">Tidak Dapat Dihapus</h2>
                  <p className="font-head text-[0.65rem] tracking-wide text-[#e63946] border-2 border-[#e63946] px-3 py-2 mb-4 shadow-[2px_2px_0_0_#e63946]">
                    Kursi ini sudah di-assign ke tiket dan tidak dapat dihapus. Hapus atau ubah tiket terlebih dahulu.
                  </p>
                  <button
                    onClick={() => setDeleteId(null)}
                    className="w-full py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                  >
                    Tutup
                  </button>
                </>
              ) : (
                <>
                  <h2 className="font-head text-xl text-black mb-2">Hapus Kursi</h2>
                  <p className="text-sm mb-1">Apakah Anda yakin ingin menghapus kursi berikut?</p>
                  <p className="font-mono text-xs font-bold bg-[#f9f6ef] border-2 border-black px-3 py-2 mb-4">
                    {seatToDelete?.section} — Baris {seatToDelete?.row}, No. {seatToDelete?.number}
                    <br />
                    <span className="text-gray-500 font-sans">{getVenueName(seatToDelete?.venue_id ?? "")}</span>
                  </p>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setDeleteId(null)}
                      className="flex-1 py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleDelete(deleteId)}
                      className="flex-1 py-2.5 border-2 border-black bg-[#e63946] text-white font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-[#c62f3b] hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </>
              )}
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

/* ── Stat Card ── */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-5 flex flex-col items-center justify-center gap-1">
      <p className="font-head text-[0.6rem] tracking-[0.1em] uppercase text-gray-500">
        {label}
      </p>
      <p className="font-head text-4xl text-black">{value}</p>
    </div>
  );
}
