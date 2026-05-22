import { query } from "@/lib/db";
import { requireDashboardRoles } from "@/lib/dashboard";

export async function GET() {
  const sessionResult = await requireDashboardRoles(["admin"]);

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const result = await query(
      `SELECT organizer_id AS id, organizer_name AS name
       FROM ORGANIZER
       ORDER BY organizer_name ASC`
    );

    return Response.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error GET Organizer list:", error);
    return Response.json({ error: "Gagal memuat daftar organizer" }, { status: 500 });
  }
}
