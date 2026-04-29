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
          className="border-2 border-black px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isAdmin && <ArtistForm onSave={handleSave} />}
      </div>

      {/* TABLE */}
      <table className="w-full border-2 border-black">
        <thead className="bg-black text-[#ffdb33]">
          <tr>
            <th className="p-3 text-left">Nama</th>
            <th className="p-3 text-left">Genre</th>
            {isAdmin && <th className="p-3 text-center">Aksi</th>}
          </tr>
        </thead>

        <tbody>
          {filteredArtists.map((artist) => (
            <tr key={artist.id} className="border-t-2 border-black">
              <td className="p-3">{artist.name}</td>
              <td className="p-3">{artist.genre}</td>

              {isAdmin && (
                <td className="p-3 text-center space-x-2">
                  <ArtistForm artist={artist} onSave={handleSave} />
                  <button onClick={() => setDeleteId(artist.id)}>
                    Hapus
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* DELETE MODAL */}
      {deleteId && isAdmin && (
        <div>
          <p>Hapus {artistToDelete?.name}?</p>
          <button onClick={() => setDeleteId(null)}>Batal</button>
          <button
            onClick={() => {
              handleDelete(deleteId);
              setDeleteId(null);
            }}
          >
            Ya
          </button>
        </div>
      )}
    </div>
  );
}