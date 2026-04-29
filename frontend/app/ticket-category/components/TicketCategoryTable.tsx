"use client";

import { useState } from "react";
import TicketCategoryForm from "./TicketCategoryForm";

type Category = {
  id: string;
  name: string;
  quota: number;
  price: number;
  event: string;
};

const initialCategories: Category[] = [
  { id: "1", name: "VIP", quota: 100, price: 500000, event: "Concert A" },
  { id: "2", name: "Regular", quota: 200, price: 200000, event: "Concert B" },
];

export default function TicketCategoryTable({ role }: { role?: string }) {
  const canManage = role === "admin" || role === "organizer";

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleSave = (cat: Category) => {
    const exist = categories.find((c) => c.id === cat.id);
    if (exist) {
      setCategories(categories.map((c) => (c.id === cat.id ? cat : c)));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const filtered = categories
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const categoryToDelete = categories.find((c) => c.id === deleteId);

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
            placeholder="Cari kategori..."
            className="w-full pl-9 pr-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-150 focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="font-head text-[0.65rem] tracking-[0.08em] uppercase bg-[#ffdb33] border-2 border-black shadow-[2px_2px_0_0_#000] px-3 py-1.5">
            {filtered.length} kategori
          </span>

          {canManage && <TicketCategoryForm onSave={handleSave} />}
        </div>
      </div>

      {/* TABLE */}
      <div className="border-2 border-black overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-black">
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Kategori
              </th>
              <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Quota
              </th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Harga
              </th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Event
              </th>

              {canManage && (
                <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33] w-44">
                  Aksi
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {filtered.map((cat) => (
              <tr
                key={cat.id}
                className="border-b-2 border-black bg-white hover:bg-[#ffdb33] transition-colors duration-100 group"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-black bg-[#ffdb33] group-hover:bg-white flex items-center justify-center font-head text-sm text-black shadow-[2px_2px_0_0_#000]">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-black">{cat.name}</span>
                  </div>
                </td>

                <td className="px-5 py-3.5 text-center">
                  <span className="font-head text-[0.6rem] uppercase bg-[#ffdb33] border-2 border-black px-2.5 py-1">
                    {cat.quota.toLocaleString()}
                  </span>
                </td>

                <td className="px-5 py-3.5 font-semibold text-black">
                  Rp {cat.price.toLocaleString("id-ID")}
                </td>

                <td className="px-5 py-3.5">
                  <span className="font-head text-[0.6rem] uppercase bg-[#ffdb33] border-2 border-black px-2.5 py-1">
                    {cat.event}
                  </span>
                </td>

                {canManage && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <TicketCategoryForm category={cat} onSave={handleSave} />

                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="font-head text-[0.72rem] px-3 py-1.5 border-2 border-[#e63946] bg-white text-[#e63946] shadow-[2px_2px_0_0_#e63946] hover:bg-[#e63946] hover:text-white"
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
                <td colSpan={5} className="py-14 text-center">
                  Tidak ada kategori ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DELETE */}
      {deleteId && canManage && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div className="bg-white border-2 border-black p-6">
            <h2>Hapus Kategori</h2>
            <p>{categoryToDelete?.name}</p>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setDeleteId(null)}>Batal</button>
              <button
                onClick={() => {
                  handleDelete(deleteId);
                  setDeleteId(null);
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}