"use client";

import { useState } from "react";

export default function ArtistForm({ artist, onSave }: any) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(artist?.name || "");
  const [genre, setGenre] = useState(artist?.genre || "");
  const [nameError, setNameError] = useState(false);

  const handleOpen = () => {
    setName(artist?.name || "");
    setGenre(artist?.genre || "");
    setNameError(false);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onSave({
      id: artist?.id || Date.now().toString(),
      name: name.trim(),
      genre: genre.trim(),
    });
    setOpen(false);
    setName("");
    setGenre("");
    setNameError(false);
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={handleOpen}
        className={
          artist
            ? // Edit ghost button
              "font-head text-xs px-3 py-1.5 border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:bg-[#ffdb33] hover:translate-y-px hover:shadow-[1px_1px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
            : // Add primary button
              "font-head text-sm px-4 py-2 border-2 border-black bg-[#ffdb33] text-black shadow-[4px_4px_0_0_#000] hover:bg-[#ffcc00] hover:translate-y-px hover:shadow-[3px_3px_0_0_#000] active:translate-y-1 active:shadow-none transition-all duration-100 cursor-pointer"
        }
      >
        {artist ? "Update" : "+ Tambah"}
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div
            className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm"
            style={{ animation: "modalIn .18s ease" }}
          >
            {/* Top accent bar */}
            <div className="h-[5px] bg-[#ffdb33] border-b-2 border-black" />

            <div className="p-6">
              {/* Title */}
              <h2 className="font-head text-xl text-black mb-4">
                {artist ? "Update Artist" : "Tambah Artist"}
              </h2>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Nama Artist
                  </label>
                  <input
                    className={`w-full px-3 py-2.5 border-2 bg-[#f9f6ef] text-black font-sans text-sm placeholder:text-gray-400 outline-none transition-all duration-150
                      focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]
                      ${nameError ? "border-red-500 shadow-[3px_3px_0_0_#e63946]" : "border-black"}`}
                    placeholder="Contoh: NIKI"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (e.target.value.trim()) setNameError(false);
                    }}
                  />
                  {nameError && (
                    <p className="text-[0.7rem] text-red-500 font-semibold mt-1">
                      Nama artist wajib diisi!
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-head text-[0.6rem] tracking-[0.1em] uppercase block mb-1 text-black">
                    Genre
                  </label>
                  <input
                    className="w-full px-3 py-2.5 border-2 border-black bg-[#f9f6ef] text-black font-sans text-sm placeholder:text-gray-400 outline-none transition-all duration-150
                      focus:bg-[#ffdb33] focus:shadow-[3px_3px_0_0_#000]"
                    placeholder="Contoh: Pop, Rock"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 border-2 border-black bg-white text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-gray-100 hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 border-2 border-black bg-[#ffdb33] text-black font-head text-xs shadow-[3px_3px_0_0_#000] hover:bg-[#ffcc00] hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-100 cursor-pointer"
                >
                  Simpan
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
    </>
  );
}