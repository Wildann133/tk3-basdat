import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventManager from "@/components/dashboard/events/EventManager";

export default async function EventsPage() {
  const session = await getSession();

  // Protect route (Login required and must be admin/organizer)
  if (!session) {
    redirect("/login");
  }

  const role = session.role.toLowerCase();
  if (role !== "admin" && role !== "organizer") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">
      <EventManager role={session.role} userId={session.user_id} />
    </div>
  );
}
