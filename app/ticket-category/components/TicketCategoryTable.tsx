"use client";

import { useState, useEffect } from "react";
import TicketCategoryForm from "./TicketCategoryForm";

export default function TicketCategoryTable({ role }: { role?: string }) {
  const canManage = role === "admin" || role === "organizer";

  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data dari API
  useEffect(() => {
    fetch('/api/ticket-categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async (payload: any) => {
    const isEdit = !!payload.id;
    const res = await fetch('/api/ticket-categories', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const saved = await res.json();
      // Refresh data agar JOIN event_name terupdate
      const refresh = await fetch('/api/ticket-categories');
      const newData = await refresh.json();
      setCategories(newData);
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/ticket-categories?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories(categories.filter((c) => c.id !== id));
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const filtered = categories
    .filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name?.localeCompare(b.name));

  const categoryToDelete = categories.find((c) => c.id === deleteId);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <input placeholder="Cari kategori..." className="border-2 border-black px-3 py-2 bg-white text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex items-center gap-3">
          <span className="font-head text-[0.65rem] uppercase bg-[#ffdb33] border-2 border-black px-3 py-1.5">{filtered.length} kategori</span>
          {canManage && <TicketCategoryForm onSave={handleSave} />}
        </div>
      </div>

      <div className="border-2 border-black overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-[#ffdb33]">
            <tr>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] uppercase">Kategori</th>
              <th className="px-5 py-3 text-center font-head text-[0.6rem] uppercase">Quota</th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] uppercase">Harga</th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] uppercase">Event</th>
              {canManage && <th className="px-5 py-3 text-center font-head text-[0.6rem] uppercase w-44">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-10 text-center animate-pulse">Menghubungkan ke Neon...</td></tr>
            ) : filtered.map((cat, i) => (
              <tr key={cat.id} className={`border-b-2 border-black ${i % 2 === 0 ? "bg-white" : "bg-[#f9f6ef]"} hover:bg-[#fff9d6]`}>
                <td className="px-5 py-3.5 font-semibold text-black">{cat.name}</td>
                <td className="px-5 py-3.5 text-center"><span className="bg-[#ffdb33] border-2 border-black px-2 py-0.5 text-[0.6rem] font-head">{cat.quota}</span></td>
                <td className="px-5 py-3.5 font-semibold">Rp {cat.price.toLocaleString("id-ID")}</td>
                <td className="px-5 py-3.5"><span className="border-2 border-black px-2 py-0.5 text-[0.6rem] font-head bg-white">{cat.event_name}</span></td>
                {canManage && (
                  <td className="px-5 py-3.5 text-center space-x-2">
                    <TicketCategoryForm category={cat} onSave={handleSave} />
                    <button onClick={() => setDeleteId(cat.id)} className="font-head text-[0.72rem] px-3 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:bg-[#e63946] hover:text-white transition-all">Hapus</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] p-6 max-w-sm">
            <h2 className="font-head text-xl mb-2">Hapus Kategori?</h2>
            <p className="text-sm mb-6 text-gray-600">Yakin ingin menghapus <span className="font-bold">{categoryToDelete?.name}</span>?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border-2 border-black bg-white">Batal</button>
              <button onClick={() => { handleDelete(deleteId); setDeleteId(null); }} className="flex-1 py-2 border-2 border-black bg-[#e63946] text-white">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}