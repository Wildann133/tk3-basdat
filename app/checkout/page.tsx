import { redirect } from "next/navigation";
import CheckoutClient from "@/components/orders/CheckoutClient";
import { getSession } from "@/lib/auth";
import { getCheckoutPageData } from "@/lib/orders";

type CheckoutPageProps = {
  searchParams: Promise<{
    eventId?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "customer") {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const eventId = resolvedSearchParams.eventId;
  if (!eventId) {
    redirect("/events");
  }

  const checkoutData = await getCheckoutPageData(session.user_id, eventId);
  if (!checkoutData) {
    redirect("/events");
  }

  return (
    <CheckoutClient
      event={checkoutData.event}
      venue={checkoutData.venue}
      ticketCategories={checkoutData.ticketCategories}
      availableSeats={checkoutData.availableSeats}
      promotions={checkoutData.promotions}
    />
  );
}
