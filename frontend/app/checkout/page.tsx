import { redirect } from "next/navigation";
import CheckoutClient from "@/components/orders/CheckoutClient";
import {
  EVENTS,
  VENUES,
  getCustomerByUserId,
  getTicketCategoriesByEventId,
} from "@/lib/dummyData";
import { getSession } from "@/lib/auth";

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

  const customer = getCustomerByUserId(session.user_id);
  if (!customer) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const eventId = resolvedSearchParams.eventId;
  if (!eventId) {
    redirect("/events");
  }

  const event = EVENTS.find((eventItem) => eventItem.event_id === eventId);
  if (!event) {
    redirect("/events");
  }

  const venue = VENUES.find((venueItem) => venueItem.venue_id === event.venue_id);
  const ticketCategories = getTicketCategoriesByEventId(event.event_id);
  if (!venue || ticketCategories.length === 0) {
    redirect("/events");
  }

  return (
    <CheckoutClient
      event={event}
      venue={venue}
      ticketCategories={ticketCategories}
      customerId={customer.customer_id}
    />
  );
}
