import ArtistTable from "./components/ArtistTable";
import { Mic2, Users, Star } from "lucide-react";

export default function ArtistsPage() {
  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 min-h-full w-full">
      
      {/* HEADER BENTO: 2 COLUMNS ON DESKTOP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Welcome Card */}
        <div className="col-span-1 md:col-span-2 bg-[#ffdb33] text-black p-6 md:p-10 rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Icon Background */}
          <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
            <Star size={250} />
          </div>
          
          <div className="relative z-10 mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest border-2 border-black inline-block px-3 py-1 bg-white mb-4 shadow-[2px_2px_0_0_#000]">
              Direktori Artis
            </h2>
            <h1 className="text-4xl md:text-6xl font-head tracking-tighter mb-4 leading-none">
              Kelola Bintang <br /> Tamu Eventmu!
            </h1>
            <p className="text-lg font-bold opacity-80 max-w-xl bg-white/50 inline-block p-2 border-2 border-black">
              Temukan, atur, dan hubungkan artis dengan event yang tepat.
            </p>
          </div>
        </div>

        {/* STAT HIGHLIGHT BENTO */}
        <div className="col-span-1 bg-black text-white p-6 md:p-10 rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col justify-center items-center text-center relative overflow-hidden group hover:bg-zinc-900 transition-colors">
          <div className="absolute top-4 right-4 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-300">
            <Mic2 size={64} className="text-[#ffdb33]" />
          </div>
          <h3 className="text-7xl md:text-8xl font-black font-head text-[#ffdb33] drop-shadow-[3px_3px_0_#fff]">
            ∞
          </h3>
          <p className="text-sm font-extrabold uppercase mt-2 border-t-4 border-[#ffdb33] pt-2 text-white">
            Total Artis <br /> Terdaftar
          </p>
        </div>
      </div>

      {/* MAIN TABLE BENTO */}
      <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] overflow-hidden">
        {/* Table Card Header */}
        <div className="bg-black text-white p-6 flex justify-between items-center border-b-4 border-black">
          <div>
            <h2 className="text-2xl font-bold font-head tracking-wide flex items-center gap-3">
              <Users size={28} className="text-[#ffdb33]" /> 
              Daftar Artis
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Manajemen data artis dan genre musik</p>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6 md:p-8 bg-[#f9f6ef]">
          <ArtistTable />
        </div>
      </div>

    </div>
  );
}