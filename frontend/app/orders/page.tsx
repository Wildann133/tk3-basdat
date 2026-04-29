import { redirect } from "next/navigation";
import OrdersClient from "@/components/orders/OrdersClient";
import { getCustomerByUserId } from "@/lib/dummyData";
import { getSession } from "@/lib/auth";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "customer") {
    redirect("/dashboard");
  }

  const customer = getCustomerByUserId(session.user_id);
  if (!customer) {
    redirect("/dashboard");
  }

  return <OrdersClient customerId={customer.customer_id} />;
}
