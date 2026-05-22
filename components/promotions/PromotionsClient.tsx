"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Dialog } from "@/components/retroui/Dialog";
import { Input } from "@/components/retroui/Input";
import { fetchJson } from "@/lib/api";
import { PromotionFormValues, PromotionWithUsage } from "@/lib/types/promotion";

const defaultFormValues: PromotionFormValues = {
  promo_code: "",
  discount_type: "PERCENTAGE",
  discount_value: 0,
  start_date: "",
  end_date: "",
  usage_limit: 1,
};

type UserRole = "guest" | "admin" | "organizer" | "customer";

const tableColumnCount = 6;

const formatDiscountLabel = (promotion: PromotionWithUsage) => {
  if (promotion.discount_type === "PERCENTAGE") {
    return `${promotion.discount_value}%`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(promotion.discount_value);
};

function isPromoCodeUniqueInList(
  list: PromotionWithUsage[],
  promoCode: string,
  excludePromotionId?: string
) {
  const normalized = promoCode.trim().toLowerCase();
  return !list.some(
    (promotion) =>
      promotion.promo_code.toLowerCase() === normalized &&
      promotion.promotion_id !== excludePromotionId
  );
}

function validatePromotionForm(
  values: PromotionFormValues,
  list: PromotionWithUsage[],
  excludePromotionId?: string
) {
  if (!values.promo_code.trim()) {
    return "Kode promo wajib diisi.";
  }
  if (!isPromoCodeUniqueInList(list, values.promo_code, excludePromotionId)) {
    return "Kode promo harus unik.";
  }
  if (values.discount_value <= 0) {
    return "Nilai diskon harus lebih dari 0.";
  }
  if (values.discount_type === "PERCENTAGE" && values.discount_value > 100) {
    return "Diskon persentase tidak boleh lebih dari 100.";
  }
  if (!values.start_date) {
    return "Tanggal mulai wajib diisi.";
  }
  if (!values.end_date) {
    return "Tanggal berakhir wajib diisi.";
  }
  if (values.end_date < values.start_date) {
    return "Tanggal berakhir harus sama atau setelah tanggal mulai.";
  }
  if (!Number.isInteger(values.usage_limit) || values.usage_limit <= 0) {
    return "Batas penggunaan harus bilangan bulat lebih dari 0.";
  }
  return null;
}

export default function PromotionsClient({ role }: { role: UserRole }) {
  const [promotions, setPromotions] = useState<PromotionWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState<
    "All" | "PERCENTAGE" | "NOMINAL"
  >("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [promotionForUpdate, setPromotionForUpdate] = useState<PromotionWithUsage | null>(null);
  const [promotionForDelete, setPromotionForDelete] = useState<PromotionWithUsage | null>(null);
  const [createForm, setCreateForm] = useState<PromotionFormValues>(defaultFormValues);
  const [updateForm, setUpdateForm] = useState<PromotionFormValues>(defaultFormValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const isAdmin = role === "admin";
  const tableColSpan = isAdmin ? tableColumnCount + 1 : tableColumnCount;

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchJson<PromotionWithUsage[]>("/api/promotions");
      setPromotions(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memuat daftar promosi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPromotions();
  }, [loadPromotions]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) => {
      const matchesQuery = promotion.promo_code
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        discountTypeFilter === "All" || promotion.discount_type === discountTypeFilter;
      return matchesQuery && matchesType;
    });
  }, [promotions, searchQuery, discountTypeFilter]);

  const summary = useMemo(() => {
    const totalPromotions = promotions.length;
    const totalUsage = promotions.reduce((total, promotion) => total + promotion.used_count, 0);
    const totalPercentageTypePromotions = promotions.filter(
      (promotion) => promotion.discount_type === "PERCENTAGE"
    ).length;
    return { totalPromotions, totalUsage, totalPercentageTypePromotions };
  }, [promotions]);

  const updateCreateField = <K extends keyof PromotionFormValues>(
    key: K,
    value: PromotionFormValues[K]
  ) => {
    setCreateForm((previous) => ({ ...previous, [key]: value }));
  };

  const updateUpdateField = <K extends keyof PromotionFormValues>(
    key: K,
    value: PromotionFormValues[K]
  ) => {
    setUpdateForm((previous) => ({ ...previous, [key]: value }));
  };

  const openCreateModal = () => {
    if (!isAdmin) return;
    setCreateForm(defaultFormValues);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
  };

  const openUpdateModal = (promotion: PromotionWithUsage) => {
    if (!isAdmin) return;
    setPromotionForUpdate(promotion);
    setUpdateForm({
      promo_code: promotion.promo_code,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      usage_limit: promotion.usage_limit,
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const closeUpdateModal = () => {
    setPromotionForUpdate(null);
  };

  const openDeleteModal = (promotion: PromotionWithUsage) => {
    if (!isAdmin) return;
    setPromotionForDelete(promotion);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const closeDeleteModal = () => {
    setPromotionForDelete(null);
  };

  const handleCreatePromotion = async () => {
    if (!isAdmin) return;
    const validationMessage = validatePromotionForm(createForm, promotions);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setActionLoading(true);
    try {
      await fetchJson<PromotionWithUsage>("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          promo_code: createForm.promo_code.trim(),
        }),
      });
      await loadPromotions();
      setIsCreateOpen(false);
      setErrorMessage(null);
      setSuccessMessage("Promosi berhasil dibuat.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal membuat promosi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePromotion = async () => {
    if (!isAdmin) return;
    if (!promotionForUpdate) return;

    const validationMessage = validatePromotionForm(
      updateForm,
      promotions,
      promotionForUpdate.promotion_id
    );
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setActionLoading(true);
    try {
      await fetchJson<PromotionWithUsage>("/api/promotions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotion_id: promotionForUpdate.promotion_id,
          ...updateForm,
          promo_code: updateForm.promo_code.trim(),
        }),
      });
      await loadPromotions();
      setPromotionForUpdate(null);
      setErrorMessage(null);
      setSuccessMessage("Promosi berhasil diperbarui.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memperbarui promosi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePromotion = async () => {
    if (!isAdmin) return;
    if (!promotionForDelete) return;

    setActionLoading(true);
    try {
      await fetchJson<{ message: string }>(
        `/api/promotions?id=${encodeURIComponent(promotionForDelete.promotion_id)}`,
        { method: "DELETE" }
      );
      await loadPromotions();
      setPromotionForDelete(null);
      setErrorMessage(null);
      setSuccessMessage("Promosi berhasil dihapus.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal menghapus promosi.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black font-head uppercase tracking-tighter">
            Daftar Promosi
          </h1>
          <p className="font-bold text-gray-700 mt-2">
            Daftar promo yang tersedia di platform TikTakTuk.
          </p>
        </div>
        {isAdmin && (
          <Button className="font-bold" onClick={openCreateModal}>
            + Buat Promo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Total Promo
            </p>
            <p className="text-2xl font-black font-head">{summary.totalPromotions}</p>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Total penggunaan semua promo
            </p>
            <p className="text-2xl font-black font-head">{summary.totalUsage}</p>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Total tipe persentase
            </p>
            <p className="text-2xl font-black font-head">
              {summary.totalPercentageTypePromotions}
            </p>
          </CardContent>
        </Card>
      </div>

      {successMessage && (
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#caffbf]">
          <CardContent className="p-4 font-bold">{successMessage}</CardContent>
        </Card>
      )}

      {errorMessage && (
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#ffadad]">
          <CardContent className="p-4 font-bold">{errorMessage}</CardContent>
        </Card>
      )}

      <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              value={searchQuery}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
              placeholder="Cari berdasarkan kode promo..."
              className="border-2 border-black font-bold"
            />
            <select
              value={discountTypeFilter}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setDiscountTypeFilter(
                  event.target.value as "All" | "PERCENTAGE" | "NOMINAL"
                )
              }
              className="w-full h-11 px-3 border-2 border-black bg-white rounded font-bold"
            >
              <option value="All">Semua</option>
              <option value="PERCENTAGE">Persentase</option>
              <option value="NOMINAL">Nominal</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black text-left">
              <thead>
                <tr className="bg-zinc-100 border-b-2 border-black">
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Kode Promo
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Tipe Diskon
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Nilai Diskon
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Tanggal Mulai
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Tanggal Berakhir
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Penggunaan
                  </th>
                  {isAdmin && (
                    <th className="p-3 text-xs font-black uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="p-4 text-sm font-bold text-zinc-600"
                      colSpan={tableColSpan}
                    >
                      Memuat data promosi...
                    </td>
                  </tr>
                ) : filteredPromotions.length === 0 ? (
                  <tr>
                    <td
                      className="p-4 text-sm font-bold text-zinc-600"
                      colSpan={tableColSpan}
                    >
                      Tidak ada data promosi.
                    </td>
                  </tr>
                ) : (
                  filteredPromotions.map((promotion) => (
                    <tr
                      key={promotion.promotion_id}
                      className="border-b border-black/20"
                    >
                      <td className="p-3 text-sm font-bold">{promotion.promo_code}</td>
                      <td className="p-3 text-sm font-bold">
                        {promotion.discount_type === "PERCENTAGE" ? "Persentase" : "Nominal"}
                      </td>
                      <td className="p-3 text-sm font-bold">
                        {formatDiscountLabel(promotion)}
                      </td>
                      <td className="p-3 text-sm font-bold">{promotion.start_date}</td>
                      <td className="p-3 text-sm font-bold">{promotion.end_date}</td>
                      <td className="p-3 text-sm font-bold">
                        {promotion.used_count}/{promotion.usage_limit}
                      </td>
                      {isAdmin && (
                        <td className="p-3 text-sm font-bold">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              className="h-9 px-3 font-bold"
                              onClick={() => openUpdateModal(promotion)}
                            >
                              Update
                            </Button>
                            <Button
                              type="button"
                              className="h-9 px-3 font-bold bg-red-500 hover:bg-red-600"
                              onClick={() => openDeleteModal(promotion)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAdmin && isCreateOpen} onOpenChange={setIsCreateOpen}>
        <Dialog.Content size="lg" className="border-4 border-black">
          <Dialog.Header className="font-black text-lg">Buat Promosi</Dialog.Header>
          <div className="p-6 space-y-4">
            <PromotionForm
              values={createForm}
              onChange={updateCreateField}
              readOnlyId=""
              mode="create"
            />
          </div>
          <Dialog.Footer className="border-t-4 border-black">
            <Button
              type="button"
              variant="outline"
              className="border-2 border-black font-bold"
              disabled={actionLoading}
              onClick={closeCreateModal}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="font-bold"
              disabled={actionLoading}
              onClick={() => void handleCreatePromotion()}
            >
              {actionLoading ? "Menyimpan..." : "Buat"}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog
        open={isAdmin && Boolean(promotionForUpdate)}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeUpdateModal();
        }}
      >
        <Dialog.Content size="lg" className="border-4 border-black">
          <Dialog.Header className="font-black text-lg">Perbarui Promosi</Dialog.Header>
          <div className="p-6 space-y-4">
            <PromotionForm
              values={updateForm}
              onChange={updateUpdateField}
              readOnlyId={promotionForUpdate?.promotion_id ?? ""}
              mode="update"
            />
          </div>
          <Dialog.Footer className="border-t-4 border-black">
            <Button
              type="button"
              variant="outline"
              className="border-2 border-black font-bold"
              disabled={actionLoading}
              onClick={closeUpdateModal}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="font-bold"
              disabled={actionLoading}
              onClick={() => void handleUpdatePromotion()}
            >
              {actionLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog
        open={isAdmin && Boolean(promotionForDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDeleteModal();
        }}
      >
        <Dialog.Content size="sm" className="border-4 border-black">
          <Dialog.Header className="font-black text-lg">Hapus Promosi</Dialog.Header>
          <div className="p-6 space-y-2">
            <p className="font-bold">
              Yakin ingin menghapus promo{" "}
              <span className="font-black">{promotionForDelete?.promo_code}</span>?
            </p>
            <p className="text-sm font-bold text-zinc-600">
              Jika dihapus, data promosi tidak dapat dikembalikan.
            </p>
          </div>
          <Dialog.Footer className="border-t-4 border-black">
            <Button
              type="button"
              variant="outline"
              className="border-2 border-black font-bold"
              disabled={actionLoading}
              onClick={closeDeleteModal}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="font-bold bg-red-500 hover:bg-red-600"
              disabled={actionLoading}
              onClick={() => void handleDeletePromotion()}
            >
              {actionLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}

function PromotionForm(props: {
  values: PromotionFormValues;
  onChange: <K extends keyof PromotionFormValues>(
    key: K,
    value: PromotionFormValues[K]
  ) => void;
  readOnlyId: string;
  mode: "create" | "update";
}) {
  const { values, onChange, readOnlyId, mode } = props;

  return (
    <>
      {mode === "update" && (
        <div className="space-y-2">
          <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
            ID Promosi
          </label>
          <Input
            readOnly
            value={readOnlyId}
            className="border-2 border-black bg-zinc-100 font-bold"
          />
        </div>
      )}
      <div className="space-y-2">
        <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
          Kode Promo *
        </label>
        <Input
          value={values.promo_code}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("promo_code", event.target.value)}
          className="border-2 border-black font-bold"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
            Tipe Diskon *
          </label>
          <select
            value={values.discount_type}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              onChange(
                "discount_type",
                event.target.value as PromotionFormValues["discount_type"]
              )
            }
            className="w-full h-11 px-3 border-2 border-black bg-white rounded font-bold"
          >
            <option value="PERCENTAGE">Persentase</option>
            <option value="NOMINAL">Nominal</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
            Nilai Diskon *
          </label>
          <Input
            type="number"
            min={1}
            step={1}
            value={Number.isNaN(values.discount_value) ? "" : values.discount_value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onChange("discount_value", Number(event.target.value))
            }
            className="border-2 border-black font-bold"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
            Tanggal Mulai *
          </label>
          <Input
            type="date"
            value={values.start_date}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("start_date", event.target.value)}
            className="border-2 border-black font-bold"
          />
        </div>
        <div className="space-y-2">
          <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
            Tanggal Berakhir *
          </label>
          <Input
            type="date"
            value={values.end_date}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("end_date", event.target.value)}
            className="border-2 border-black font-bold"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
          Batas Penggunaan *
        </label>
        <Input
          type="number"
          min={1}
          step={1}
          value={Number.isNaN(values.usage_limit) ? "" : values.usage_limit}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("usage_limit", Number(event.target.value))}
          className="border-2 border-black font-bold"
        />
      </div>
    </>
  );
}
