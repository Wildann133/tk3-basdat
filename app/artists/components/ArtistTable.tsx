"use client";

import { useState } from "react";
import { initialArtists } from "@/lib/dummyData";
import ArtistForm from "./ArtistForm";

export default function ArtistTable({ role }: { role?: string }) {
  const isAdmin = role === "admin";

  const [artists, setArtists] = useState(initialArtists);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      <div className="flex justify-between mb-5 flex-wrap gap-4">
        <input
          placeholder="Cari artist..."
          className="border-2 border-black px-3 py-2 bg-white text-black font-sans text-sm outline-none focus:shadow-[3px_3px_0_0_#000] focus:bg-[#ffdb33] transition-all duration-150"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isAdmin && <ArtistForm onSave={handleSave} />}
      </div>

      {/* TABLE */}
      <table className="w-full border-2 border-black">
        <thead className="bg-black text-[#ffdb33]">
          <tr>
            <th className="p-3 text-left font-head tracking-wide">Nama</th>
            <th className="p-3 text-left font-head tracking-wide">Genre</th>
            {isAdmin && (
              <th className="p-3 text-center font-head tracking-wide">Aksi</th>
            )}
          </tr>
        </thead>

        <tbody>
          {filteredArtists.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 3 : 2}
                className="p-6 text-center text-gray-400 font-sans text-sm"
              >
                Tidak ada artist ditemukan.
              </td>
            </tr>
          ) : (
            filteredArtists.map((artist, i) => (
              <tr
                key={artist.id}
                className={`border-t-2 border-black transition-colors duration-100 ${
                  i % 2 === 0 ? "bg-white" : "bg-[#f9f6ef]"
                } hover:bg-[#fff9d6]`}
              >
                <td className="p-3 font-sans text-sm font-semibold text-black">
                  {artist.name}
                </td>
                <td className="p-3 font-sans text-sm text-gray-600">
                  {artist.genre || (
                    <span className="italic text-gray-300">—</span>
                  )}
                </td>

                {isAdmin && (
                  <td className="p-3 text-center space-x-2">
                    <ArtistForm artist={artist} onSave={handleSave} />
                    <button
                      onClick={() => setDeleteId(artist.id)}
                      className="font-head text-xs px-3 py-1.5 border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:bg-[#e63946] hover:text-white hover:translate-y-px hover:shadow-[1px_1px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* DELETE MODAL */}
      {deleteId && isAdmin && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div
            className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm"
            style={{ animation: "modalIn .18s ease" }}
          >
            {/* Top accent bar — merah untuk danger */}
            <div className="h-[5px] bg-[#e63946] border-b-2 border-black" />

            <div className="p-6">
              <h2 className="font-head text-xl text-black mb-2">
                Hapus Artist?
              </h2>
              <p className="text-sm text-gray-600 mb-6 font-sans">
                Kamu yakin ingin menghapus{" "}
                <span className="font-bold text-black">
                  {artistToDelete?.name}
                </span>
                ? Tindakan ini tidak bisa dibatalkan.
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