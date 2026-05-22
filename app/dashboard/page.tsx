/// <reference path="../../types/global.d.ts" />

import AdminDashboard from "../../components/dashboard/AdminDashboard";
import OrganizerDashboard from "../../components/dashboard/OrganizerDashboard";
import CustomerDashboard from "../../components/dashboard/CustomerDashboard";
import { getSession } from "../../lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.role || "customer";

  const DashboardComponent = role === "admin" ? AdminDashboard : role === "organizer" ? OrganizerDashboard : CustomerDashboard;

  return (
    <div className="flex-1 flex flex-col relative min-h-full w-full max-w-[1400px] mx-auto">
      <DashboardComponent />
    </div>
  );
}
