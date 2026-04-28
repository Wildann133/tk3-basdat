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
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-black"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19A8 8 0 1 1 11 3a8 8 0 0 1 0 16z" />
          </svg>
          <input
            placeholder="Cari artist..."
            className="
              w-full pl-9 pr-3 py-2.5
              border-2 border-black bg-[#f9f6ef]
              text-sm text-black placeholder:text-gray-400
              outline-none transition-all duration-150
              focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]
            "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="font-head text-[0.65rem] tracking-[0.08em] uppercase bg-[#ffdb33] border-2 border-black shadow-[2px_2px_0_0_#000] px-3 py-1.5">
            {filteredArtists.length} artist
          </span>

          {role === "admin" && (
            <ArtistForm onSave={handleSave} />
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="border-2 border-black overflow-hidden">
        <table className="w-full text-sm border-collapse">

          {/* HEAD */}
          <thead>
            <tr className="bg-black">
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Nama Artist
              </th>
              <th className="px-5 py-3 text-left font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33]">
                Genre
              </th>
              {role === "admin" && (
                <th className="px-5 py-3 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-[#ffdb33] w-44">
                  Aksi
                </th>
              )}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {filteredArtists.map((artist) => (
              <tr
                key={artist.id}
                className="border-b-2 border-black bg-white hover:bg-[#ffdb33] transition-colors duration-100 group"
              >
                {/* Name */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-black bg-[#ffdb33] group-hover:bg-white flex items-center justify-center font-head text-sm text-black flex-shrink-0 shadow-[2px_2px_0_0_#000] transition-colors duration-100">
                      {artist.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-black">
                      {artist.name}
                    </span>
                  </div>
                </td>

                {/* Genre */}
                <td className="px-5 py-3.5">
                  <span className="font-head text-[0.6rem] tracking-[0.08em] uppercase bg-[#ffdb33] border-2 border-black shadow-[2px_2px_0_0_#000] px-2.5 py-1 group-hover:bg-white transition-colors duration-100">
                    {artist.genre || "—"}
                  </span>
                </td>

                {/* Actions */}
                {role === "admin" && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <ArtistForm artist={artist} onSave={handleSave} />

                      <button
                        onClick={() => setDeleteId(artist.id)}
                        className="font-head text-[0.72rem] px-3 py-1.5 border-2 border-[#e63946] bg-white text-[#e63946] shadow-[2px_2px_0_0_#e63946] hover:bg-[#e63946] hover:text-white hover:translate-y-px hover:shadow-[1px_1px_0_0_#e63946] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
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
                <td colSpan={3} className="py-14 text-center">
                  <p className="font-head text-base text-black">Tidak ada artist ditemukan</p>
                  <p className="text-xs text-gray-500 mt-1">Coba kata kunci lain atau tambah artist baru</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DELETE */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div
            className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm"
            style={{ animation: "modalIn 0.18s ease" }}
          >
            {/* Top accent — red for danger */}
            <div className="h-[5px] bg-[#e63946] border-b-2 border-black" />

            <div className="p-6">
              {/* Icon */}
              <div className="w-10 h-10 bg-[#e63946] border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center mb-4">
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24"
                  stroke="white" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                </svg>
              </div>

              <h2 className="font-head text-xl text-black mb-1">Hapus Artist</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-0">
                Yakin ingin menghapus{" "}
                <span className="font-semibold text-black">{artistToDelete?.name}</span>?{" "}
                Tindakan ini tidak bisa dibatalkan.
              </p>

              <div className="flex gap-2.5 mt-6">
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
                  className="flex-1 py-2.5 border-2 border-[#e63946] bg-[#e63946] text-white font-head text-xs shadow-[3px_3px_0_0_#e63946] hover:opacity-90 hover:translate-y-px hover:shadow-[2px_2px_0_0_#e63946] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
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