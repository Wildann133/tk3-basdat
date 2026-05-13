"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import {
  calculateDiscountedTotal,
  findPromotionByCode,
} from "@/lib/dummyData";
import { createOrder } from "@/lib/orderStore";
import { AppliedPromotion, CheckoutFormState, Order, TicketCategory } from "@/lib/types/order";

type CheckoutClientProps = {
  event: {
    event_id: string;
    event_title: string;
    event_datetime: string;
  };
  venue: {
    venue_id: string;
    venue_name: string;
    seating_type: string;
  };
  ticketCategories: TicketCategory[];
  customerId: string;
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

function parseSeats(seatsInput: string) {
  return seatsInput
    .split(",")
    .map((seat) => seat.trim())
    .filter(Boolean);
}

export default function CheckoutClient({
  event,
  venue,
  ticketCategories,
  customerId,
}: CheckoutClientProps) {
  const [formState, setFormState] = useState<CheckoutFormState>({
    ticketCategoryId: "",
    quantity: 1,
    seatsInput: "",
    promoCodeInput: "",
  });
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<AppliedPromotion | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const selectedCategory = useMemo(
    () =>
      ticketCategories.find(
        (category) => category.id === formState.ticketCategoryId
      ) ?? null,
    [formState.ticketCategoryId, ticketCategories]
  );

  const subtotal = selectedCategory ? selectedCategory.price * formState.quantity : 0;
  const pricing = useMemo(
    () => calculateDiscountedTotal({ subtotal, promoCode: appliedPromoCode }),
    [subtotal, appliedPromoCode]
  );
  const isReservedSeating = venue.seating_type === "reserved seating";

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

    const simulatedPricing = calculateDiscountedTotal({
      subtotal,
      promoCode: rawCode,
    });
    setAppliedPromoCode(promotion.promo_code);
    setAppliedPromotion({
      promotionId: promotion.promotion_id,
      promoCode: promotion.promo_code,
      discountAmount: simulatedPricing.discountAmount,
    });
    setErrorMessage("");
  };

  const handleSubmit = (eventSubmit: React.FormEvent) => {
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

    const selectedSeats = parseSeats(formState.seatsInput);
    if (isReservedSeating && selectedSeats.length > formState.quantity) {
      setErrorMessage("Jumlah kursi yang dipilih tidak boleh melebihi jumlah tiket.");
      return;
    }

    const newOrder: Order = {
      order_id: crypto.randomUUID(),
      order_date: new Date().toISOString(),
      payment_status: "Pending",
      total_amount: pricing.totalAmount,
      customer_id: customerId,
      event_id: event.event_id,
      ticket_category_id: selectedCategory.id,
      ticket_category_name: selectedCategory.name,
      ticket_price: selectedCategory.price,
      quantity: formState.quantity,
      selected_seats: selectedSeats,
      promo_code: appliedPromotion?.promoCode ?? null,
      discount_amount: pricing.discountAmount,
      subtotal_amount: subtotal,
    };

    createOrder(newOrder);
    setSuccessOrder(newOrder);
    setErrorMessage("");
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
                  <option key={category.id} value={category.id}>
                    {category.name} - {formatRupiah(category.price)}
                  </option>
                ))}
              </select>
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
                  setFormState((prev) => ({
                    ...prev,
                    quantity: Number(eventChange.target.value),
                  }))
                }
                className="border-2 border-black font-bold"
                required
              />
            </div>

            {isReservedSeating && (
              <div className="space-y-2">
                <label className="font-bold text-sm uppercase tracking-wider">
                  Pilih Kursi (Opsional)
                </label>
                <Input
                  placeholder="Contoh: A1, A2, A3"
                  value={formState.seatsInput}
                  onChange={(eventChange: React.ChangeEvent<HTMLInputElement>) =>
                    setFormState((prev) => ({
                      ...prev,
                      seatsInput: eventChange.target.value,
                    }))
                  }
                  className="border-2 border-black font-bold"
                />
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

            <Button type="submit" className="w-full font-black text-lg py-6 uppercase">
              Buat Pesanan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
