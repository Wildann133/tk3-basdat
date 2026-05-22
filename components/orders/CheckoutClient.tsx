"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { fetchJson } from "@/lib/api";
import {
  AppliedPromotion,
  CheckoutEvent,
  CheckoutFormState,
  CheckoutPromotion,
  CheckoutSeat,
  CheckoutVenue,
  Order,
  TicketCategory,
} from "@/lib/types/order";

type CheckoutClientProps = {
  event: CheckoutEvent;
  venue: CheckoutVenue;
  ticketCategories: TicketCategory[];
  availableSeats: CheckoutSeat[];
  promotions: CheckoutPromotion[];
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function CheckoutClient({
  event,
  venue,
  ticketCategories,
  availableSeats,
  promotions,
}: CheckoutClientProps) {
  const [formState, setFormState] = useState<CheckoutFormState>({
    ticketCategoryId: "",
    quantity: 1,
    selectedSeatIds: [],
    promoCodeInput: "",
  });
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<AppliedPromotion | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = useMemo(
    () =>
      ticketCategories.find(
        (category) => category.id === formState.ticketCategoryId
      ) ?? null,
    [formState.ticketCategoryId, ticketCategories]
  );

  const subtotal = selectedCategory ? selectedCategory.price * formState.quantity : 0;
  const findPromotionByCode = useCallback(
    (promoCode: string) => {
      const normalized = promoCode.trim().toLowerCase();
      if (!normalized) return null;
      return (
        promotions.find((promotion) => promotion.promoCode.toLowerCase() === normalized) ?? null
      );
    },
    [promotions]
  );

  const calculateDiscountedTotal = useCallback(
    (promoCode?: string) => {
      const promo = promoCode ? findPromotionByCode(promoCode) : null;
      if (!promo) {
        return {
          promo: null,
          discountAmount: 0,
          totalAmount: subtotal,
        };
      }

      const discountAmount =
        promo.discountType === "PERCENTAGE"
          ? Math.floor((subtotal * promo.discountValue) / 100)
          : promo.discountValue;
      const clampedDiscount = Math.min(subtotal, Math.max(0, discountAmount));

      return {
        promo,
        discountAmount: clampedDiscount,
        totalAmount: subtotal - clampedDiscount,
      };
    },
    [findPromotionByCode, subtotal]
  );

  const pricing = useMemo(
    () => calculateDiscountedTotal(appliedPromoCode),
    [appliedPromoCode, calculateDiscountedTotal]
  );
  const isReservedSeating = venue.seating_type === "reserved seating";
  const selectedSeatCount = formState.selectedSeatIds.filter(Boolean).length;

  const getSeatLabel = (seat: CheckoutSeat) =>
    `${seat.section} - Baris ${seat.row} - No. ${seat.number}`;

  const handleQuantityChange = (quantityValue: number) => {
    const nextQuantity = Number.isInteger(quantityValue) ? quantityValue : 1;
    setFormState((prev) => ({
      ...prev,
      quantity: nextQuantity,
      selectedSeatIds: prev.selectedSeatIds.slice(0, Math.max(0, nextQuantity)),
    }));
  };

  const handleSeatChange = (index: number, seatId: string) => {
    setFormState((prev) => {
      const nextSeatIds = [...prev.selectedSeatIds];
      nextSeatIds[index] = seatId;
      return {
        ...prev,
        selectedSeatIds: nextSeatIds,
      };
    });
    setErrorMessage("");
  };

  const handleApplyPromo = () => {
    const rawCode = formState.promoCodeInput.trim();
    if (!rawCode) {
      setAppliedPromoCode("");
      setAppliedPromotion(null);
      setErrorMessage("");
      return;
    }

    const promotion = findPromotionByCode(rawCode);
    if (!promotion) {
      setErrorMessage("Kode promo tidak ditemukan.");
      setAppliedPromoCode("");
      setAppliedPromotion(null);
      return;
    }

    const simulatedPricing = calculateDiscountedTotal(rawCode);
    setAppliedPromoCode(promotion.promoCode);
    setAppliedPromotion({
      promotionId: promotion.promotionId,
      promoCode: promotion.promoCode,
      discountAmount: simulatedPricing.discountAmount,
    });
    setErrorMessage("");
  };

  const handleSubmit = async (eventSubmit: React.FormEvent) => {
    eventSubmit.preventDefault();

    if (!formState.ticketCategoryId) {
      setErrorMessage("Kategori tiket wajib dipilih.");
      return;
    }

    if (
      !Number.isInteger(formState.quantity) ||
      formState.quantity < 1 ||
      formState.quantity > 10
    ) {
      setErrorMessage("Jumlah tiket harus bilangan bulat antara 1 sampai 10.");
      return;
    }

    if (!selectedCategory) {
      setErrorMessage("Kategori tiket tidak valid.");
      return;
    }

    if (formState.quantity > selectedCategory.remainingCapacity) {
      setErrorMessage(`Sisa tiket kategori ${selectedCategory.name} hanya ${selectedCategory.remainingCapacity}.`);
      return;
    }

    const selectedSeats = formState.selectedSeatIds.filter(Boolean);
    if (isReservedSeating) {
      if (selectedSeats.length !== formState.quantity) {
        setErrorMessage("Pilih kursi sesuai jumlah tiket.");
        return;
      }

      if (new Set(selectedSeats).size !== selectedSeats.length) {
        setErrorMessage("Kursi yang dipilih tidak boleh duplikat.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const newOrder = await fetchJson<Order>("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.event_id,
          ticket_category_id: selectedCategory.id,
          quantity: formState.quantity,
          seats_input: selectedSeats.join(","),
          promo_code: appliedPromotion?.promoCode ?? "",
        }),
      });

      setSuccessOrder(newOrder);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal membuat pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="max-w-2xl mx-auto border-4 border-black shadow-[8px_8px_0_0_#000] bg-[#caffbf]">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-3xl font-black font-head">Pesanan Berhasil Dibuat</h1>
            <p className="font-bold">Order ID: {successOrder.order_id}</p>
            <p className="font-bold">Status Pembayaran: {successOrder.payment_status}</p>
            <p className="font-bold">
              Total Pembayaran: {formatRupiah(successOrder.total_amount)}
            </p>
            <div className="flex gap-3 pt-2">
              <Link href="/orders">
                <Button className="font-bold">Lihat Pesanan</Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="font-bold border-2 border-black">
                  Kembali ke Events
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-black font-head uppercase tracking-tighter">
          Checkout Tiket
        </h1>
        <p className="font-bold text-gray-700 mt-2">
          Lengkapi data pesanan untuk melanjutkan pembelian.
        </p>
      </div>

      <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-2xl font-black font-head">{event.event_title}</h2>
          <p className="font-bold text-sm">Venue: {venue.venue_name}</p>
          <p className="font-bold text-sm">
            Tanggal:{" "}
            {new Date(event.event_datetime).toLocaleString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </CardContent>
      </Card>

      <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
        <CardContent className="p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-bold text-sm uppercase tracking-wider">
                Kategori Tiket *
              </label>
              <select
                required
                value={formState.ticketCategoryId}
                onChange={(eventChange: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormState((prev) => ({
                    ...prev,
                    ticketCategoryId: eventChange.target.value,
                  }))
                }
                className="w-full h-11 px-3 border-2 border-black bg-white rounded font-bold"
              >
                <option value="">Pilih kategori tiket</option>
                {ticketCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    disabled={category.remainingCapacity <= 0}
                  >
                    {category.name} - {formatRupiah(category.price)} - Sisa {category.remainingCapacity}/{category.capacity}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <div className="border-2 border-black bg-[#f9f6ef] p-3 text-sm font-bold">
                  <div className="flex items-center justify-between gap-3">
                    <span>Sisa tiket kategori {selectedCategory.name}</span>
                    <span className={`border-2 border-black px-2 py-1 font-black ${selectedCategory.remainingCapacity > 0 ? "bg-[#a7c957]" : "bg-[#e63946] text-white"}`}>
                      {selectedCategory.remainingCapacity}/{selectedCategory.capacity}
                    </span>
                  </div>
                  <div className="mt-2 h-2 border-2 border-black bg-white">
                    <div
                      className="h-full bg-black"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((selectedCategory.capacity - selectedCategory.remainingCapacity) / selectedCategory.capacity) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm uppercase tracking-wider">
                Jumlah Tiket * (1-10)
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                step={1}
                value={formState.quantity}
                onChange={(eventChange: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuantityChange(Number(eventChange.target.value))
                }
                className="border-2 border-black font-bold"
                required
              />
            </div>

            {isReservedSeating && (
              <div className="space-y-3">
                <label className="font-bold text-sm uppercase tracking-wider">
                  Pilih Kursi *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: Math.max(0, formState.quantity) }).map((_, index) => {
                    const currentSeatId = formState.selectedSeatIds[index] ?? "";
                    const selectedByOtherDropdown = new Set(
                      formState.selectedSeatIds.filter((seatId, seatIndex) => seatId && seatIndex !== index)
                    );

                    return (
                      <select
                        key={index}
                        required
                        value={currentSeatId}
                        onChange={(eventChange: React.ChangeEvent<HTMLSelectElement>) =>
                          handleSeatChange(index, eventChange.target.value)
                        }
                        className="w-full h-11 px-3 border-2 border-black bg-white rounded font-bold"
                      >
                        <option value="">Kursi tiket #{index + 1}</option>
                        {availableSeats.map((seat) => (
                          <option
                            key={seat.seatId}
                            value={seat.seatId}
                            disabled={selectedByOtherDropdown.has(seat.seatId)}
                          >
                            {getSeatLabel(seat)}
                          </option>
                        ))}
                      </select>
                    );
                  })}
                </div>
                <p className="text-xs font-bold text-zinc-600">
                  {selectedSeatCount}/{formState.quantity} kursi dipilih dari {availableSeats.length} kursi tersedia.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-bold text-sm uppercase tracking-wider">
                Kode Promo (Opsional)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode promo"
                  value={formState.promoCodeInput}
                  onChange={(eventChange: React.ChangeEvent<HTMLInputElement>) =>
                    setFormState((prev) => ({
                      ...prev,
                      promoCodeInput: eventChange.target.value,
                    }))
                  }
                  className="border-2 border-black font-bold"
                />
                <Button type="button" onClick={handleApplyPromo} className="font-bold">
                  Apply
                </Button>
              </div>
              {appliedPromotion && !errorMessage && (
                <p className="text-green-700 font-bold text-sm">
                  Promo {appliedPromotion.promoCode} berhasil diterapkan.
                </p>
              )}
            </div>

            <div className="border-2 border-black p-4 bg-zinc-50 space-y-1">
              <p className="font-bold text-sm">Subtotal: {formatRupiah(subtotal)}</p>
              <p className="font-bold text-sm">
                Diskon: {formatRupiah(pricing.discountAmount)}
              </p>
              <p className="font-black text-xl">
                Total: {formatRupiah(pricing.totalAmount)}
              </p>
            </div>

            {errorMessage && <p className="text-red-600 font-bold text-sm">{errorMessage}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-black text-lg py-6 uppercase"
            >
              {isSubmitting ? "Membuat Pesanan..." : "Buat Pesanan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
