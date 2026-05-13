"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Dialog } from "@/components/retroui/Dialog";
import {
  deleteOrderById,
  getAllOrders,
  getOrdersByCustomerId,
  getOrdersByOrganizerId,
  updateOrderById,
} from "@/lib/orderStore";
import { Order, PaymentStatus } from "@/lib/types/order";

type OrdersClientProps = {
  role: "admin" | "organizer" | "customer";
  customerId?: string;
  organizerId?: string;
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const statusOptions: Array<"All" | PaymentStatus> = [
  "All",
  "Paid",
  "Pending",
  "Cancelled",
];

function getBaseOrders(props: OrdersClientProps) {
  if (props.role === "admin") return getAllOrders();
  if (props.role === "organizer" && props.organizerId) {
    return getOrdersByOrganizerId(props.organizerId);
  }
  if (props.role === "customer" && props.customerId) {
    return getOrdersByCustomerId(props.customerId);
  }
  return [];
}

export default function OrdersClient(props: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(() => getBaseOrders(props));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PaymentStatus>("All");
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState<Order | null>(null);
  const [selectedOrderForDelete, setSelectedOrderForDelete] = useState<Order | null>(null);
  const [updateStatusValue, setUpdateStatusValue] = useState<PaymentStatus>("Pending");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAdmin = props.role === "admin";
  const heading = isAdmin
    ? "Semua Order"
    : props.role === "organizer"
      ? "Order Event Saya"
      : "Pesanan Saya";

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch = order.order_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || order.payment_status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      );
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const paidOrders = filteredOrders.filter(
      (order) => order.payment_status === "Paid"
    ).length;
    const pendingOrders = filteredOrders.filter(
      (order) => order.payment_status === "Pending"
    ).length;
    const totalRevenue = filteredOrders.reduce(
      (accumulator, order) => accumulator + order.total_amount,
      0
    );
    return { totalOrders, paidOrders, pendingOrders, totalRevenue };
  }, [filteredOrders]);

  const openUpdateModal = (order: Order) => {
    setSelectedOrderForUpdate(order);
    setUpdateStatusValue(order.payment_status);
    setSuccessMessage(null);
  };

  const closeUpdateModal = () => {
    setSelectedOrderForUpdate(null);
  };

  const confirmUpdate = () => {
    if (!selectedOrderForUpdate) return;
    const updated = updateOrderById(selectedOrderForUpdate.order_id, {
      payment_status: updateStatusValue,
    });
    if (!updated) return;

    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order.order_id === selectedOrderForUpdate.order_id
          ? { ...order, payment_status: updateStatusValue }
          : order
      )
    );
    setSuccessMessage("Order berhasil diperbarui.");
    closeUpdateModal();
  };

  const openDeleteModal = (order: Order) => {
    setSelectedOrderForDelete(order);
    setSuccessMessage(null);
  };

  const closeDeleteModal = () => {
    setSelectedOrderForDelete(null);
  };

  const confirmDelete = () => {
    if (!selectedOrderForDelete) return;
    const deleted = deleteOrderById(selectedOrderForDelete.order_id);
    if (!deleted) return;

    setOrders((previousOrders) =>
      previousOrders.filter(
        (order) => order.order_id !== selectedOrderForDelete.order_id
      )
    );
    setSuccessMessage("Order berhasil dihapus.");
    closeDeleteModal();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-black font-head uppercase tracking-tighter">
          {heading}
        </h1>
        <p className="font-bold text-gray-700 mt-2">
          Daftar order berdasarkan hak akses role login.
        </p>
      </div>

      {successMessage && (
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#caffbf]">
          <CardContent className="p-4 font-bold">{successMessage}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Total Orders
            </p>
            <p className="text-2xl font-black font-head">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Paid Orders
            </p>
            <p className="text-2xl font-black font-head">{stats.paidOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Pending Orders
            </p>
            <p className="text-2xl font-black font-head">{stats.pendingOrders}</p>
          </CardContent>
        </Card>
        {(props.role === "admin" || props.role === "organizer") && (
          <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Total Revenue
              </p>
              <p className="text-2xl font-black font-head">
                {formatRupiah(stats.totalRevenue)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-4 border-black shadow-[6px_6px_0_0_#000]">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={searchQuery}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
              placeholder="Cari berdasarkan Order ID..."
              className="h-11 px-3 border-2 border-black bg-white rounded font-bold"
            />
            <select
              value={statusFilter}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(event.target.value as "All" | PaymentStatus)
              }
              className="h-11 px-3 border-2 border-black bg-white rounded font-bold"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black text-left">
              <thead>
                <tr className="bg-zinc-100 border-b-2 border-black">
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="p-3 text-xs font-black uppercase tracking-wider">
                    Total Amount
                  </th>
                  {isAdmin && (
                    <th className="p-3 text-xs font-black uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      className="p-4 text-sm font-bold text-zinc-600"
                      colSpan={isAdmin ? 5 : 4}
                    >
                      Tidak ada data order yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.order_id} className="border-b border-black/20">
                      <td className="p-3 text-sm font-bold break-all">{order.order_id}</td>
                      <td className="p-3 text-sm font-bold">
                        {new Date(order.order_date).toLocaleString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-3 text-sm font-bold">
                        {order.payment_status}
                      </td>
                      <td className="p-3 text-sm font-bold">
                        {formatRupiah(order.total_amount)}
                      </td>
                      {isAdmin && (
                        <td className="p-3 text-sm font-bold">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              className="h-9 px-3 font-bold"
                              onClick={() => openUpdateModal(order)}
                            >
                              Update
                            </Button>
                            <Button
                              type="button"
                              className="h-9 px-3 font-bold bg-red-500 hover:bg-red-600"
                              onClick={() => openDeleteModal(order)}
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

      <Dialog
        open={Boolean(selectedOrderForUpdate)}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeUpdateModal();
        }}
      >
        <Dialog.Content size="md" className="border-4 border-black">
          <Dialog.Header className="font-black text-lg">Update Order</Dialog.Header>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
                Order ID
              </label>
              <input
                readOnly
                value={selectedOrderForUpdate?.order_id ?? ""}
                className="w-full h-11 px-3 border-2 border-black bg-zinc-100 rounded font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-sm uppercase tracking-wider text-zinc-600">
                Payment Status
              </label>
              <select
                value={updateStatusValue}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setUpdateStatusValue(event.target.value as PaymentStatus)
                }
                className="w-full h-11 px-3 border-2 border-black bg-white rounded font-bold"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
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
            <Button type="button" className="font-bold" onClick={confirmUpdate}>
              Update
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog
        open={Boolean(selectedOrderForDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDeleteModal();
        }}
      >
        <Dialog.Content size="sm" className="border-4 border-black">
          <Dialog.Header className="font-black text-lg">Hapus Order</Dialog.Header>
          <div className="p-6 space-y-2">
            <p className="font-bold">
              Kamu yakin ingin menghapus order berikut?
            </p>
            <p className="text-sm font-black break-all">
              {selectedOrderForDelete?.order_id}
            </p>
            <p className="text-sm font-bold text-zinc-600">
              Tindakan ini tidak dapat dibatalkan.
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
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
