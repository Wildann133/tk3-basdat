"use client";

import { useState } from "react";

const EVENTS = ["Concert A", "Concert B", "Festival X"];

export default function TicketCategoryForm({ category, onSave }: any) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState(category?.name || "");
  const [quota, setQuota] = useState(category?.quota || 0);
  const [price, setPrice] = useState(category?.price || 0);
  const [event, setEvent] = useState(category?.event || "");
  const [error, setError] = useState(false);

  const handleOpen = () => {
    setName(category?.name || "");
    setQuota(category?.quota || 0);
    setPrice(category?.price || 0);
    setEvent(category?.event || "");
    setError(false);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || quota <= 0 || price < 0 || !event) {
      setError(true);
      return;
    }

    onSave({
      id: category?.id || Date.now().toString(),
      name: name.trim(),
      quota,
      price,
      event,
    });

    setOpen(false);
    setError(false);
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={handleOpen}
        className={
          category
            ? "font-head text-xs px-3 py-1.5 border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:bg-[#ffdb33] hover:translate-y-px hover:shadow-[1px_1px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
            : "font-head text-sm px-4 py-2 border-2 border-black bg-[#ffdb33] text-black shadow-[4px_4px_0_0_#000] hover:bg-[#ffcc00] hover:translate-y-px hover:shadow-[3px_3px_0_0_#000] active:translate-y-1 active:shadow-none transition-all duration-100 cursor-pointer"
        }
      >
        {category ? "Update" : "+ Tambah"}
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
                {category ? "Update" : "Tambah"} Kategori
              </h2>

              {error && (
                <p className="font-head text-[0.65rem] tracking-wide text-[#e63946] border-2 border-[#e63946] px-3 py-2 mb-4 shadow-[2px_2px_0_0_#e63946]">
                  Isi semua field dengan benar!
                </p>
              )}

              <div className="space-y-4">
                {/* NAME */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Nama Kategori
                  </label>
                  <input
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm placeholder:text-gray-400 outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
                    placeholder="VIP / Regular"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(false); }}
                  />
                </div>

                {/* QUOTA */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Quota
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
                    value={quota}
                    onChange={(e) => { setQuota(Number(e.target.value)); setError(false); }}
                  />
                </div>

                {/* PRICE */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
                    value={price}
                    onChange={(e) => { setPrice(Number(e.target.value)); setError(false); }}
                  />
                </div>

                {/* EVENT */}
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Event
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000] cursor-pointer"
                    value={event}
                    onChange={(e) => { setEvent(e.target.value); setError(false); }}
                  >
                    <option value="">Pilih Event</option>
                    {EVENTS.map((ev) => (
                      <option key={ev} value={ev}>{ev}</option>
                    ))}
                  </select>
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
                  Simpan
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