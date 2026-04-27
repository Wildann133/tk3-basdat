import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/retroui/Card";
import { Users, Calendar, TrendingUp, TicketPercent, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { ADMIN_STATS } from "@/lib/dummyData";

export default function AdminDashboard() {
  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 min-h-full">
      {/* HEADER: Bento Full Width */}
      <div className="bg-primary text-black p-8 rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest border-2 border-black rounded-full mb-3">Administrator</span>
          <h1 className="text-4xl md:text-5xl font-head tracking-tighter mb-2 leading-none">System Console</h1>
          <p className="text-black/80 font-medium text-lg">Pantau dan kelola seluruh aktivitas platform TikTakTuk</p>
        </div>
        <Button className="bg-white text-black hover:bg-zinc-100 border-4 border-black font-bold text-lg px-8 py-6 rounded-xl shadow-[4px_4px_0_0_#000] transition-transform hover:-translate-y-1">
          Buka Promosi
        </Button>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* STAT 1: SMALL BENTO BLOCK */}
        <Card className="col-span-1 bg-accent border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:-translate-y-1 transition-transform">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="p-3 bg-black text-white rounded-full w-fit mb-4 border-2 border-black">
              <Users size={28} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-black/60 mb-1 uppercase tracking-widest">Total Pengguna</p>
              <h2 className="text-4xl font-head font-bold mb-1">{ADMIN_STATS.totalUsers.toLocaleString()}</h2>
              <p className="text-sm font-bold text-black/70 flex items-center gap-1"><CheckCircle2 size={16} /> Aktif di sistem</p>
            </div>
          </CardContent>
        </Card>

        {/* DETAILS 1: LARGE TALL BENTO BLOCK */}
        <Card className="col-span-1 md:col-span-2 row-span-2 bg-secondary text-white border-4 border-black shadow-[8px_8px_0_0_#000]">
          <CardHeader className="flex flex-row items-center justify-between border-b-4 border-black pb-4 bg-zinc-900 rounded-t-lg">
            <CardTitle className="text-2xl font-head tracking-wide text-white">Infrastruktur Venue</CardTitle>
            <div className="bg-primary p-2 rounded-full text-black border-2 border-black"><ArrowUpRight size={24} /></div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 flex flex-col justify-between h-[calc(100%-80px)]">
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-zinc-700 pb-3">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Total Venue Terdaftar</span>
                <span className="text-3xl font-head text-primary">{ADMIN_STATS.venues} Lokasi</span>
              </div>
              <div className="flex justify-between items-end border-b border-zinc-700 pb-3">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Reserved Seating</span>
                <span className="text-3xl font-head text-white">2 Venue</span>
              </div>
              <div className="flex justify-between items-end border-b border-zinc-700 pb-3">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Kapasitas Terbesar</span>
                <span className="text-3xl font-head text-white">1,000 Kursi</span>
              </div>
            </div>
            <Button className="w-full mt-8 bg-primary text-black hover:bg-primary-hover border-4 border-black rounded-xl text-lg tracking-wide shadow-[4px_4px_0_0_#000]">
              Kelola Venue Sekarang
            </Button>
          </CardContent>
        </Card>

        {/* STAT 2: SMALL BENTO BLOCK */}
        <Card className="col-span-1 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:-translate-y-1 transition-transform">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="p-3 bg-primary text-black rounded-full w-fit mb-4 border-2 border-black">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-zinc-500 mb-1 uppercase tracking-widest">Total Acara</p>
              <h2 className="text-4xl font-head font-bold mb-1">{ADMIN_STATS.totalEvents.toLocaleString()}</h2>
              <p className="text-sm font-bold text-zinc-500">Tercatat Bulan Ini</p>
            </div>
          </CardContent>
        </Card>

        {/* STAT 3: WIDE BENTO BLOCK */}
        <Card className="col-span-1 md:col-span-2 bg-[#ff6b6b] text-black border-4 border-black shadow-[4px_4px_0_0_#000] relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-30 text-white">
            <TrendingUp size={150} strokeWidth={3} />
          </div>
          <CardContent className="p-6 relative z-10 h-full flex flex-col justify-center">
            <p className="text-sm font-extrabold text-black/70 mb-1 uppercase tracking-widest">Omzet Platform</p>
            <h2 className="text-5xl md:text-6xl font-head font-black tracking-tighter mb-1 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{ADMIN_STATS.omzetPlatform}</h2>
            <p className="text-md font-bold bg-black text-white w-fit px-3 py-1 rounded-sm mt-2">Gross volume</p>
          </CardContent>
        </Card>

        {/* DETAILS 2 & STAT 4: SPLIT BENTO */}
        <Card className="col-span-1 md:col-span-2 row-span-1 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] flex flex-col md:flex-row group">
           <div className="p-6 md:w-1/3 bg-zinc-100 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-center items-center text-center">
             <div className="p-4 bg-primary rounded-2xl border-4 border-black mb-4 group-hover:rotate-12 transition-transform">
               <TicketPercent size={36} />
             </div>
             <h2 className="text-4xl font-head font-bold">{ADMIN_STATS.activePromotions}</h2>
             <p className="text-xs font-extrabold text-zinc-500 uppercase">Promo Aktif</p>
           </div>
           <div className="p-6 md:w-2/3 flex flex-col justify-between">
              <div>
                <h3 className="font-head text-xl mb-4 border-b-2 border-black pb-2 inline-block">Marketing Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Promo Persentase</p>
                    <p className="text-xl font-black">1 Aktif</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Promo Nominal</p>
                    <p className="text-xl font-black">1 Aktif</p>
                  </div>
                  <div className="col-span-2 mt-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase">Total Penggunaan</p>
                    <p className="text-2xl font-black text-primary drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">57 Kali</p>
                  </div>
                </div>
              </div>
           </div>
        </Card>

      </div>
    </div>
  );
}
