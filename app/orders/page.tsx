import { redirect } from "next/navigation";
import OrdersClient from "@/components/orders/OrdersClient";
import { getSession } from "@/lib/auth";
import { getCustomerIdByUserId, getOrganizerIdByUserId } from "@/lib/orders";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  let customerId: string | undefined;
  let organizerId: string | undefined;

  if (session.role === "customer") {
    customerId = (await getCustomerIdByUserId(session.user_id)) ?? undefined;
    if (!customerId) {
      redirect("/dashboard");
    }
  } else if (session.role === "organizer") {
    organizerId = (await getOrganizerIdByUserId(session.user_id)) ?? undefined;
    if (!organizerId) {
      redirect("/dashboard");
    }
  }

  return (
    <OrdersClient
      role={session.role}
      customerId={customerId}
      organizerId={organizerId}
    />
  );
}
