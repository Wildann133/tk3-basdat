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

export default function TicketCategoryTable() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "VIP", quota: 100, price: 500000, event: "Concert A" },
    { id: "2", name: "Regular", quota: 200, price: 200000, event: "Concert B" },
  ]);

  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const role = "admin";

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
      <div className="flex items-center justify-between gap-4 mb-6">

        {/* Search — */}
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19A8 8 0 1 1 11 3a8 8 0 0 1 0 16z" />
          </svg>
          <input
            placeholder="Cari kategori..."
            className="
              w-full pl-10 pr-4 py-2.5
              bg-orange-50 border border-orange-200
              rounded-2xl text-sm text-gray-700
              placeholder:text-orange-300
              focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400
              transition-all duration-200
            "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Right side — */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
            {filtered.length} kategori
          </span>

          {role === "admin" && (
            <div className="[&>button]:bg-orange-500 [&>button]:hover:bg-orange-600 [&>button]:text-white [&>button]:font-semibold [&>button]:text-sm [&>button]:px-4 [&>button]:py-2 [&>button]:rounded-2xl [&>button]:transition-all [&>button]:duration-200 [&>button]:shadow-[0_2px_12px_rgba(234,88,12,0.25)] [&>button]:hover:shadow-[0_4px_20px_rgba(234,88,12,0.35)]">
              <TicketCategoryForm onSave={handleSave} />
            </div>
          )}
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="rounded-2xl overflow-hidden border border-orange-100">
        <table className="w-full text-sm">

          {/* HEAD */}
          <thead>
            <tr className="bg-orange-500">
              <th className="px-5 py-3.5 text-left text-xs font-bold text-white tracking-widest uppercase">
                Kategori
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-bold text-white tracking-widest uppercase">
                Quota
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-white tracking-widest uppercase">
                Harga
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-white tracking-widest uppercase">
                Event
              </th>
              {role === "admin" && (
                <th className="px-5 py-3.5 text-center text-xs font-bold text-white tracking-widest uppercase w-40">
                  Aksi
                </th>
              )}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-orange-50">
            {filtered.map((cat) => (
              <tr
                key={cat.id}
                className="group bg-white hover:bg-orange-50/70 transition-colors duration-150"
              >
                {/* Name + avatar — */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                      {cat.name}
                    </span>
                  </div>
                </td>

                {/* Quota — badge style */}
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold tabular-nums">
                    {cat.quota.toLocaleString()}
                  </span>
                </td>

                {/* Price */}
                <td className="px-5 py-4 font-semibold text-gray-800 tabular-nums">
                  Rp {cat.price.toLocaleString("id-ID")}
                </td>

                {/* Event — pill identik genre ArtistTable */}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium">
                    {cat.event}
                  </span>
                </td>

                {/* Actions — */}
                {role === "admin" && (
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="
                        [&>button]:px-3 [&>button]:py-1.5 [&>button]:rounded-xl
                        [&>button]:text-orange-500 [&>button]:border [&>button]:border-orange-300
                        [&>button]:text-xs [&>button]:font-semibold
                        [&>button]:hover:bg-orange-500 [&>button]:hover:text-white [&>button]:hover:border-orange-500
                        [&>button]:transition-all [&>button]:duration-150
                      ">
                        <TicketCategoryForm category={cat} onSave={handleSave} />
                      </div>

                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="
                          px-3 py-1.5 rounded-xl text-xs font-semibold
                          text-red-400 border border-red-200
                          hover:bg-red-500 hover:text-white hover:border-red-500
                          transition-all duration-150
                        "
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {/* EMPTY STATE — */}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium text-sm">Tidak ada kategori ditemukan</p>
                      <p className="text-gray-400 text-xs mt-0.5">Coba kata kunci lain atau tambah kategori baru</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL — */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 px-4">
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
            style={{ animation: "modalIn 0.2s ease" }}
          >
            <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400" />

            <div className="p-7">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Hapus Kategori
              </h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Yakin ingin menghapus{" "}
                <span className="font-semibold text-gray-800">
                  {categoryToDelete?.name}
                </span>
                ? Tindakan ini tidak bisa dibatalkan.
              </p>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setDeleteId(null)}
                  className="
                    flex-1 py-2.5 rounded-xl text-sm font-semibold
                    text-gray-500 border border-gray-200
                    hover:bg-gray-50 transition-all duration-150
                  "
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    handleDelete(deleteId);
                    setDeleteId(null);
                  }}
                  className="
                    flex-1 py-2.5 rounded-xl text-sm font-semibold
                    bg-red-500 text-white
                    hover:bg-red-600 transition-all duration-150
                    shadow-[0_2px_12px_rgba(239,68,68,0.3)]
                  "
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.94) translateY(8px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}