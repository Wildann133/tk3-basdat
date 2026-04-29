"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/retroui/Card";
import { getOrdersByCustomerId } from "@/lib/orderStore";

type OrdersClientProps = {
  customerId: string;
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function OrdersClient({ customerId }: OrdersClientProps) {
  const orders = useMemo(() => getOrdersByCustomerId(customerId), [customerId]);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-black font-head uppercase tracking-tighter">
          Pesanan Saya
        </h1>
        <p className="font-bold text-gray-700 mt-2">
          Daftar pesanan tiket yang sudah kamu buat.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-8">
            <p className="font-bold text-lg">Belum ada pesanan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <Card
              key={order.order_id}
              className="border-4 border-black shadow-[6px_6px_0_0_#000]"
            >
              <CardContent className="p-6 space-y-1">
                <p className="font-black text-sm break-all">Order ID: {order.order_id}</p>
                <p className="font-bold text-sm">
                  Tanggal:{" "}
                  {new Date(order.order_date).toLocaleString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="font-bold text-sm">Status: {order.payment_status}</p>
                <p className="font-bold text-sm">
                  Kategori: {order.ticket_category_name} x {order.quantity}
                </p>
                <p className="font-black text-lg">
                  Total: {formatRupiah(order.total_amount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
