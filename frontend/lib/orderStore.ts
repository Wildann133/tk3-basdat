import { Order } from "@/lib/types/order";

const globalOrderState = globalThis as typeof globalThis & {
  __tiktaktukOrders?: Order[];
};

if (!globalOrderState.__tiktaktukOrders) {
  globalOrderState.__tiktaktukOrders = [];
}

const getStore = () => globalOrderState.__tiktaktukOrders as Order[];

export function createOrder(order: Order) {
  getStore().push(order);
}

export function getOrdersByCustomerId(customerId: string) {
  return getStore()
    .filter((order) => order.customer_id === customerId)
    .sort(
      (a, b) =>
        new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
}
