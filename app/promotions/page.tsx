import PromotionsClient from "@/components/promotions/PromotionsClient";
import { getSession } from "@/lib/auth";

export default async function PromotionsPage() {
  const session = await getSession();
  const role = session?.role ?? "guest";

  return <PromotionsClient role={role} />;
}
