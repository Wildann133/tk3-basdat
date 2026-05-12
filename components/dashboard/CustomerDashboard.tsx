import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Ticket, Calendar, Tag, Music, MapPin, CalendarDays, Search, Link as LinkIcon } from "lucide-react";
import { CUSTOMER_STATS, EVENTS } from "@/lib/dummyData";

export default function CustomerDashboard() {
  const upcomingEvents = EVENTS.slice(3, 5); // Just taking an arbitrary slice for "upcoming" UI

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 min-h-full">
      {/* HEADER BENTO: 2 COLUMNS ON DESKTOP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-primary text-black p-6 md:p-10 rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col justify-between">
          <div className="mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest border-2 border-black inline-block px-3 py-1 bg-white mb-4 shadow-[2px_2px_0_0_#000]">Customer Portal</h2>
            <h1 className="text-4xl md:text-5xl font-head tracking-tighter mb-2">Welcome Back, Budi Santoso!</h1>
            <p className="text-lg font-medium opacity-80">Ada {CUSTOMER_STATS.availablePromos} acara menarik yang menunggu Anda.</p>
          </div>
          <Link href="/events">
            <Button className="w-fit bg-black text-white hover:bg-zinc-800 border-4 border-black font-bold text-lg px-8 py-6 rounded-xl shadow-[4px_4px_0_0_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              Cari Tiket & Acara
            </Button>
          </Link>
          
        </div>

        {/* PROMO HIGHLIGHT BENTO */}
        <div className="col-span-1 bg-accent text-black p-6 md:p-10 rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col justify-center items-center text-center relative overflow-hidden group hover:bg-white transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
            <Tag size={64} className="text-primary drop-shadow-[2px_2px_0_#000]" />
          </div>
          <h3 className="text-6xl font-black font-head">{CUSTOMER_STATS.availablePromos}</h3>
          <p className="text-sm font-extrabold uppercase mt-2 border-t-4 border-black pt-2">Kode Promo<br/>Tersedia</p>
        </div>
      </div>

      {/* DASHBOARD STATS BENTO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:bg-zinc-100 transition-colors">
          <CardContent className="p-4 md:p-6 text-center flex flex-col items-center">
            <div className="p-3 bg-primary text-black border-4 border-black shadow-[2px_2px_0_0_#000] rounded-lg mb-4">
              <Ticket size={28} />
            </div>
            <h2 className="text-3xl md:text-4xl font-head font-bold">{CUSTOMER_STATS.activeTickets}</h2>
            <p className="text-xs font-black uppercase text-zinc-600 mt-1">Tiket Aktif</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:bg-zinc-100 transition-colors">
          <CardContent className="p-4 md:p-6 text-center flex flex-col items-center">
            <div className="p-3 bg-secondary text-primary border-4 border-black shadow-[2px_2px_0_0_#000] rounded-lg mb-4">
              <Calendar size={28} />
            </div>
            <h2 className="text-3xl md:text-4xl font-head font-bold">{CUSTOMER_STATS.eventsAttended}</h2>
            <p className="text-xs font-black uppercase text-zinc-600 mt-1">Acara Diikuti</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 bg-[#ffdb33] border-4 border-black shadow-[6px_6px_0_0_#000] overflow-hidden relative">
          <div className="absolute -left-4 top-4 text-black/10">
            <Music size={100} />
          </div>
          <CardContent className="p-6 md:p-8 flex items-center justify-end h-full relative z-10 text-right">
             <div>
                <p className="text-sm font-black uppercase mb-1">Total Belanja Bulan Ini</p>
                <h2 className="text-4xl md:text-5xl font-head font-black tracking-tighter drop-shadow-[2px_2px_0_#fff]">{CUSTOMER_STATS.totalSpent}</h2>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* UPCOMING TICKETS BENTO */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000]">
        <CardContent className="p-0">
          <div className="bg-black text-white p-6 flex justify-between items-center border-b-4 border-black">
            <div>
              <h2 className="text-2xl font-bold font-head tracking-wide">Tiket Mendatang</h2>
              <p className="text-sm text-zinc-400">Tiket pertunjukan yang siap Anda nikmati</p>
            </div>
            <Link href="/my-tickets">
            <Button variant="outline" className="bg-white text-black hover:bg-primary border-2 border-black font-bold">
              Lihat Semua
            </Button>
            </Link>
          </div>

          <div className="p-6 space-y-4 bg-zinc-50">
            {upcomingEvents.map((event, idx) => (
              <div key={idx} className="flex flex-col md:flex-row justify-between md:items-center bg-white border-4 border-black p-5 shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-transform">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-head text-xl font-bold">{event.event_title}</h3>
                    <span className="text-[10px] font-black bg-primary text-black border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_0_#000]">{idx === 0 ? "VVIP" : "GENERAL"}</span>
                  </div>
                  <div className="flex items-center text-sm font-bold text-zinc-600 gap-4">
                    <span className="flex items-center"><CalendarDays size={16} className="mr-2 text-black"/> {new Date(event.event_datetime).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="flex items-center hidden md:flex"><MapPin size={16} className="mr-2 text-black"/> Lokasi ID: {event.venue_id}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button className="bg-secondary text-white hover:bg-black border-2 border-transparent">
                    E-Ticket
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
