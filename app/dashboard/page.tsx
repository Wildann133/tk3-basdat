import AdminDashboard from "@/components/dashboard/AdminDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";
import Link from "next/link";
import { Button } from "@/components/retroui/Button";

import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.role || "customer";

  let DashboardComponent = <CustomerDashboard />;
  
  if (role === "admin") {
    DashboardComponent = <AdminDashboard />;
  } else if (role === "organizer") {
    DashboardComponent = <OrganizerDashboard />;
  }

  return (
    <div className="flex-1 flex flex-col relative min-h-full w-full max-w-[1400px] mx-auto">
      {DashboardComponent}
    </div>
  );
}
