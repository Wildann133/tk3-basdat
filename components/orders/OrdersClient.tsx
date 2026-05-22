"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Dialog } from "@/components/retroui/Dialog";
import { fetchJson } from "@/lib/api";
import { PaymentStatus, PersistedOrder } from "@/lib/types/order";

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

/** Display labels for DB/API values `Paid` | `Pending` | `Cancelled`. */
const paymentStatusLabel: Record<PaymentStatus, string> = {
  Paid: "Lunas",
  Pending: "Pending",
  Cancelled: "Dibatalkan",
};

const filterStatusOptions: Array<{ value: "All" | PaymentStatus; label: string }> = [
  { value: "All", label: "Semua" },
  { value: "Paid", label: "Lunas" },
  { value: "Pending", label: "Pending" },
  { value: "Cancelled", label: "Dibatalkan" },
];

export default function OrdersClient(props: OrdersClientProps) {
  const [orders, setOrders] = useState<PersistedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PaymentStatus>("All");
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState<PersistedOrder | null>(null);
  const [selectedOrderForDelete, setSelectedOrderForDelete] = useState<PersistedOrder | null>(null);
  const [updateStatusValue, setUpdateStatusValue] = useState<PaymentStatus>("Pending");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = props.role === "admin";
  const heading = isAdmin
    ? "Semua Order"
    : props.role === "organizer"
      ? "Order Event Saya"
      : "Pesanan Saya";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await fetchJson<PersistedOrder[]>("/api/orders");
        if (!cancelled) {
          setOrders(result);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Gagal memuat daftar order."
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
    // Align with organizer dashboard revenue: only Paid orders count toward Total Revenue.
    const totalRevenue =
      props.role === "admin" || props.role === "organizer"
        ? filteredOrders
            .filter((order) => order.payment_status === "Paid")
            .reduce((accumulator, order) => accumulator + order.total_amount, 0)
        : 0;
    return { totalOrders, paidOrders, pendingOrders, totalRevenue };
  }, [filteredOrders, props.role]);

  const openUpdateModal = (order: PersistedOrder) => {
    setSelectedOrderForUpdate(order);
    setUpdateStatusValue(order.payment_status);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const closeUpdateModal = () => {
    setSelectedOrderForUpdate(null);
  };

  const confirmUpdate = async () => {
    if (!selectedOrderForUpdate) return;

    setActionLoading(true);
    try {
      const updated = await fetchJson<PersistedOrder>("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrderForUpdate.order_id,
          payment_status: updateStatusValue,
        }),
      });

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.order_id === updated.order_id ? updated : order
        )
      );
      setSuccessMessage("Order berhasil diperbarui.");
      setErrorMessage(null);
      closeUpdateModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengupdate order."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (order: PersistedOrder) => {
    setSelectedOrderForDelete(order);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const closeDeleteModal = () => {
    setSelectedOrderForDelete(null);
  };

  const confirmDelete = async () => {
    if (!selectedOrderForDelete) return;

    setActionLoading(true);
    try {
      await fetchJson<{ message: string }>(
        `/api/orders?id=${selectedOrderForDelete.order_id}`,
        { method: "DELETE" }
      );

      setOrders((previousOrders) =>
        previousOrders.filter(
          (order) => order.order_id !== selectedOrderForDelete.order_id
        )
      );
      setSuccessMessage("Order berhasil dihapus.");
      setErrorMessage(null);
      closeDeleteModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus order."
      );
    } finally {
      setActionLoading(false);
    }
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

      {errorMessage && (
        <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-red-100">
          <CardContent className="p-4 font-bold text-red-700">{errorMessage}</CardContent>
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
              {filterStatusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
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
                    Status Pembayaran
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
                {loading ? (
                  <tr>
                    <td
                      className="p-4 text-sm font-bold text-zinc-600"
                      colSpan={isAdmin ? 5 : 4}
                    >
                      Memuat data order...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
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
                        {paymentStatusLabel[order.payment_status]}
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
                              Perbarui
                            </Button>
                            <Button
                              type="button"
                              className="h-9 px-3 font-bold bg-red-500 hover:bg-red-600"
                              onClick={() => openDeleteModal(order)}
                            >
                              Hapus
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
          <Dialog.Header className="font-black text-lg">Perbarui Order</Dialog.Header>
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
                Status Pembayaran
              </label>
              <select
                value={updateStatusValue}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setUpdateStatusValue(event.target.value as PaymentStatus)
                }
                className="w-full h-11 px-3 border-2 border-black bg-white rounded font-bold"
              >
                <option value="Paid">{paymentStatusLabel.Paid}</option>
                <option value="Pending">{paymentStatusLabel.Pending}</option>
                <option value="Cancelled">{paymentStatusLabel.Cancelled}</option>
              </select>
            </div>
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
              onClick={confirmUpdate}
            >
              {actionLoading ? "Memperbarui..." : "Perbarui"}
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
              disabled={actionLoading}
              onClick={closeDeleteModal}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="font-bold bg-red-500 hover:bg-red-600"
              disabled={actionLoading}
              onClick={confirmDelete}
            >
              {actionLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
