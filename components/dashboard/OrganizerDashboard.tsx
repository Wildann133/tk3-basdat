"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { CalendarCheck, Ticket, TrendingUp, MapPin } from "lucide-react";
import Link from "next/link";
import { fetchDashboardData } from "@/lib/dashboard";

type OrganizerEvent = {
  event_id: string;
  event_title: string;
  event_datetime: string;
  venue_id: string;
  percent_sold: number;
  status: string;
};

type OrganizerDashboardData = {
  organizerName: string;
  activeEvents: number;
  ticketsSold: number;
  revenue: number;
  venuesMitra: number;
  events: OrganizerEvent[];
};

const initialData: OrganizerDashboardData = {
  organizerName: "Organizer",
  activeEvents: 0,
  ticketsSold: 0,
  revenue: 0,
  venuesMitra: 0,
  events: [],
};

const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />;
}

export default function OrganizerDashboard() {
  const [data, setData] = useState<OrganizerDashboardData>(initialData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setError("");
      setLoading(true);
      try {
        const result = await fetchDashboardData<OrganizerDashboardData>("/api/dashboard/organizer");
        if (active) {
          setData(result);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Gagal memuat dashboard organizer.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const { organizerName, activeEvents, ticketsSold, revenue, venuesMitra, events } = data;

  return (
    <div className="flex-1 p-4 md:p-8 min-h-full">
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min">
          <SkeletonBlock className="h-44 md:col-span-4 border-4 border-black" />
          <SkeletonBlock className="h-[420px] md:col-span-3 border-4 border-black" />
          <div className="grid grid-cols-2 md:grid-cols-1 gap-6 md:col-span-1">
            <SkeletonBlock className="h-40 border-4 border-black" />
            <SkeletonBlock className="h-40 border-4 border-black" />
            <SkeletonBlock className="h-40 border-4 border-black" />
            <SkeletonBlock className="h-40 border-4 border-black" />
          </div>
        </div>
      )}
      {error && (
        <div className="border-2 border-red-500 bg-red-100 text-red-600 font-bold p-3 mb-6">
          {error}
        </div>
      )}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min">
        {/* HEADER: BENTO BLOCK */}
        <div className="col-span-1 md:col-span-4 bg-secondary text-white p-6 md:p-8 rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-primary font-bold mb-2 tracking-widest text-sm uppercase">Dashboard Penyelenggara</p>
            <h1 className="text-4xl md:text-5xl font-head tracking-wide mb-1">{organizerName}</h1>
            <p className="text-zinc-300 font-medium">Kelola {activeEvents.toLocaleString("id-ID")} acara aktif Anda di TikTakTuk</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/myevents">
              <Button className="bg-primary text-black hover:bg-primary-hover border-4 border-black rounded-lg shadow-[4px_4px_0_0_#000] font-bold">
                + Kelola Acara
              </Button>
            </Link>
            <Link href="/venues">
              <Button className="bg-white text-black hover:bg-zinc-200 border-4 border-black rounded-lg shadow-[4px_4px_0_0_#000] font-bold">
                Venue
              </Button>
            </Link>
          </div>
        </div>

        {/* DETAILS SECTION (TALL) */}
        <Card className="col-span-1 md:col-span-3 row-span-2 bg-white border-4 border-black shadow-[6px_6px_0_0_#000] relative">
          <CardContent className="p-6 md:p-8 h-full flex flex-col">
            <div className="flex justify-between items-end mb-8 border-b-4 border-black pb-4">
              <div>
                <h2 className="text-3xl font-bold font-head uppercase tracking-tight">Performa Acara</h2>
                <p className="text-sm font-bold text-zinc-500 mt-1">Acara yang sedang berjalan</p>
              </div>
              <a href="/myevents" className="bg-primary text-black px-4 py-2 border-2 border-black font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:-translate-y-1 transition-transform">Semua &rarr;</a>
            </div>

            <div className="space-y-4 flex-1">
              {events.map((event) => (
                <div key={event.event_id} className="flex flex-col md:flex-row justify-between md:items-center border-4 border-zinc-200 hover:border-black transition-colors p-4 md:p-5 rounded-lg group bg-zinc-50 hover:bg-white">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-head text-xl font-bold text-black">{event.event_title}</h3>
                      <span className="text-[10px] font-black bg-accent text-black border-2 border-black px-2 py-0.5 rounded-full shadow-[2px_2px_0_0_#000]">{event.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center text-sm font-bold text-zinc-600 gap-4">
                      <span className="flex items-center text-secondary bg-primary px-2 py-1 border-2 border-black rounded shadow-[2px_2px_0_0_#000]">
                        <TrendingUp size={14} strokeWidth={3} className="mr-1"/> {event.percent_sold}% terjual
                      </span>
                      <span className="flex items-center italic">
                        <MapPin size={14} className="mr-1"/> Lokasi ID: {event.venue_id}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href="/myevents">
                      <Button variant="outline" size="sm" className="bg-black text-white hover:bg-zinc-800">Detail</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4 STATS: STACKED IN A 2x2 GRID (or 1x4 if mobile) */}
        <div className="col-span-1 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-6">
          <Card className="bg-[#4ade80] border-4 border-black shadow-[4px_4px_0_0_#000] rotate-1 hover:rotate-0 transition-transform">
            <CardContent className="p-4 md:p-6 text-black flex flex-col items-center text-center justify-center h-full">
              <CalendarCheck size={32} className="mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-white" />
              <h2 className="text-3xl font-head font-bold mb-1">{activeEvents.toLocaleString("id-ID")}</h2>
              <p className="text-xs font-black uppercase tracking-wider opacity-80">Acara Aktif</p>
            </CardContent>
          </Card>

          <Card className="bg-primary border-4 border-black shadow-[4px_4px_0_0_#000] -rotate-1 hover:rotate-0 transition-transform">
            <CardContent className="p-4 md:p-6 text-black flex flex-col items-center text-center justify-center h-full">
              <Ticket size={32} className="mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-white" />
              <h2 className="text-3xl font-head font-bold mb-1">{ticketsSold.toLocaleString("id-ID")}</h2>
              <p className="text-xs font-black uppercase tracking-wider opacity-80">Terjual</p>
            </CardContent>
          </Card>

          <Card className="bg-[#a78bfa] border-4 border-black shadow-[4px_4px_0_0_#000] rotate-2 hover:rotate-0 transition-transform">
            <CardContent className="p-4 md:p-6 text-black flex flex-col items-center text-center justify-center h-full">
              <TrendingUp size={32} className="mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-white" />
              <h2 className="text-2xl md:text-3xl font-head font-bold mb-1">{formatRupiah(revenue)}</h2>
              <p className="text-xs font-black uppercase tracking-wider opacity-80">Revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] -rotate-2 hover:rotate-0 transition-transform">
            <CardContent className="p-4 md:p-6 text-black flex flex-col items-center text-center justify-center h-full">
              <MapPin size={32} className="mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-primary" />
              <h2 className="text-3xl font-head font-bold mb-1">{venuesMitra.toLocaleString("id-ID")}</h2>
              <p className="text-xs font-black uppercase tracking-wider opacity-80">Venue Mitra</p>
            </CardContent>
          </Card>
        </div>
        </div>
      )}
    </div>
  );
}