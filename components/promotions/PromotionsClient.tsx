"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Dialog } from "@/components/retroui/Dialog";
import { Input } from "@/components/retroui/Input";
import {
  createPromotion,
  deletePromotionById,
  getAllPromotions,
  getPromotionUsageSnapshot,
  isPromoCodeUnique,
  updatePromotionById,
} from "@/lib/promotionStore";
import { Promotion, PromotionFormValues } from "@/lib/types/promotion";

const defaultFormValues: PromotionFormValues = {
  promo_code: "",
  discount_type: "PERCENTAGE",
  discount_value: 0,
  start_date: "",
  end_date: "",
  usage_limit: 1,
};

type UserRole = "admin" | "organizer" | "customer" | "guest";

const formatDiscountLabel = (promotion: Promotion) => {
  if (promotion.discount_type === "PERCENTAGE") {
    return `${promotion.discount_value}%`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(promotion.discount_value);
};

function validatePromotionForm(
  values: PromotionFormValues,
  excludePromotionId?: string
) {
  if (!values.promo_code.trim()) {
    return "Promo Code wajib diisi.";
  }
  if (!isPromoCodeUnique(values.promo_code, excludePromotionId)) {
    return "Promo Code harus unik.";
  }
  if (values.discount_value <= 0) {
    return "Discount Value harus lebih dari 0.";
  }
  if (!values.start_date) {
    return "Start Date wajib diisi.";
  }
  if (!values.end_date) {
    return "End Date wajib diisi.";
  }
  if (values.end_date < values.start_date) {
    return "End Date harus sama atau setelah Start Date.";
  }
  if (!Number.isInteger(values.usage_limit) || values.usage_limit <= 0) {
    return "Usage Limit harus bilangan bulat lebih dari 0.";
  }
  return null;
}

export default function PromotionsClient({ role }: { role: UserRole }) {
  const [promotions, setPromotions] = useState<Promotion[]>(() => getAllPromotions());
  const [searchQuery, setSearchQuery] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState<
    "All" | "PERCENTAGE" | "NOMINAL"
  >("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [promotionForUpdate, setPromotionForUpdate] = useState<Promotion | null>(null);
  const [promotionForDelete, setPromotionForDelete] = useState<Promotion | null>(null);
  const [createForm, setCreateForm] = useState<PromotionFormValues>(defaultFormValues);
  const [updateForm, setUpdateForm] = useState<PromotionFormValues>(defaultFormValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isAdmin = role === "admin";

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

  const usageByPromotionId = useMemo(() => {
    const usageMap = new Map<string, number>();
    getPromotionUsageSnapshot(promotions).forEach((usage) =>
      usageMap.set(usage.promotion_id, usage.used_count)
    );
    return usageMap;
  }, [promotions]);

  const summary = useMemo(() => {
    const totalPromotions = promotions.length;
    const totalUsage = getPromotionUsageSnapshot(promotions).reduce(
      (total, usage) => total + usage.used_count,
      0
    );
    const totalPercentageTypePromotions = promotions.filter(
      (promotion) => promotion.discount_type === "PERCENTAGE"
    ).length;
    return { totalPromotions, totalUsage, totalPercentageTypePromotions };
  }, [promotions]);

  const refreshPromotions = () => {
    setPromotions(getAllPromotions());
  };

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

  const openUpdateModal = (promotion: Promotion) => {
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

  const openDeleteModal = (promotion: Promotion) => {
    if (!isAdmin) return;
    setPromotionForDelete(promotion);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const closeDeleteModal = () => {
    setPromotionForDelete(null);
  };

  const handleCreatePromotion = () => {
    if (!isAdmin) return;
    const validationMessage = validatePromotionForm(createForm);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    createPromotion({
      ...createForm,
      promo_code: createForm.promo_code.trim(),
    });
    refreshPromotions();
    setIsCreateOpen(false);
    setErrorMessage(null);
    setSuccessMessage("Promotion berhasil dibuat.");
  };

  const handleUpdatePromotion = () => {
    if (!isAdmin) return;
    if (!promotionForUpdate) return;

    const validationMessage = validatePromotionForm(
      updateForm,
      promotionForUpdate.promotion_id
    );
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const updated = updatePromotionById(promotionForUpdate.promotion_id, {
      ...updateForm,
      promo_code: updateForm.promo_code.trim(),
    });
    if (!updated) {
      setErrorMessage("Promotion tidak ditemukan.");
      return;
    }
    refreshPromotions();
    setPromotionForUpdate(null);
    setErrorMessage(null);
    setSuccessMessage("Promotion berhasil diperbarui.");
  };

  const handleDeletePromotion = () => {
    if (!isAdmin) return;
    if (!promotionForDelete) return;
    const deleted = deletePromotionById(promotionForDelete.promotion_id);
    if (!deleted) {
      setErrorMessage("Promotion tidak ditemukan.");
      return;
    }
    refreshPromotions();
    setPromotionForDelete(null);
    setErrorMessage(null);
    setSuccessMessage("Promotion berhasil dihapus.");
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
            + Create Promo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Total Promotions
            </p>
            <p className="text-2xl font-black font-head">{summary.totalPromotions}</p>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Total Usage of All Promotions
            </p>
            <p className="text-2xl font-black font-head">{summary.totalUsage}</p>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Total Percentage-Type Promotions
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
              placeholder="Cari berdasarkan Promo Code..."
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
              <option value="All">All</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="NOMINAL">Fixed Amount</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black text-left">
              <thead>
                <tr className="bg-zinc-100 border-b-2 border-black">
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Promotion ID
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Promo Code
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Discount Type
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Discount Value
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Usage
                  </th>
                  {isAdmin && (
                    <th className="p-3 text-xs font-black uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.length === 0 ? (
                  <tr>
                    <td
                      className="p-4 text-sm font-bold text-zinc-600"
                      colSpan={isAdmin ? 8 : 7}
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
                      <td className="p-3 text-sm font-bold">{promotion.promotion_id}</td>
                      <td className="p-3 text-sm font-bold">{promotion.promo_code}</td>
                      <td className="p-3 text-sm font-bold">
                        {promotion.discount_type === "PERCENTAGE"
                          ? "Percentage"
                          : "Fixed Amount"}
                      </td>
                      <td className="p-3 text-sm font-bold">
                        {formatDiscountLabel(promotion)}
                      </td>
                      <td className="p-3 text-sm font-bold">{promotion.start_date}</td>
                      <td className="p-3 text-sm font-bold">{promotion.end_date}</td>
                      <td className="p-3 text-sm font-bold">
                        {usageByPromotionId.get(promotion.promotion_id) ?? 0}/
                        {promotion.usage_limit}
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
          <Dialog.Header className="font-black text-lg">Create Promotion</Dialog.Header>
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
              onClick={closeCreateModal}
            >
              Cancel
            </Button>
            <Button type="button" className="font-bold" onClick={handleCreatePromotion}>
              Create
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
          <Dialog.Header className="font-black text-lg">Update Promotion</Dialog.Header>
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
              onClick={closeUpdateModal}
            >
              Cancel
            </Button>
            <Button type="button" className="font-bold" onClick={handleUpdatePromotion}>
              Save
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
          <Dialog.Header className="font-black text-lg">Delete Promotion</Dialog.Header>
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
              onClick={closeDeleteModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="font-bold bg-red-500 hover:bg-red-600"
              onClick={handleDeletePromotion}
            >
              Delete
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
            Promotion ID
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
          Promo Code *
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
            Discount Type *
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
            <option value="PERCENTAGE">Percentage</option>
            <option value="NOMINAL">Fixed Amount</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
            Discount Value *
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
            Start Date *
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
            End Date *
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
          Usage Limit *
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
