import { redirect } from "next/navigation";
import OrdersClient from "@/components/orders/OrdersClient";
import { getCustomerByUserId, getOrganizerByUserId } from "@/lib/dummyData";
import { getSession } from "@/lib/auth";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  let customerId: string | undefined;
  let organizerId: string | undefined;

  if (session.role === "customer") {
    const customer = getCustomerByUserId(session.user_id);
    if (!customer) {
      redirect("/dashboard");
    }
    customerId = customer.customer_id;
  } else if (session.role === "organizer") {
    const organizer = getOrganizerByUserId(session.user_id);
    if (!organizer) {
      redirect("/dashboard");
    }
    organizerId = organizer.organizer_id;
  }

  return (
    <OrdersClient
      role={session.role}
      customerId={customerId}
      organizerId={organizerId}
    />
  );
}
