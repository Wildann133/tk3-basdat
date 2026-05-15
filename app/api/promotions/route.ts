import { requireDashboardSession } from "@/lib/dashboard";
import {
  deletePromotionRecord,
  insertPromotion,
  listPromotionsWithUsage,
  updatePromotionRecord,
} from "@/lib/promotions";
import type { PromotionFormValues } from "@/lib/types/promotion";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function parsePromotionBody(body: unknown): PromotionFormValues | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const promo_code = typeof record.promo_code === "string" ? record.promo_code : "";
  const discount_type = record.discount_type;
  if (discount_type !== "PERCENTAGE" && discount_type !== "NOMINAL") {
    return null;
  }
  const discount_value = Number(record.discount_value);
  const usage_limit = Number(record.usage_limit);
  if (!Number.isFinite(discount_value) || !Number.isFinite(usage_limit)) {
    return null;
  }
  const start_date = typeof record.start_date === "string" ? record.start_date : "";
  const end_date = typeof record.end_date === "string" ? record.end_date : "";
  return {
    promo_code,
    discount_type,
    discount_value,
    start_date,
    end_date,
    usage_limit,
  };
}

export async function GET() {
  try {
    const promotions = await listPromotionsWithUsage();
    return Response.json(promotions, { status: 200 });
  } catch (error: unknown) {
    console.error("Error GET Promotions:", error);
    return Response.json(
      { error: getErrorMessage(error, "Gagal memuat daftar promosi") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const sessionResult = await requireDashboardSession("admin");

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await request.json();
    const values = parsePromotionBody(body);
    if (!values) {
      return Response.json({ error: "Payload promosi tidak valid" }, { status: 400 });
    }

    const created = await insertPromotion(values);
    return Response.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("Error POST Promotions:", error);
    const message = getErrorMessage(error, "Gagal membuat promosi");
    if (message === "Kode promo sudah digunakan.") {
      return Response.json({ error: message }, { status: 409 });
    }
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const sessionResult = await requireDashboardSession("admin");

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await request.json();
    const record = body as Record<string, unknown>;
    const promotionId =
      typeof record.promotion_id === "string"
        ? record.promotion_id
        : typeof record.id === "string"
          ? record.id
          : "";

    if (!promotionId) {
      return Response.json({ error: "ID promosi wajib disertakan" }, { status: 400 });
    }

    const values = parsePromotionBody(body);
    if (!values) {
      return Response.json({ error: "Payload promosi tidak valid" }, { status: 400 });
    }

    const updated = await updatePromotionRecord(promotionId, values);
    if (!updated) {
      return Response.json({ error: "Promosi tidak ditemukan" }, { status: 404 });
    }

    return Response.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error("Error PUT Promotions:", error);
    const message = getErrorMessage(error, "Gagal memperbarui promosi");
    if (message === "Kode promo sudah digunakan.") {
      return Response.json({ error: message }, { status: 409 });
    }
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const sessionResult = await requireDashboardSession("admin");

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID promosi wajib disertakan" }, { status: 400 });
    }

    const deleted = await deletePromotionRecord(id);
    if (!deleted) {
      return Response.json({ error: "Promosi tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ message: "Promosi berhasil dihapus" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error DELETE Promotions:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
      return Response.json(
        { error: "Gagal menghapus promosi karena masih memiliki relasi data lain" },
        { status: 409 }
      );
    }

    return Response.json(
      { error: getErrorMessage(error, "Gagal menghapus promosi") },
      { status: 400 }
    );
  }
}
