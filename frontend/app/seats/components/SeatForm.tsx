"use client";

import { useState } from "react";
import type { SeatRow } from "./SeatTable";

/* ── props ── */
interface SeatFormProps {
  seat?: SeatRow;
  onSave: (seat: SeatRow) => void;
  venues: { venue_id: string; venue_name: string }[];
}

export default function SeatForm({ seat, onSave, venues }: SeatFormProps) {
  const isEdit = !!seat;
  const [open, setOpen] = useState(false);

  /* form state */
  const [venueId, setVenueId] = useState(seat?.venue_id ?? "");
  const [section, setSection] = useState(seat?.section ?? "");
  const [row, setRow] = useState(seat?.row ?? "");
  const [number, setNumber] = useState(seat?.number ?? 1);
  const [error, setError] = useState("");

  const handleOpen = () => {
    setVenueId(seat?.venue_id ?? "");
    setSection(seat?.section ?? "");
    setRow(seat?.row ?? "");
    setNumber(seat?.number ?? 1);
    setError("");
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!venueId) { setError("Pilih venue terlebih dahulu."); return; }
    if (!section.trim()) { setError("Section tidak boleh kosong."); return; }
    if (!row.trim()) { setError("Baris tidak boleh kosong."); return; }
    if (number <= 0) { setError("No. Kursi harus lebih dari 0."); return; }

    onSave({
      seat_id: seat?.seat_id ?? `seat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
      section: section.trim(),
      row: row.trim(),
      number,
      venue_id: venueId,
    });

    setOpen(false);
    setError("");
  };

  return (
    <>
      {/* TRIGGER */}
      <button
        onClick={handleOpen}
        className={
          isEdit
            ? "font-head text-xs px-3 py-1.5 border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:bg-[#ffdb33] hover:translate-y-px hover:shadow-[1px_1px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
            : "font-head text-sm px-4 py-2 border-2 border-black bg-[#ffdb33] text-black shadow-[4px_4px_0_0_#000] hover:bg-[#ffcc00] hover:translate-y-px hover:shadow-[3px_3px_0_0_#000] active:translate-y-1 active:shadow-none transition-all duration-100 cursor-pointer"
        }
      >
        {isEdit ? "Edit" : "+ Tambah Kursi"}
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div
            className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm"
            style={{ animation: "modalIn .18s ease" }}
          >
            {/* Top accent */}
            <div className="h-[5px] bg-[#ffdb33] border-b-2 border-black" />

            <div className="p-6">
              <h2 className="font-head text-xl text-black mb-4">
                {isEdit ? "Update Kursi" : "Tambah Kursi Baru"}
              </h2>

              {error && (
                <p className="font-head text-[0.65rem] tracking-wide text-[#e63946] border-2 border-[#e63946] px-3 py-2 mb-4 shadow-[2px_2px_0_0_#e63946]">
                  {error}
                </p>
              )}

              <div className="space-y-4">
                {/* VENUE */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Venue
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000] cursor-pointer"
                    value={venueId}
                    onChange={(e) => { setVenueId(e.target.value); setError(""); }}
                  >
                    <option value="">Pilih Venue</option>
                    {venues.map((v) => (
                      <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>
                    ))}
                  </select>
                </div>

                {/* SECTION */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Section
                  </label>
                  <input
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm placeholder:text-gray-400 outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
                    placeholder="cth: VVIP, VIP, Tribune West"
                    value={section}
                    onChange={(e) => { setSection(e.target.value); setError(""); }}
                  />
                </div>

                {/* BARIS */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Baris
                  </label>
                  <input
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm placeholder:text-gray-400 outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
                    placeholder="cth: A, B, C, 1, 2, 3"
                    value={row}
                    onChange={(e) => { setRow(e.target.value); setError(""); }}
                  />
                </div>

                {/* NO. KURSI */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    No. Kursi
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
                    value={number}
                    onChange={(e) => { setNumber(Number(e.target.value)); setError(""); }}
                  />
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
                  {isEdit ? "Simpan" : "Tambah"}
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
