import { query } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

type PromotionTypeRow = {
  discount_type: string;
  count: number;
};

export async function GET() {
  const sessionResult = await requireDashboardSession("admin");

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const [
      usersResult,
      eventsResult,
      omzetResult,
      promoResult,
      promoTypeResult,
      promoUsageResult,
      venuesResult,
      seatsVenueResult,
      maxCapResult,
    ] = await Promise.all([
      query("SELECT COUNT(*)::int AS count FROM USER_ACCOUNT"),
      query("SELECT COUNT(*)::int AS count FROM EVENT"),
      query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM \"ORDER\" WHERE payment_status = 'Paid'"),
      query("SELECT COUNT(*)::int AS count FROM PROMOTION WHERE CURRENT_DATE BETWEEN start_date AND end_date"),
      query(
        "SELECT discount_type, COUNT(*)::int AS count FROM PROMOTION WHERE CURRENT_DATE BETWEEN start_date AND end_date GROUP BY discount_type"
      ),
      query("SELECT COUNT(*)::int AS count FROM order_promotion"),
      query("SELECT COUNT(*)::int AS count FROM VENUE"),
      query("SELECT COUNT(DISTINCT venue_id)::int AS count FROM SEAT"),
      query("SELECT COALESCE(MAX(capacity), 0) AS max_capacity FROM VENUE"),
    ]);

    const totalUsers = Number(usersResult.rows[0]?.count ?? 0);
    const totalEvents = Number(eventsResult.rows[0]?.count ?? 0);
    const omzetPlatform = Number(omzetResult.rows[0]?.total ?? 0);
    const activePromotions = Number(promoResult.rows[0]?.count ?? 0);
    const promoTypeRows = promoTypeResult.rows as PromotionTypeRow[];
    const promoPercentCount = Number(
      promoTypeRows.find((row) => row.discount_type === "PERCENTAGE")?.count ?? 0
    );
    const promoNominalCount = Number(
      promoTypeRows.find((row) => row.discount_type === "NOMINAL")?.count ?? 0
    );
    const promoUsageCount = Number(promoUsageResult.rows[0]?.count ?? 0);
    const venues = Number(venuesResult.rows[0]?.count ?? 0);
    const venuesWithSeats = Number(seatsVenueResult.rows[0]?.count ?? 0);
    const maxCapacity = Number(maxCapResult.rows[0]?.max_capacity ?? 0);

    return Response.json(
      {
        totalUsers,
        totalEvents,
        omzetPlatform,
        activePromotions,
        promoPercentCount,
        promoNominalCount,
        promoUsageCount,
        venues,
        venuesWithSeats,
        maxCapacity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error GET Admin Dashboard:", error);
    return Response.json({ error: "Gagal memuat dashboard admin" }, { status: 500 });
  }
}
