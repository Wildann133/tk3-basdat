"use client";

import { useState } from "react";

export default function TicketCategoryForm({ category, onSave }: any) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState(category?.name || "");
  const [quota, setQuota] = useState(category?.quota || 0);
  const [price, setPrice] = useState(category?.price || 0);
  const [event, setEvent] = useState(category?.event || "");

  const events = ["Concert A", "Concert B", "Festival X"];

  const handleSubmit = () => {
    if (!name || quota <= 0 || price < 0 || !event) {
      alert("Isi semua field dengan benar!");
      return;
    }

    onSave({
      id: category?.id || Date.now().toString(),
      name,
      quota,
      price,
      event,
    });

    setOpen(false);
  };

  return (
    <>
      {/* BUTTON (match artist) */}
      <button
        onClick={() => setOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm"
      >
        {category ? "Update" : "+ Tambah"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-3xl w-80 shadow-xl">

            <h2 className="text-xl font-semibold text-orange-500 mb-4">
              {category ? "Update" : "Tambah"} Kategori
            </h2>

            <div className="space-y-4">

              {/* NAME */}
              <div>
                <label className="text-sm text-gray-600">
                  Nama Kategori
                </label>
                <input
                  className="
                    w-full mt-1 px-3 py-2.5
                    border border-orange-200
                    rounded-xl
                    bg-white
                    text-gray-800
                    placeholder:text-gray-400
                    focus:outline-none
                    focus:ring-2 focus:ring-orange-400
                  "
                  placeholder="VIP / Regular"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* QUOTA */}
              <div>
                <label className="text-sm text-gray-600">
                  Quota
                </label>
                <input
                  type="number"
                  className="
                    w-full mt-1 px-3 py-2.5
                    border border-orange-200
                    rounded-xl
                    text-gray-800
                    focus:outline-none
                    focus:ring-2 focus:ring-orange-400
                  "
                  value={quota}
                  onChange={(e) => setQuota(Number(e.target.value))}
                />
              </div>

              {/* PRICE */}
              <div>
                <label className="text-sm text-gray-600">
                  Harga
                </label>
                <input
                  type="number"
                  className="
                    w-full mt-1 px-3 py-2.5
                    border border-orange-200
                    rounded-xl
                    text-gray-800
                    focus:outline-none
                    focus:ring-2 focus:ring-orange-400
                  "
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>

              {/* EVENT */}
              <div>
                <label className="text-sm text-gray-600">
                  Event
                </label>
                <select
                  className="
                    w-full mt-1 px-3 py-2.5
                    border border-orange-200
                    rounded-xl
                    text-gray-800
                    bg-white
                    focus:outline-none
                    focus:ring-2 focus:ring-orange-400
                  "
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                >
                  <option value="">Pilih Event</option>
                  {events.map((ev) => (
                    <option key={ev}>{ev}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* ACTION */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Batal
              </button>

              <button
                onClick={handleSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl shadow-sm"
              >
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}