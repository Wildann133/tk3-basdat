"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { fetchJson } from "@/lib/api";
import { MapPin, Users, Ticket, Edit, Trash2, Plus, X, Search } from "lucide-react";

type Venue = {
  id: string;
  venue_id: string;
  name: string;
  venue_name: string;
  capacity: number;
  address: string;
  city: string;
  seating_type: string;
};

type VenueFormState = {
  venue_name: string;
  address: string;
  city: string;
  capacity: string;
  seating_type: string;
};

const initialFormState: VenueFormState = {
  venue_name: "",
  address: "",
  city: "",
  capacity: "",
  seating_type: "reserved seating",
};

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-black/10 ${className}`} />;
}

export default function VenueManager({ role }: { role: string }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueToDelete, setVenueToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterSeating, setFilterSeating] = useState("");
  const [formData, setFormData] = useState<VenueFormState>(initialFormState);

  const userRole = role?.toLowerCase() || "";
  const canManage = userRole === "admin" || userRole === "organizer";

  const loadVenues = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchJson<Venue[]>("/api/venues");
      setVenues(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar venue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVenues();
  }, []);

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const venueName = venue.venue_name || venue.name || "";
      const matchesSearch =
        venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = filterCity === "" || venue.city === filterCity;
      const matchesSeating = filterSeating === "" || venue.seating_type === filterSeating;
      return matchesSearch && matchesCity && matchesSeating;
    });
  }, [venues, searchQuery, filterCity, filterSeating]);

  const openAddModal = () => {
    setEditingVenue(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      venue_name: venue.venue_name || venue.name,
      address: venue.address,
      city: venue.city,
      capacity: String(venue.capacity),
      seating_type: venue.seating_type || "reserved seating",
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setVenueToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVenue(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setVenueToDelete(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        venue_name: formData.venue_name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        capacity: Number(formData.capacity),
      };

      if (editingVenue) {
        await fetchJson<Venue>("/api/venues", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingVenue.id || editingVenue.venue_id, ...payload }),
        });
      } else {
        await fetchJson<Venue>("/api/venues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      await loadVenues();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan venue.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!venueToDelete) return;

    setSaving(true);
    setError("");

    try {
      await fetchJson<{ message: string }>(`/api/venues?id=${venueToDelete}`, {
        method: "DELETE",
      });
      await loadVenues();
      closeDeleteModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus venue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary text-black p-6 md:p-8 rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-head tracking-tighter mb-2">Venue</h1>
          <p className="font-bold text-black/80">
            {canManage ? "Kelola lokasi penyelenggaraan acara platform TikTakTuk." : "Daftar lokasi penyelenggaraan acara platform TikTakTuk."}
          </p>
        </div>
        {canManage && (
          <Button onClick={openAddModal} className="bg-white text-black hover:bg-zinc-100 border-4 border-black font-bold text-lg px-6 py-6 shadow-[4px_4px_0_0_#000] transition-transform hover:-translate-y-1">
            <Plus className="mr-2" size={24} /> Tambah Venue
          </Button>
        )}
      </div>

      {error && (
        <div className="border-2 border-red-500 bg-red-100 text-red-600 font-bold p-3">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000]">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <Input
            placeholder="Cari berdasarkan nama atau alamat venue..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-black bg-white pl-10"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterCity}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCity(e.target.value)}
            className="border-2 border-black bg-white rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black font-bold h-10"
          >
            <option value="">Semua Kota</option>
            {Array.from(new Set(venues.map((v) => v.city))).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select
            value={filterSeating}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterSeating(e.target.value)}
            className="border-2 border-black bg-white rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black font-bold h-10"
          >
            <option value="">Semua Seating</option>
            <option value="reserved seating">Reserved Seating</option>
            <option value="free seating">Free Seating</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] flex flex-col">
              <CardContent className="p-6 h-full flex flex-col gap-4">
                <SkeletonBlock className="h-6 w-20" />
                <SkeletonBlock className="h-8 w-4/5" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <Card key={venue.id || venue.venue_id} className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] flex flex-col hover:bg-accent transition-colors group">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-widest border-2 border-black rounded shadow-[2px_2px_0_#000]">
                    {venue.venue_id}
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(venue)} className="p-2 bg-[#ffdb33] text-black border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-y-1 transition-transform" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => openDeleteModal(venue.id || venue.venue_id)} className="p-2 bg-destructive text-white border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-y-1 transition-transform" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-head font-bold mb-2 leading-none group-hover:text-primary transition-colors">{venue.venue_name || venue.name}</h2>
                <div className="mt-auto space-y-3 pt-4 border-t-2 border-black/10">
                  <div className="text-sm font-bold text-zinc-700">
                    <span className="flex items-center"><MapPin size={16} className="mr-2 text-black shrink-0" /> {venue.city}</span>
                    <span className="block mt-1 text-xs font-normal text-zinc-500 ml-6 truncate">{venue.address}</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-700 flex items-center">
                    <Users size={16} className="mr-2 text-black" /> {Number(venue.capacity).toLocaleString()} Kapasitas
                  </p>
                  <p className="text-sm font-bold text-zinc-700 flex items-center capitalize">
                    <Ticket size={16} className="mr-2 text-black" /> {venue.seating_type}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0_0_#000]">
            <div className="flex justify-between items-center p-6 border-b-4 border-black bg-[#ffdb33]">
              <h2 className="text-3xl font-head font-black">{editingVenue ? "Update Venue" : "Create Venue"}</h2>
              <button onClick={closeModal} className="p-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-destructive hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="font-bold text-sm tracking-widest uppercase">Nama Venue</label>
                  <Input
                    required
                    value={formData.venue_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, venue_name: e.target.value })}
                    className="border-2 border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-sm tracking-widest uppercase">Alamat</label>
                  <Input
                    required
                    value={formData.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                    className="border-2 border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-widest uppercase">Kota</label>
                    <Input
                      required
                      value={formData.city}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-widest uppercase">Kapasitas</label>
                    <Input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, capacity: e.target.value })}
                      className="border-2 border-black"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-sm tracking-widest uppercase">Jenis Seating</label>
                  <select
                    value={formData.seating_type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, seating_type: e.target.value })}
                    className="w-full flex h-10 rounded-md bg-white border-2 border-black px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="reserved seating">Reserved Seating</option>
                    <option value="free seating">Free Seating</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-4">
                  <Button type="button" onClick={closeModal} variant="outline" className="border-2 border-black font-bold">
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-black hover:bg-black hover:text-white border-2 border-black font-bold shadow-[2px_2px_0_0_#000]"
                  >
                    {saving ? "Menyimpan..." : editingVenue ? "Simpan" : "Tambah"}
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
              <h2 className="text-3xl font-head font-black">Hapus Venue?</h2>
            </div>
            <CardContent className="p-6">
              <p className="font-bold text-zinc-600 mb-6">Tindakan ini tidak dapat dibatalkan. Data venue akan terhapus dari sistem.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={closeDeleteModal} variant="outline" className="border-2 border-black font-bold flex-1">
                  Batal
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={saving}
                  className="bg-destructive text-white hover:bg-black border-2 border-black font-bold shadow-[2px_2px_0_0_#000] flex-1"
                >
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
