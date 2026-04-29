import { redirect } from "next/navigation";
import PromotionsClient from "@/components/promotions/PromotionsClient";
import { getSession } from "@/lib/auth";

export default async function PromotionsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return <PromotionsClient />;
}
