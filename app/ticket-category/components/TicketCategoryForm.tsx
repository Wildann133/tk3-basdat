"use client";

import { useState, useEffect } from "react";

export default function TicketCategoryForm({ category, onSave }: any) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  const [name, setName] = useState(category?.name || "");
  const [quota, setQuota] = useState<number | string>(category?.quota || "");
  const [price, setPrice] = useState<number | string>(category?.price !== undefined ? category.price : "");
  const [eventId, setEventId] = useState(category?.event_id || "");
  
  // Ubah error menjadi string agar pesannya bisa spesifik
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil daftar event saat modal dibuka
  useEffect(() => {
    if (open) {
      fetch('/api/events')
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(err => console.error("Gagal load events:", err));
    }
  }, [open]);

  const handleOpen = () => {
    setName(category?.name || "");
    setQuota(category?.quota || "");
    setPrice(category?.price !== undefined ? category.price : "");
    setEventId(category?.event_id || "");
    setErrorMsg("");
    setOpen(true);
  };

  const handleSubmit = () => {
    
    // 1. Seluruh field wajib diisi & Category Name wajib diisi
    if (!name.trim()) {
      setErrorMsg("Category Name wajib diisi!");
      return;
    }
    if (quota === "" || price === "" || !eventId) {
      setErrorMsg("Seluruh field wajib diisi!");
      return;
    }

    const numQuota = Number(quota);
    const numPrice = Number(price);

    // 2. Quota harus berupa bilangan bulat positif (> 0)
    if (numQuota <= 0 || !Number.isInteger(numQuota)) {
      setErrorMsg("Quota harus berupa bilangan bulat positif (> 0)!");
      return;
    }

    // 3. Price harus berupa bilangan tidak negatif (>= 0)
    if (numPrice < 0) {
      setErrorMsg("Price harus berupa bilangan tidak negatif (>= 0)!");
      return;
    }

    // Jika lolos semua validasi:
    onSave({
      id: category?.id || null,
      name: name.trim(),
      quota: numQuota,
      price: numPrice,
      event_id: eventId,
    });

    setOpen(false);
  };

  return (
    <>
      <button 
        onClick={handleOpen} 
        className={category 
          ? "font-head text-xs px-3 py-1.5 border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:bg-[#ffdb33] transition-all cursor-pointer" 
          : "font-head text-sm px-4 py-2 border-2 border-black bg-[#ffdb33] text-black shadow-[4px_4px_0_0_#000] hover:bg-[#ffcc00] transition-all cursor-pointer"
        }
      >
        {category ? "Update" : "+ Tambah"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm">
            <div className="h-[5px] bg-[#ffdb33] border-b-2 border-black" />
            <div className="p-6">
              <h2 className="font-head text-xl text-black mb-4">{category ? "Update" : "Tambah"} Kategori</h2>
              
              {errorMsg && (
                <p className="font-sans text-xs text-[#e63946] border-2 border-[#e63946] bg-red-50 px-3 py-2 mb-4 font-bold">
                  ⚠️ {errorMsg}
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="font-head text-[0.6rem] uppercase block mb-1 text-black">Nama Kategori</label>
                  <input 
                    className={`w-full px-3 py-2 border-2 bg-[#f9f6ef] text-sm focus:bg-[#ffdb33] outline-none ${errorMsg.includes("Category Name") ? "border-[#e63946]" : "border-black"}`} 
                    placeholder="Contoh: VIP / Regular" 
                    value={name} 
                    // PERBAIKAN TYPESCRIPT DI SINI
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-head text-[0.6rem] uppercase block mb-1 text-black">Quota</label>
                    <input 
                      type="number" 
                      className={`w-full px-3 py-2 border-2 bg-[#f9f6ef] text-sm focus:bg-[#ffdb33] outline-none ${errorMsg.includes("Quota") ? "border-[#e63946]" : "border-black"}`} 
                      value={quota} 
                      // PERBAIKAN TYPESCRIPT DI SINI
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuota(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="font-head text-[0.6rem] uppercase block mb-1 text-black">Harga</label>
                    <input 
                      type="number" 
                      className={`w-full px-3 py-2 border-2 bg-[#f9f6ef] text-sm focus:bg-[#ffdb33] outline-none ${errorMsg.includes("Price") ? "border-[#e63946]" : "border-black"}`} 
                      value={price} 
                      // PERBAIKAN TYPESCRIPT DI SINI
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <label className="font-head text-[0.6rem] uppercase block mb-1 text-black">Pilih Event</label>
                  <select 
                    className={`w-full px-3 py-2 border-2 bg-[#f9f6ef] text-sm cursor-pointer focus:bg-[#ffdb33] outline-none ${errorMsg.includes("Event") ? "border-[#e63946]" : "border-black"}`} 
                    value={eventId} 
                    // PERBAIKAN TYPESCRIPT DI SINI
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEventId(e.target.value)}
                  >
                    <option value="" disabled>-- Pilih Event --</option>
                    {events.map((ev) => (
                      <option key={ev.id || ev.event_id} value={ev.id || ev.event_id}>
                        {ev.title || ev.event_title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2.5 mt-6">
                <button onClick={() => setOpen(false)} className="flex-1 py-2 border-2 border-black bg-white text-xs shadow-[3px_3px_0_0_#000] font-head cursor-pointer hover:bg-gray-100">Batal</button>
                <button onClick={handleSubmit} className="flex-1 py-2 border-2 border-black bg-[#ffdb33] text-xs shadow-[3px_3px_0_0_#000] font-head cursor-pointer hover:bg-[#ffcc00]">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}