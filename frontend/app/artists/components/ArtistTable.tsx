"use client";

import { useState } from "react";
import { initialArtists } from "@/lib/dummyData";
import ArtistForm from "./ArtistForm";

export default function ArtistTable() {
  const [artists, setArtists] = useState(initialArtists);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const role = "admin";

  const handleDelete = (id: string) => {
    setArtists(artists.filter((a) => a.id !== id));
  };

  const handleSave = (artist: any) => {
    const exist = artists.find((a) => a.id === artist.id);
    if (exist) {
      setArtists(artists.map((a) => (a.id === artist.id ? artist : a)));
    } else {
      setArtists([...artists, artist]);
    }
  };

  const filteredArtists = artists
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const artistToDelete = artists.find((a) => a.id === deleteId);

  return (
    <div>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between gap-4 mb-6">

        {/* Search — pill style */}
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19A8 8 0 1 1 11 3a8 8 0 0 1 0 16z" />
          </svg>
          <input
            placeholder="Cari artist..."
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

        {/* Right side: count badge + create button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
            {filteredArtists.length} artist
          </span>

          {role === "admin" && (
            <div className="[&>button]:bg-orange-500 [&>button]:hover:bg-orange-600 [&>button]:text-white [&>button]:font-semibold [&>button]:text-sm [&>button]:px-4 [&>button]:py-2 [&>button]:rounded-2xl [&>button]:transition-all [&>button]:duration-200 [&>button]:shadow-[0_2px_12px_rgba(234,88,12,0.25)] [&>button]:hover:shadow-[0_4px_20px_rgba(234,88,12,0.35)]">
              <ArtistForm onSave={handleSave} />
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
                Nama Artist
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-white tracking-widest uppercase">
                Genre
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
            {filteredArtists.map((artist, i) => (
              <tr
                key={artist.id}
                className="group bg-white hover:bg-orange-50/70 transition-colors duration-150"
              >
                {/* Name with subtle index */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar circle */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                      {artist.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                      {artist.name}
                    </span>
                  </div>
                </td>

                {/* Genre pill */}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium">
                    {artist.genre}
                  </span>
                </td>

                {/* Actions */}
                {role === "admin" && (
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Edit — ghost orange */}
                      <div className="
                        [&>button]:px-3 [&>button]:py-1.5 [&>button]:rounded-xl
                        [&>button]:text-orange-500 [&>button]:border [&>button]:border-orange-300
                        [&>button]:text-xs [&>button]:font-semibold
                        [&>button]:hover:bg-orange-500 [&>button]:hover:text-white [&>button]:hover:border-orange-500
                        [&>button]:transition-all [&>button]:duration-150
                      ">
                        <ArtistForm artist={artist} onSave={handleSave} />
                      </div>

                      {/* Delete — ghost red */}
                      <button
                        onClick={() => setDeleteId(artist.id)}
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

            {/* EMPTY STATE */}
            {filteredArtists.length === 0 && (
              <tr>
                <td colSpan={3} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium text-sm">Tidak ada artist ditemukan</p>
                      <p className="text-gray-400 text-xs mt-0.5">Coba kata kunci lain atau tambah artist baru</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DELETE */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 px-4">
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
            style={{ animation: "modalIn 0.2s ease" }}
          >
            {/* Modal top accent */}
            <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400" />

            <div className="p-7">
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Hapus Artist
              </h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Yakin ingin menghapus{" "}
                <span className="font-semibold text-gray-800">
                  {artistToDelete?.name}
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