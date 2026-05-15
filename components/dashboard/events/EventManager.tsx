"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { fetchJson } from "@/lib/api";
import { Calendar, Clock, MapPin, Edit, Trash2, Plus, X, Users } from "lucide-react";

type TicketCategory = {
  id: string;
  name: string;
  price: number;
  capacity: number;
};

type EventData = {
  id: string;
  event_id: string;
  title: string;
  event_title: string;
  event_datetime: string;
  venue_id: string;
  organizer_id: string;
  organizer_name?: string;
  artists?: string[];
  ticket_categories?: TicketCategory[];
  description?: string;
  image_url?: string;
};

type VenueOption = {
  id: string;
  venue_id: string;
  venue_name: string;
};

type OrganizerOption = {
  id: string;
  organizer_id: string;
  organizer_name: string;
};

type ArtistOption = {
  id: string;
  name: string;
  genre?: string;
};

type EventFormState = {
  event_title: string;
  event_date: string;
  event_time: string;
  venue_id: string;
  organizer_id: string;
  artists: string[];
  ticket_categories: TicketCategory[];
  description: string;
  image_url: string;
};

const initialFormState: EventFormState = {
  event_title: "",
  event_date: "",
  event_time: "",
  venue_id: "",
  organizer_id: "",
  artists: [],
  ticket_categories: [],
  description: "",
  image_url: "",
};

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-black/10 ${className}`} />;
}

export default function EventManager({ role }: { role: string; userId?: string }) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [organizers, setOrganizers] = useState<OrganizerOption[]>([]);
  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormState>(initialFormState);
  const [selectedArtistId, setSelectedArtistId] = useState("");

  const userRole = role.toLowerCase();
  const canManage = userRole === "admin" || userRole === "organizer";
  const canAssignOrganizer = userRole === "admin";

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [venueResult, eventResult, artistResult] = await Promise.all([
        fetchJson<VenueOption[]>("/api/venues"),
        fetchJson<EventData[]>(userRole === "organizer" ? "/api/events?mine=1" : "/api/events"),
        fetchJson<ArtistOption[]>("/api/artists"),
      ]);

      setVenues(venueResult);
      setEvents(eventResult);
      setArtistOptions(artistResult);

      if (canAssignOrganizer) {
        const organizerResult = await fetchJson<OrganizerOption[]>("/api/organizers");
        setOrganizers(organizerResult);
      } else {
        setOrganizers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data acara.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [userRole, canAssignOrganizer]);

  const getVenueName = useMemo(() => {
    return (id: string) => venues.find((v) => v.venue_id === id)?.venue_name || "Unknown Venue";
  }, [venues]);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      ...initialFormState,
      venue_id: venues[0]?.venue_id || "",
      organizer_id: organizers[0]?.organizer_id || "",
    });
    setSelectedArtistId("");
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EventData) => {
    setEditingEvent(evt);

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
      event_title: evt.event_title || evt.title,
      event_date: date,
      event_time: time,
      venue_id: evt.venue_id,
      organizer_id: evt.organizer_id,
      artists: evt.artists || [],
      ticket_categories: evt.ticket_categories || [],
      description: evt.description || "",
      image_url: evt.image_url || "",
    });
    setSelectedArtistId("");
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setEventToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const combinedDateTime = `${formData.event_date}T${formData.event_time}:00Z`;
      const payload: Record<string, unknown> = {
        event_title: formData.event_title.trim(),
        event_datetime: combinedDateTime,
        venue_id: formData.venue_id,
        artists: formData.artists
          .map((artist) => artist.trim())
          .filter(Boolean),
        ticket_categories: formData.ticket_categories
          .map((category) => ({
            name: category.name.trim(),
            price: Number(category.price),
            capacity: Number(category.capacity),
          }))
          .filter((category) => category.name && Number.isFinite(category.price) && Number.isFinite(category.capacity)),
      };

      if (canAssignOrganizer) {
        payload.organizer_id = formData.organizer_id;
      }

      if (editingEvent) {
        await fetchJson<EventData>("/api/events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingEvent.id || editingEvent.event_id, ...payload }),
        });
      } else {
        await fetchJson<EventData>("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      await loadData();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan acara.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    setSaving(true);
    setError("");

    try {
      await fetchJson<{ message: string }>(`/api/events?id=${eventToDelete}`, { method: "DELETE" });
      await loadData();
      closeDeleteModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus acara.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddArtist = () => {
    const selectedArtist = artistOptions.find((artist) => artist.id === selectedArtistId);
    if (!selectedArtist) return;
    if (!formData.artists.includes(selectedArtist.name)) {
      setFormData({ ...formData, artists: [...formData.artists, selectedArtist.name] });
    }
    setSelectedArtistId("");
  };

  const handleRemoveArtist = (artist: string) => {
    setFormData({ ...formData, artists: formData.artists.filter((a) => a !== artist) });
  };

  const handleAddCategory = () => {
    setFormData({
      ...formData,
      ticket_categories: [...formData.ticket_categories, { id: Math.random().toString(36).substring(7), name: "", price: 0, capacity: 0 }],
    });
  };

  const handleRemoveCategory = (id: string) => {
    setFormData({ ...formData, ticket_categories: formData.ticket_categories.filter((c) => c.id !== id) });
  };

  const handleCategoryChange = (id: string, field: keyof TicketCategory, value: string | number) => {
    setFormData({
      ...formData,
      ticket_categories: formData.ticket_categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary text-black p-6 md:p-8 rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-head tracking-tighter mb-2">Acara Saya</h1>
          <p className="font-bold text-black/80">Kelola dan publikasikan event pada platform TikTakTuk.</p>
        </div>
        {canManage && (
          <Button onClick={openAddModal} className="bg-white text-black hover:bg-zinc-100 border-4 border-black font-bold text-lg px-6 py-6 shadow-[4px_4px_0_0_#000] transition-transform hover:-translate-y-1">
            <Plus className="mr-2" size={24} /> Buat Acara
          </Button>
        )}
      </div>

      {error && <div className="border-2 border-red-500 bg-red-100 text-red-600 font-bold p-3">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000]">
              <CardContent className="p-6 flex flex-col gap-3">
                <SkeletonBlock className="h-7 w-4/5" />
                <SkeletonBlock className="h-4 w-1/2" />
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-4 w-3/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const dt = new Date(evt.event_datetime);
            const dateString = isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
            const timeString = isNaN(dt.getTime()) ? "-" : dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

            return (
              <Card key={evt.id || evt.event_id} className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] flex flex-col hover:bg-accent transition-colors group overflow-hidden">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-head font-bold leading-tight group-hover:text-primary transition-colors flex-1">{evt.event_title || evt.title}</h2>
                    {canManage && (
                      <div className="flex gap-2 ml-2">
                        <button onClick={() => openEditModal(evt)} className="p-2 bg-[#ffdb33] text-black border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-y-1 transition-transform" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => openDeleteModal(evt.id || evt.event_id)} className="p-2 bg-destructive text-white border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-y-1 transition-transform" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-bold text-zinc-600">
                    <MapPin size={14} className="text-black" />
                    <span>{getVenueName(evt.venue_id)}</span>
                  </div>
                  {evt.organizer_name && (
                    <div className="mt-2 flex items-center gap-2 text-sm font-bold text-zinc-600">
                      <Users size={14} className="text-black" />
                      <span>{evt.organizer_name}</span>
                    </div>
                  )}
                  <div className="mt-auto space-y-3 pt-4 border-t-2 border-black/10">
                    <p className="text-sm font-bold text-zinc-700 flex items-center">
                      <Calendar size={16} className="mr-2 text-black shrink-0" /> {dateString}
                    </p>
                    <p className="text-sm font-bold text-zinc-700 flex items-center">
                      <Clock size={16} className="mr-2 text-black shrink-0" /> {timeString} WIB
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
                    <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Judul Acara</label>
                    <Input required placeholder="cth. Konser Melodi Senja" value={formData.event_title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, event_title: e.target.value })} className="border-2 border-black bg-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Tanggal</label>
                      <Input type="date" required value={formData.event_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, event_date: e.target.value })} className="border-2 border-black bg-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Waktu</label>
                      <Input type="time" required value={formData.event_time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, event_time: e.target.value })} className="border-2 border-black bg-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Venue</label>
                    <select required value={formData.venue_id} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, venue_id: e.target.value })} className="w-full flex h-10 rounded-md bg-white border-2 border-black px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="" disabled>
                        Pilih Venue...
                      </option>
                      {venues.map((v) => (
                        <option key={v.venue_id} value={v.venue_id}>
                          {v.venue_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {canAssignOrganizer && (
                    <div className="space-y-2">
                      <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Organizer</label>
                      <select required value={formData.organizer_id} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, organizer_id: e.target.value })} className="w-full flex h-10 rounded-md bg-white border-2 border-black px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="" disabled>
                          Pilih Organizer...
                        </option>
                        {organizers.map((organizer) => (
                          <option key={organizer.organizer_id} value={organizer.organizer_id}>
                            {organizer.organizer_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Artis</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.artists.map((artist) => (
                        <span key={artist} className="inline-flex items-center px-3 py-1 rounded-full border-2 border-black text-sm bg-accent text-black font-bold">
                          {artist}
                          <button type="button" onClick={() => handleRemoveArtist(artist)} className="ml-2 text-black hover:text-red-600">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedArtistId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedArtistId(e.target.value)}
                        className="w-full flex h-10 rounded-md bg-white border-2 border-black px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                      >
                        <option value="">Pilih Artist...</option>
                        {artistOptions.map((artist) => (
                          <option key={artist.id} value={artist.id}>
                            {artist.name}
                          </option>
                        ))}
                      </select>
                      <Button type="button" onClick={handleAddArtist} className="border-2 border-black bg-white text-black font-bold">
                        Tambah
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-widest uppercase text-zinc-600">Kategori Tiket</label>
                    <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border-2 border-black">
                      {formData.ticket_categories.map((cat) => (
                        <div key={cat.id} className="flex flex-col gap-2 relative border-b border-zinc-300 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                          <div className="flex gap-2">
                            <Input placeholder="Nama Kategori" value={cat.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCategoryChange(cat.id, "name", e.target.value)} className="flex-1 bg-white border-2 border-black h-9" />
                            <button type="button" onClick={() => handleRemoveCategory(cat.id)} className="text-destructive hover:text-red-600 self-center">
                              <div className="w-6 h-6 border-2 border-black bg-white shadow-[2px_2px_0_#000] flex items-center justify-center">
                                <X size={14} />
                              </div>
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <Input type="number" placeholder="Harga" value={cat.price || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCategoryChange(cat.id, "price", Number(e.target.value) || 0)} className="flex-1 bg-white border-2 border-black h-9" />
                            <Input type="number" placeholder="Kapasitas" value={cat.capacity || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCategoryChange(cat.id, "capacity", Number(e.target.value) || 0)} className="flex-1 bg-white border-2 border-black h-9" />
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
                    <textarea placeholder="Deskripsi acara..." rows={4} value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })} className="w-full flex-1 rounded-md bg-white border-2 border-black px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black resize-none" />
                  </div>
                </div>
                <div className="p-6 flex justify-end gap-4 border-t-4 border-black bg-zinc-50 shrink-0">
                  <Button type="button" onClick={closeModal} variant="outline" className="border-2 border-black font-bold bg-white">
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-primary text-black hover:bg-black hover:text-white border-2 border-black font-bold shadow-[2px_2px_0_0_#000]">
                    {saving ? "Menyimpan..." : editingEvent ? "Simpan" : "Buat Acara"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

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
                <Button onClick={closeDeleteModal} variant="outline" className="border-2 border-black font-bold flex-1">
                  Batal
                </Button>
                <Button onClick={handleDelete} disabled={saving} className="bg-destructive text-white hover:bg-black border-2 border-black font-bold shadow-[2px_2px_0_0_#000] flex-1">
                  {saving ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
