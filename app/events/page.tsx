"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Carousel } from "@/components/retroui/Carousel";
import { fetchJson } from "@/lib/api";
import { Calendar, Clock, MapPin, Search, Ticket } from "lucide-react";

type TicketCategory = {
  id: string;
  name: string;
  price: number;
  capacity: number;
};

type EventApiRow = {
  id: string;
  event_id: string;
  title: string;
  event_title: string;
  event_datetime: string;
  venue_id: string;
};

type VenueRow = {
  venue_id: string;
  venue_name: string;
};

type TicketCategoryApiRow = {
  id: string;
  name: string;
  quota: number;
  price: number;
  event_id: string;
};

type EventData = {
  event_id: string;
  event_title: string;
  event_datetime: string;
  venue_id: string;
  ticket_categories: TicketCategory[];
};

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [venueFilter, setVenueFilter] = useState("ALL");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [eventRows, venueRows, ticketCategoryRows] = await Promise.all([
          fetchJson<EventApiRow[]>("/api/events"),
          fetchJson<VenueRow[]>("/api/venues"),
          fetchJson<TicketCategoryApiRow[]>("/api/ticket-categories"),
        ]);

        const categoriesByEvent = new Map<string, TicketCategory[]>();
        ticketCategoryRows.forEach((category) => {
          const current = categoriesByEvent.get(category.event_id) ?? [];
          current.push({
            id: category.id,
            name: category.name,
            price: Number(category.price),
            capacity: Number(category.quota),
          });
          categoriesByEvent.set(category.event_id, current);
        });

        const hydratedEvents = eventRows
          .map((event) => ({
            event_id: event.event_id,
            event_title: event.event_title || event.title,
            event_datetime: event.event_datetime,
            venue_id: event.venue_id,
            ticket_categories: categoriesByEvent.get(event.event_id) ?? [],
          }))
          .filter((event) => event.ticket_categories.length > 0);

        if (!cancelled) {
          setEvents(hydratedEvents);
          setVenues(venueRows);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Gagal memuat daftar event."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.event_title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesVenue = venueFilter === "ALL" || event.venue_id === venueFilter;
      return matchesSearch && matchesVenue;
    });
  }, [events, searchQuery, venueFilter]);

  const getVenueName = (venueId: string) => {
    const venue = venues.find((v) => v.venue_id === venueId);
    return venue ? venue.venue_name : "Unknown Venue";
  };

  const getStartingPrice = (categories: TicketCategory[]) => {
    if (!categories || categories.length === 0) return 0;
    return Math.min(...categories.map((c) => c.price));
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black font-head uppercase tracking-tighter">
            Jelajahi Acara
          </h1>
          <p className="font-bold text-gray-700 mt-2">
            Temukan dan pesan tiket untuk acara favoritmu
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="bg-[#ffdb33] mb-8 border-4 border-black shadow-[4px_4px_0_0_#000] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative bg-white">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-600" />
            <Input
              placeholder="Cari judul acara..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-black font-bold"
            />
          </div>

          <div>
            <select
              value={venueFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVenueFilter(e.target.value)}
              className="w-full h-11 px-3 border-2 border-black bg-white rounded font-bold shadow-[2px_2px_0_0_#000] outline-hidden focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all cursor-pointer"
            >
              <option value="ALL">Semua Venue</option>
              {venues.map((venue) => (
                <option key={venue.venue_id} value={venue.venue_id}>
                  {venue.venue_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Events Carousel */}
      {errorMessage ? (
        <Card className="p-12 text-center bg-red-100 border-4 border-black shadow-[8px_8px_0_0_#000]">
          <h2 className="text-2xl font-black font-head">Gagal memuat event</h2>
          <p className="font-bold mt-2">{errorMessage}</p>
        </Card>
      ) : loading ? (
        <Card className="p-12 text-center bg-gray-100 border-4 border-black shadow-[8px_8px_0_0_#000]">
          <h2 className="text-2xl font-black font-head">Memuat event...</h2>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center bg-gray-100 border-4 border-black shadow-[8px_8px_0_0_#000]">
          <h2 className="text-2xl font-black font-head">Tidak ada acara yang ditemukan</h2>
          <p className="font-bold mt-2">Coba sesuaikan filter pencarian Anda.</p>
        </Card>
      ) : (
        <div className="px-12 relative">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <Carousel.Content>
              {filteredEvents.map((event, index) => {
                // Different background colors for cards to look retro
                const colors = ["bg-[#ffd6a5]", "bg-[#caffbf]", "bg-[#ffadad]", "bg-[#9bf6ff]"];
                const bgColor = colors[index % colors.length];

                return (
                  <Carousel.Item key={event.event_id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className={`h-full flex flex-col border-4 border-black shadow-[6px_6px_0_0_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] ${bgColor}`}>
                        <CardContent className="p-6 flex-grow flex flex-col">
                          <div className="mb-4 flex-grow">
                            <h3 className="text-2xl font-black font-head mb-4 line-clamp-2 uppercase tracking-tight leading-tight">
                              {event.event_title}
                            </h3>
                            
                            <div className="space-y-3 font-bold text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-700" />
                                <span>{new Date(event.event_datetime).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-700" />
                                <span>{new Date(event.event_datetime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-700" />
                                <span>{getVenueName(event.venue_id)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 mb-6">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="bg-white border-2 border-black text-xs font-bold px-2 py-1 rounded shadow-[2px_2px_0_0_#000]">
                                {event.ticket_categories.length} kategori tiket
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto pt-4 border-t-2 border-black/20 flex flex-col gap-3">
                             <div className="flex justify-between items-center">
                                <span className="font-bold text-sm">Harga Mulai:</span>
                                <span className="font-black text-lg font-head">{formatRupiah(getStartingPrice(event.ticket_categories))}</span>
                             </div>
                             <Button
                               className="w-full font-black text-lg py-6 uppercase tracking-wider"
                               onClick={() => router.push(`/checkout?eventId=${event.event_id}`)}
                             >
                                <Ticket className="w-5 h-5 mr-2" />
                                Beli Tiket
                             </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Carousel.Item>
                );
              })}
            </Carousel.Content>
            <Carousel.Previous />
            <Carousel.Next />
          </Carousel>
        </div>
      )}
    </div>
  );
}
