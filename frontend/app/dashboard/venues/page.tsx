import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import VenueManager from "@/components/dashboard/venues/VenueManager";

export default async function VenuesPage() {
  const session = await getSession();

  // Protect route
  if (!session || (session.role !== "admin" && session.role !== "organizer")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">
      <VenueManager role={session.role} />
    </div>
  );
}
