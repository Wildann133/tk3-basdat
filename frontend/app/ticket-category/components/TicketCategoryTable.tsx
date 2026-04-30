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
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">Kategori</th>
              <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">Quota</th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">Harga</th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">Event</th>
              {canManage && (
                <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33] w-44">Aksi</th>
              )}
            </tr>
          </thead>

          <tbody>
            {filtered.map((cat, i) => (
              <tr
                key={cat.id}
                className={`border-b-2 border-black transition-colors duration-100 group ${
                  i % 2 === 0 ? "bg-white" : "bg-[#f9f6ef]"
                } hover:bg-[#fff9d6]`}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-black bg-[#ffdb33] group-hover:bg-white flex items-center justify-center font-head text-sm text-black shadow-[2px_2px_0_0_#000] shrink-0">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-black">{cat.name}</span>
                  </div>
                </td>

                <td className="px-5 py-3.5 text-center">
                  <span className="font-head text-[0.6rem] uppercase bg-[#ffdb33] border-2 border-black px-2.5 py-1 group-hover:bg-white transition-colors duration-100">
                    {cat.quota.toLocaleString()}
                  </span>
                </td>

                <td className="px-5 py-3.5 font-semibold text-black">
                  Rp {cat.price.toLocaleString("id-ID")}
                </td>

                <td className="px-5 py-3.5">
                  <span className="font-head text-[0.6rem] uppercase bg-[#ffdb33] border-2 border-black px-2.5 py-1 group-hover:bg-white transition-colors duration-100">
                    {cat.event}
                  </span>
                </td>

                {canManage && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <TicketCategoryForm category={cat} onSave={handleSave} />
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="font-head text-[0.72rem] px-3 py-1.5 border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:bg-[#e63946] hover:text-white hover:translate-y-px hover:shadow-[1px_1px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
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
                <td colSpan={canManage ? 5 : 4} className="py-14 text-center text-gray-400 font-sans text-sm">
                  Tidak ada kategori ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL */}
      {deleteId && canManage && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div
            className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm"
            style={{ animation: "modalIn .18s ease" }}
          >
            {/* Accent bar merah */}
            <div className="h-[5px] bg-[#e63946] border-b-2 border-black" />

            <div className="p-6">
              <h2 className="font-head text-xl text-black mb-2">
                Hapus Kategori?
              </h2>
              <p className="text-sm text-gray-600 mb-1 font-sans">
                Kamu yakin ingin menghapus kategori{" "}
                <span className="font-bold text-black">
                  {categoryToDelete?.name}
                </span>{" "}
                dari event{" "}
                <span className="font-bold text-black">
                  {categoryToDelete?.event}
                </span>
                ?
              </p>
              <p className="text-xs text-gray-400 font-sans mb-6">
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    handleDelete(deleteId);
                    setDeleteId(null);
                  }}
                  className="flex-1 py-2.5 border-2 border-black bg-[#e63946] text-white font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-[#c1121f] hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Ya, Hapus
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