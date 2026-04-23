"use client";

import { useState } from "react";

export default function ArtistForm({ artist, onSave }: any) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState(artist?.name || "");
  const [genre, setGenre] = useState(artist?.genre || "");

  const handleSubmit = () => {
    if (!name) {
      alert("Nama artist wajib diisi!");
      return;
    }

    onSave({
      id: artist?.id || Date.now().toString(),
      name,
      genre,
    });

    setOpen(false);
    setName("");
    setGenre("");
  };

  return (
    <>
      {/* BUTTON (samain) */}
      <button
        onClick={() => setOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm"
      >
        {artist ? "Update" : "+ Tambah"}
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-3xl w-80 shadow-xl">

            {/* TITLE */}
            <h2 className="text-xl font-semibold text-orange-500 mb-4">
              {artist ? "Update Artist" : "Tambah Artist"}
            </h2>

            {/* FORM */}
            <div className="space-y-4">

              {/* NAME */}
              <div>
                <label className="text-sm text-gray-600">
                  Nama Artist
                </label>
                <input
                  className="
                    w-full mt-1 px-3 py-2.5
                    border border-orange-200
                    rounded-xl
                    bg-white
                    text-gray-800
                    placeholder:text-gray-400
                    focus:outline-none
                    focus:ring-2 focus:ring-orange-400
                  "
                  placeholder="Contoh: NIKI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* GENRE */}
              <div>
                <label className="text-sm text-gray-600">
                  Genre
                </label>
                <input
                  className="
                    w-full mt-1 px-3 py-2.5
                    border border-orange-200
                    rounded-xl
                    bg-white
                    text-gray-800
                    placeholder:text-gray-400
                    focus:outline-none
                    focus:ring-2 focus:ring-orange-400
                  "
                  placeholder="Contoh: Pop, Rock"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </div>

            </div>

            {/* ACTION */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                Batal
              </button>

              <button
                onClick={handleSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl shadow-sm"
              >
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}