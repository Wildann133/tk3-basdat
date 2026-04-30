"use client";

import { useState } from "react";
import { EVENTS, VENUES } from "@/lib/dummyData";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Calendar, Clock, MapPin, Edit, Trash2, Plus, X, Tag, Users } from "lucide-react";

type TicketCategory = {
  id: string;
  name: string;
  price: number;
  capacity: number;
};

// Extend the Event type for the frontend to include required mock fields
type EventData = typeof EVENTS[0] & {
  artists?: string[];
  ticket_categories?: TicketCategory[];
  description?: string;
  image_url?: string;
};

export default function EventManager({ role, userId }: { role: string; userId?: string }) {
  const [events, setEvents] = useState<EventData[]>(EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    event_title: "",
    event_date: "",
    event_time: "",
    venue_id: "",
    artists: [] as string[],
    ticket_categories: [] as TicketCategory[],
    description: "",
    image_url: ""
  });

  const [artistInput, setArtistInput] = useState("");

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({ 
      event_title: "", 
      event_date: "", 
      event_time: "", 
      venue_id: VENUES[0]?.venue_id || "", 
      artists: [], 
      ticket_categories: [], 
      description: "", 
      image_url: "" 
    });
    setArtistInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EventData) => {
    setEditingEvent(evt);
    
    // Parse datetime
    let date = "";
    let time = "";
    if (evt.event_datetime) {
      const dt = new Date(evt.event_datetime);
      if (!isNaN(dt.getTime())) {
        date = dt.toISOString().split("T")[0];
        time = dt.toTimeString().slice(0, 5);
      }
    }

    setFormData({
      event_title: evt.event_title,
      event_date: date,
      event_time: time,
      venue_id: evt.venue_id,
      artists: evt.artists || [],
      ticket_categories: evt.ticket_categories || [],
      description: evt.description || "",
      image_url: evt.image_url || ""
    });
    setArtistInput("");
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setEventToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const combinedDateTime = `${formData.event_date}T${formData.event_time}:00Z`;

    if (editingEvent) {
      // Update
      const updatedEvents = events.map(evt => 
        evt.event_id === editingEvent.event_id 
          ? { 
              ...evt, 
              event_title: formData.event_title,
              event_datetime: combinedDateTime,
              venue_id: formData.venue_id,
              artists: formData.artists,
              ticket_categories: formData.ticket_categories,
              description: formData.description,
              image_url: formData.image_url
            } 
          : evt
      );
      setEvents(updatedEvents);
    } else {
      // Create
      const newEvent: EventData = {
        event_id: "e" + (Math.floor(Math.random() * 10000)).toString(),
        event_title: formData.event_title,
        event_datetime: combinedDateTime,
        venue_id: formData.venue_id,
        organizer_id: userId || "o1", // Mock organizer id
        status: "UPCOMING",
        artists: formData.artists,
        ticket_categories: formData.ticket_categories,
        description: formData.description,
        image_url: formData.image_url
      };
      setEvents([...events, newEvent]);
    }
    closeModal();
  };

  const handleDelete = () => {
    if (eventToDelete) {
      setEvents(events.filter(e => e.event_id !== eventToDelete));
    }
    closeDeleteModal();
  };

  const handleAddArtist = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && artistInput.trim() !== "") {
      e.preventDefault();
      if (!formData.artists.includes(artistInput.trim())) {
        setFormData({ ...formData, artists: [...formData.artists, artistInput.trim()] });
      }
      setArtistInput("");
    }
  };

  const handleRemoveArtist = (artist: string) => {
    setFormData({ ...formData, artists: formData.artists.filter(a => a !== artist) });
  };

  const handleAddCategory = () => {
    setFormData({
      ...formData,
      ticket_categories: [
        ...formData.ticket_categories,
        { id: Math.random().toString(36).substring(7), name: "", price: 0, capacity: 0 }
      ]
    });
  };

  const handleRemoveCategory = (id: string) => {
    setFormData({
      ...formData,
      ticket_categories: formData.ticket_categories.filter(c => c.id !== id)
    });
  };

  const handleCategoryChange = (id: string, field: keyof TicketCategory, value: string | number) => {
    setFormData({
      ...formData,
      ticket_categories: formData.ticket_categories.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    });
  };

  const getVenueName = (id: string) => {
    return VENUES.find(v => v.venue_id === id)?.venue_name || "Unknown Venue";
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="bg-primary text-black p-6 md:p-8 rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-head tracking-tighter mb-2">Acara Saya</h1>
          <p className="font-bold text-black/80">Kelola dan publikasikan event pada platform TikTakTuk.</p>
        </div>
        <Button onClick={openAddModal} className="bg-white text-black hover:bg-zinc-100 border-4 border-black font-bold text-lg px-6 py-6 shadow-[4px_4px_0_0_#000] transition-transform hover:-translate-y-1">
          <Plus className="mr-2" size={24} /> Buat Acara
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => {
          const dt = new Date(evt.event_datetime);
          const dateString = isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' });
          const timeString = isNaN(dt.getTime()) ? "-" : dt.toLocaleTimeString("id-ID", { hour: '2-digit', minute:'2-digit' });

          return (
            <Card key={evt.event_id} className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] flex flex-col hover:bg-accent transition-colors group overflow-hidden">
              
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-head font-bold leading-tight group-hover:text-primary transition-colors flex-1">{evt.event_title}</h2>
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => openEditModal(evt)} className="p-2 bg-[#ffdb33] text-black border-2 border-black shadow-[2px_2px_0_0_#000] hover:-translate-y-1 transition-transform" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => openDeleteModal(evt.event_id)} className="p-2 bg-destructive text-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:-translate-y-1 transition-transform" title="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-auto space-y-3 pt-4 border-t-2 border-black/10">
                  <p className="text-sm font-bold text-zinc-700 flex items-center">
                    <Calendar size={16} className="mr-2 text-black shrink-0" /> {dateString}
                  </p>
                  <p className="text-sm font-bold text-zinc-700 flex items-center">
                    <Clock size={16} className="mr-2 text-black shrink-0" /> {timeString} WIB
                  </p>
                  <p className="text-sm font-bold text-zinc-700 flex items-center">
                    <MapPin size={16} className="mr-2 text-black shrink-0" /> <span className="truncate">{getVenueName(evt.venue_id)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CUD Forms Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-4xl bg-white border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col max-h-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b-4 border-black bg-[#ffdb33] shrink-0">
              <h2 className="text-3xl font-head font-black">{editingEvent ? "Update Acara" : "Buat Acara Baru"}</h2>
              <button onClick={closeModal} className="p-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-destructive hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <CardContent className="p-0 flex flex-col min-h-0">
              <form onSubmit={handleSave} className="flex flex-col min-h-0 h-full">
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="space-y-2">
                  <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Judul Acara (Event_Title)</label>
                  <Input 
                    required 
                    placeholder="cth. Konser Melodi Senja"
                    value={formData.event_title} 
                    onChange={(e) => setFormData({...formData, event_title: e.target.value})} 
                    className="border-2 border-black bg-white" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Tanggal (Date)</label>
                    <Input 
                      type="date"
                      required 
                      value={formData.event_date} 
                      onChange={(e) => setFormData({...formData, event_date: e.target.value})} 
                      className="border-2 border-black bg-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Waktu (Time)</label>
                    <Input 
                      type="time"
                      required 
                      value={formData.event_time} 
                      onChange={(e) => setFormData({...formData, event_time: e.target.value})} 
                      className="border-2 border-black bg-white" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Venue (Venue_Id)</label>
                  <select 
                    required
                    value={formData.venue_id} 
                    onChange={(e) => setFormData({...formData, venue_id: e.target.value})} 
                    className="w-full flex h-10 rounded-md bg-white border-2 border-black px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Pilih Venue...</option>
                    {VENUES.map(v => (
                      <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Artis (Event_Artist)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.artists.map(artist => (
                      <span key={artist} className="inline-flex items-center px-3 py-1 rounded-full border-2 border-black text-sm bg-accent text-black font-bold">
                        {artist}
                        <button type="button" onClick={() => handleRemoveArtist(artist)} className="ml-2 text-black hover:text-red-600">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input 
                    placeholder="Ketik artis dan tekan Enter"
                    value={artistInput}
                    onChange={(e) => setArtistInput(e.target.value)}
                    onKeyDown={handleAddArtist}
                    className="border-2 border-black bg-white" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Kategori Tiket (Ticket_Category)</label>
                  <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border-2 border-black">
                    {formData.ticket_categories.map((cat, idx) => (
                      <div key={cat.id} className="flex flex-col gap-2 relative border-b border-zinc-300 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Nama Kategori (cth. Regular)" 
                            value={cat.name} 
                            onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                            className="flex-1 bg-white border-2 border-black h-9"
                          />
                          <button type="button" onClick={() => handleRemoveCategory(cat.id)} className="text-destructive hover:text-red-600 self-center">
                            <div className="w-6 h-6 border-2 border-black bg-white shadow-[2px_2px_0_0_#000] flex items-center justify-center">
                              <X size={14} />
                            </div>
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            placeholder="Harga" 
                            value={cat.price || ""} 
                            onChange={(e) => handleCategoryChange(cat.id, 'price', parseInt(e.target.value) || 0)}
                            className="flex-1 bg-white border-2 border-black h-9"
                          />
                          <Input 
                            type="number" 
                            placeholder="Kapasitas" 
                            value={cat.capacity || ""} 
                            onChange={(e) => handleCategoryChange(cat.id, 'capacity', parseInt(e.target.value) || 0)}
                            className="flex-1 bg-white border-2 border-black h-9"
                          />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddCategory} className="text-black font-bold text-sm flex items-center mt-2 hover:underline">
                      <Plus size={16} className="mr-1" /> Tambah Kategori
                    </button>
                  </div>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Deskripsi</label>
                  <textarea 
                    placeholder="Deskripsi acara..."
                    rows={4}
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full flex-1 rounded-md bg-white border-2 border-black px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black resize-none"
                  />
                </div>

                </div>
                <div className="p-6 flex justify-end gap-4 border-t-4 border-black bg-zinc-50 shrink-0">
                  <Button type="button" onClick={closeModal} variant="outline" className="border-2 border-black font-bold bg-white">Batal</Button>
                  <Button type="submit" className="bg-primary text-black hover:bg-black hover:text-white border-2 border-black font-bold shadow-[2px_2px_0_0_#000]">{editingEvent ? "Simpan" : "Buat Acara"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <Card className="w-full max-w-sm bg-white border-4 border-black shadow-[8px_8px_0_0_#000] text-center overflow-hidden">
              <div className="bg-destructive text-white p-6 pb-4">
                <Trash2 size={48} className="mx-auto mb-4" />
                <h2 className="text-3xl font-head font-black">Hapus Acara?</h2>
              </div>
              <CardContent className="p-6">
                 <p className="font-bold text-zinc-600 mb-6">Tindakan ini tidak dapat dibatalkan. Data acara akan terhapus dari sistem.</p>
                 <div className="flex justify-center gap-4">
                    <Button onClick={closeDeleteModal} variant="outline" className="border-2 border-black font-bold flex-1">Batal</Button>
                    <Button onClick={handleDelete} className="bg-destructive text-white hover:bg-black border-2 border-black font-bold shadow-[2px_2px_0_0_#000] flex-1">Hapus</Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}
