import { Order } from "@/lib/types/order";
import { EVENTS } from "@/lib/dummyData";

const globalOrderState = globalThis as typeof globalThis & {
  __tiktaktukOrders?: Order[];
};

if (!globalOrderState.__tiktaktukOrders) {
  globalOrderState.__tiktaktukOrders = [];
}

const getStore = () => globalOrderState.__tiktaktukOrders as Order[];
const sortByOrderDateDesc = (orders: Order[]) =>
  [...orders].sort(
    (a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
  );

export function createOrder(order: Order) {
  getStore().push(order);
}

export function getAllOrders() {
  return sortByOrderDateDesc(getStore());
}

export function getOrdersByCustomerId(customerId: string) {
  return sortByOrderDateDesc(
    getStore().filter((order) => order.customer_id === customerId)
  );
}

export function getOrdersByOrganizerId(organizerId: string) {
  const organizerEventIds = new Set(
    EVENTS.filter((event) => event.organizer_id === organizerId).map(
      (event) => event.event_id
    )
  );
  return sortByOrderDateDesc(
    getStore().filter((order) => organizerEventIds.has(order.event_id))
  );
}

export function updateOrderById(
  orderId: string,
  patch: Partial<Pick<Order, "payment_status" | "total_amount">>
) {
  const order = getStore().find((item) => item.order_id === orderId);
  if (!order) return null;

  if (patch.payment_status !== undefined) {
    order.payment_status = patch.payment_status;
  }
  if (patch.total_amount !== undefined) {
    order.total_amount = patch.total_amount;
  }

  return order;
}

export function deleteOrderById(orderId: string) {
  const currentStore = getStore();
  const index = currentStore.findIndex((item) => item.order_id === orderId);
  if (index < 0) return false;
  currentStore.splice(index, 1);
  return true;
}
