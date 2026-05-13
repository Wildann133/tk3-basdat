"use client";

import { useState, useEffect } from "react";
import TicketCategoryForm from "./TicketCategoryForm";

export default function TicketCategoryTable({ role }: { role?: string }) {
  // Hanya admin dan organizer yang bisa memanajemen (CUD)
  // Guest atau customer hanya bisa read-only
  const canManage = role === "admin" || role === "organizer";

  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // STATE UNTUK NOTIFIKASI (Toast)
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Ambil data dari API
  useEffect(() => {
    fetch('/api/ticket-categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Gagal memuat kategori:", error);
        showNotification("error", "Gagal memuat data dari server.");
        setIsLoading(false);
      });
  }, []);

  const handleSave = async (payload: any) => {
    const isEdit = !!payload.id;
    try {
      const res = await fetch('/api/ticket-categories', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Refresh data agar JOIN event_name terupdate dari server
        const refresh = await fetch('/api/ticket-categories');
        const newData = await refresh.json();
        setCategories(newData);
        showNotification("success", isEdit ? "Kategori tiket berhasil diupdate!" : "Kategori baru berhasil ditambahkan!");
      } else {
        const err = await res.json();
        showNotification("error", err.error || "Gagal menyimpan kategori tiket.");
      }
    } catch (error) {
      console.error("Gagal simpan:", error);
      showNotification("error", "Terjadi kesalahan pada sistem.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/ticket-categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        showNotification("success", "Kategori tiket berhasil dihapus!");
      } else {
        const err = await res.json();
        showNotification("error", err.error || "Gagal menghapus kategori tiket.");
      }
    } catch (error) {
      console.error("Gagal hapus:", error);
      showNotification("error", "Terjadi kesalahan pada sistem.");
    }
  };

  const filtered = categories
    .filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name?.localeCompare(b.name));

  const categoryToDelete = categories.find((c) => c.id === deleteId);

  return (
    <div>
      {/* TOAST NOTIFICATION UI */}
      {notification && (
        <div 
        className={`fixed bottom-8 right-8 z- px-5 py-3 border-4 border-black font-head tracking-wide text-sm shadow-[6px_6px_0_0_#000] transition-all animate-bounce ${
          notification.type === "success" ? "bg-[#a7c957] text-black" : "bg-[#e63946] text-white"
        }`}
        >
          {notification.type === "success" ? "✅ " : "⚠️ "} 
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <input 
          placeholder="Cari kategori..." 
          className="border-2 border-black px-3 py-2 bg-white text-sm outline-none focus:shadow-[3px_3px_0_0_#000] focus:bg-[#ffdb33] transition-all duration-150" 
          value={search} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} 
        />
        <div className="flex items-center gap-3">
          <span className="font-head text-[0.65rem] uppercase bg-[#ffdb33] border-2 border-black px-3 py-1.5">{filtered.length} kategori</span>
          {canManage && <TicketCategoryForm onSave={handleSave} />}
        </div>
      </div>

      <div className="border-2 border-black overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-[#ffdb33]">
            <tr>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] uppercase w-32">ID Kategori</th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] uppercase">Kategori</th>
              <th className="px-5 py-3 text-center font-head text-[0.6rem] uppercase">Quota</th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] uppercase">Harga</th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] uppercase">Event</th>
              {canManage && <th className="px-5 py-3 text-center font-head text-[0.6rem] uppercase w-44">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={canManage ? 6 : 5} className="py-10 text-center animate-pulse">Menghubungkan ke Neon...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={canManage ? 6 : 5} className="py-10 text-center text-gray-400">Tidak ada kategori ditemukan.</td></tr>
            ) : filtered.map((cat, i) => (
              <tr key={cat.id} className={`border-b-2 border-black ${i % 2 === 0 ? "bg-white" : "bg-[#f9f6ef]"} hover:bg-[#fff9d6]`}>
                <td className="px-5 py-3.5 font-mono text-xs text-gray-500 truncate max-w-[120px]" title={cat.id}>{cat.id}</td>
                <td className="px-5 py-3.5 font-semibold text-black">{cat.name}</td>
                <td className="px-5 py-3.5 text-center"><span className="bg-[#ffdb33] border-2 border-black px-2 py-0.5 text-[0.6rem] font-head">{cat.quota}</span></td>
                <td className="px-5 py-3.5 font-semibold">Rp {cat.price.toLocaleString("id-ID")}</td>
                <td className="px-5 py-3.5"><span className="border-2 border-black px-2 py-0.5 text-[0.6rem] font-head bg-white">{cat.event_name}</span></td>
                {canManage && (
                  <td className="px-5 py-3.5 text-center space-x-2">
                    <TicketCategoryForm category={cat} onSave={handleSave} />
                    <button onClick={() => setDeleteId(cat.id)} className="font-head text-[0.72rem] px-3 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:bg-[#e63946] hover:text-white transition-all cursor-pointer">Hapus</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] p-6 max-w-sm">
            <h2 className="font-head text-xl mb-2">Hapus Kategori?</h2>
            <p className="text-sm mb-6 text-gray-600">Yakin ingin menghapus kategori <span className="font-bold">{categoryToDelete?.name}</span>?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border-2 border-black bg-white cursor-pointer hover:bg-gray-100 transition-all">Batal</button>
              <button onClick={() => { handleDelete(deleteId); setDeleteId(null); }} className="flex-1 py-2 border-2 border-black bg-[#e63946] text-white cursor-pointer hover:bg-[#c1121f] transition-all">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}