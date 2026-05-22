"use client";

import { useState, useEffect } from "react";
import ArtistForm from "./ArtistForm";

export default function ArtistTable({ role }: { role?: string }) {
  const isAdmin = role === "admin";

  const [artists, setArtists] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE UNTUK NOTIFIKASI (Toast)
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  // FUNGSI UNTUK MENAMPILKAN NOTIFIKASI SELAMA 3 DETIK
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Ambil data dari API saat pertama kali load (Ditambah no-store anti-cache)
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch('/api/artists', { cache: 'no-store' });
        const data = await res.json();
        setArtists(data);
      } catch (error) {
        console.error("Gagal memuat artis:", error);
        showNotification("error", "Gagal memuat data dari server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/artists?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArtists(artists.filter((a) => a.id !== id));
        showNotification("success", "Artis berhasil dihapus!");
      } else {
        const err = await res.json();
        showNotification("error", err.error || "Gagal menghapus artis.");
      }
    } catch (error) {
      console.error("Gagal hapus:", error);
      showNotification("error", "Terjadi kesalahan pada sistem.");
    }
  };

  const handleSave = async (artistPayload: any) => {
    const isEdit = !!artistPayload.id;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/artists', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artistPayload),
      });

      if (res.ok) {
        const savedArtist = await res.json();
        if (isEdit) {
          setArtists(artists.map((a) => (a.id === savedArtist.id ? savedArtist : a)));
          showNotification("success", "Data artis berhasil diupdate!");
        } else {
          setArtists([...artists, savedArtist]);
          showNotification("success", "Artis baru berhasil ditambahkan!");
        }
      } else {
        const err = await res.json();
        showNotification("error", err.error || "Gagal menyimpan artis.");
      }
    } catch (error) {
      console.error("Gagal simpan:", error);
      showNotification("error", "Terjadi kesalahan pada sistem.");
    }
  };

  const filteredArtists = artists
    .filter((a) => a.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name?.localeCompare(b.name));

  const artistToDelete = artists.find((a) => a.id === deleteId);

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

      <div className="flex justify-between mb-5 flex-wrap gap-4">
        <input
          placeholder="Cari artist..."
          className="border-2 border-black px-3 py-2 bg-white text-black font-sans text-sm outline-none focus:shadow-[3px_3px_0_0_#000] focus:bg-[#ffdb33] transition-all duration-150"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        {isAdmin && <ArtistForm onSave={handleSave} />}
      </div>

      <table className="w-full border-2 border-black">
        <thead className="bg-black text-[#ffdb33]">
          <tr>
            <th className="p-3 text-left font-head tracking-wide w-32">ID Artis</th>
            <th className="p-3 text-left font-head tracking-wide">Nama</th>
            <th className="p-3 text-left font-head tracking-wide">Genre</th>
            {isAdmin && <th className="p-3 text-center font-head tracking-wide">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={isAdmin ? 4 : 3} className="p-10 text-center text-gray-500">Menghubungkan ke Neon Database...</td></tr>
          ) : filteredArtists.length === 0 ? (
            <tr><td colSpan={isAdmin ? 4 : 3} className="p-6 text-center text-gray-400">Tidak ada artis.</td></tr>
          ) : (
            filteredArtists.map((artist, i) => (
              <tr key={artist.id} className={`border-t-2 border-black transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#f9f6ef]"} hover:bg-[#fff9d6]`}>
                <td className="p-3 font-mono text-xs text-gray-500 truncate max-w-[120px]" title={artist.id}>
                  {artist.id}
                </td>
                <td className="p-3 font-sans text-sm font-semibold text-black">{artist.name}</td>
                <td className="p-3 font-sans text-sm text-gray-600">{artist.genre || <span className="italic text-gray-300">—</span>}</td>
                {isAdmin && (
                  <td className="p-3 text-center space-x-2">
                    <ArtistForm artist={artist} onSave={handleSave} />
                    <button onClick={() => setDeleteId(artist.id)} className="font-head text-xs px-3 py-1.5 border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:bg-[#e63946] hover:text-white transition-all cursor-pointer">Hapus</button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {deleteId && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm">
            <div className="h-[5px] bg-[#e63946] border-b-2 border-black" />
            <div className="p-6">
              <h2 className="font-head text-xl text-black mb-2">Hapus Artist?</h2>
              <p className="text-sm text-gray-600 mb-6">Yakin ingin menghapus <span className="font-bold">{artistToDelete?.name}</span>?</p>
              <div className="flex gap-2.5">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 transition-all cursor-pointer">Batal</button>
                <button onClick={() => { handleDelete(deleteId); setDeleteId(null); }} className="flex-1 py-2.5 border-2 border-black bg-[#e63946] text-white font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-[#c1121f] transition-all cursor-pointer">Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}