import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import type { DiscountType, PromotionFormValues, PromotionWithUsage } from "@/lib/types/promotion";

type DbPromotionRow = {
  promotion_id: string;
  promo_code: string;
  discount_type: string;
  discount_value: string | number;
  usage_limit: number;
  start_date: Date | string;
  end_date: Date | string;
};

function toNumber(value: string | number) {
  return Number(value);
}

function toDateInputString(value: Date | string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function mapDiscountType(raw: string): DiscountType {
  return raw === "NOMINAL" ? "NOMINAL" : "PERCENTAGE";
}

function mapRow(row: DbPromotionRow, usedCount: number): PromotionWithUsage {
  return {
    promotion_id: row.promotion_id,
    promo_code: row.promo_code,
    discount_type: mapDiscountType(row.discount_type),
    discount_value: toNumber(row.discount_value),
    usage_limit: Number(row.usage_limit),
    start_date: toDateInputString(row.start_date),
    end_date: toDateInputString(row.end_date),
    used_count: usedCount,
  };
}

export function validatePromotionPayload(values: PromotionFormValues) {
  if (!values.promo_code.trim()) {
    throw new Error("Kode promo wajib diisi.");
  }
  if (values.discount_type !== "PERCENTAGE" && values.discount_type !== "NOMINAL") {
    throw new Error("Tipe diskon tidak valid.");
  }
  const discountValue = Number(values.discount_value);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new Error("Nilai diskon harus lebih dari 0.");
  }
  if (values.discount_type === "PERCENTAGE" && discountValue > 100) {
    throw new Error("Diskon persentase tidak boleh lebih dari 100.");
  }
  if (!values.start_date) {
    throw new Error("Tanggal mulai wajib diisi.");
  }
  if (!values.end_date) {
    throw new Error("Tanggal berakhir wajib diisi.");
  }
  if (values.end_date < values.start_date) {
    throw new Error("Tanggal berakhir harus sama atau setelah tanggal mulai.");
  }
  const usageLimit = Number(values.usage_limit);
  if (!Number.isInteger(usageLimit) || usageLimit <= 0) {
    throw new Error("Batas penggunaan harus bilangan bulat lebih dari 0.");
  }
}

export async function listPromotionsWithUsage(): Promise<PromotionWithUsage[]> {
  const result = await query(
    `SELECT
       p.promotion_id,
       p.promo_code,
       p.discount_type,
       p.discount_value,
       p.usage_limit,
       p.start_date,
       p.end_date,
       COALESCE(u.used_count, 0)::int AS used_count
     FROM PROMOTION p
     LEFT JOIN (
       SELECT promotion_id, COUNT(*)::int AS used_count
       FROM order_promotion
       GROUP BY promotion_id
     ) u ON u.promotion_id = p.promotion_id
     ORDER BY LOWER(p.promo_code) ASC`
  );

  return (result.rows as Array<DbPromotionRow & { used_count: number }>).map((row) =>
    mapRow(row, Number(row.used_count ?? 0))
  );
}

async function fetchPromotionWithUsage(promotionId: string): Promise<PromotionWithUsage | null> {
  const result = await query(
    `SELECT
       p.promotion_id,
       p.promo_code,
       p.discount_type,
       p.discount_value,
       p.usage_limit,
       p.start_date,
       p.end_date,
       COALESCE(
         (SELECT COUNT(*)::int FROM order_promotion op WHERE op.promotion_id = p.promotion_id),
         0
       ) AS used_count
     FROM PROMOTION p
     WHERE p.promotion_id = $1`,
    [promotionId]
  );

  if (result.rowCount === 0) return null;
  const row = result.rows[0] as DbPromotionRow & { used_count: number };
  return mapRow(row, Number(row.used_count ?? 0));
}

export async function insertPromotion(values: PromotionFormValues): Promise<PromotionWithUsage> {
  validatePromotionPayload(values);
  const promoCode = values.promo_code.trim();
  const promotionId = randomUUID();

  try {
    await query(
      `INSERT INTO PROMOTION (
         promotion_id,
         promo_code,
         discount_type,
         discount_value,
         start_date,
         end_date,
         usage_limit
       )
       VALUES ($1, $2, $3, $4::numeric, $5::date, $6::date, $7::int)`,
      [
        promotionId,
        promoCode,
        values.discount_type,
        values.discount_value,
        values.start_date,
        values.end_date,
        values.usage_limit,
      ]
    );
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new Error("Kode promo sudah digunakan.");
    }
    throw error;
  }

  const created = await fetchPromotionWithUsage(promotionId);
  if (!created) {
    throw new Error("Gagal memuat promosi yang baru dibuat.");
  }
  return created;
}

export async function updatePromotionRecord(
  promotionId: string,
  values: PromotionFormValues
): Promise<PromotionWithUsage | null> {
  validatePromotionPayload(values);
  const promoCode = values.promo_code.trim();

  try {
    const result = await query(
      `UPDATE PROMOTION
       SET promo_code = $2,
           discount_type = $3,
           discount_value = $4::numeric,
           start_date = $5::date,
           end_date = $6::date,
           usage_limit = $7::int
       WHERE promotion_id = $1
       RETURNING promotion_id`,
      [
        promotionId,
        promoCode,
        values.discount_type,
        values.discount_value,
        values.start_date,
        values.end_date,
        values.usage_limit,
      ]
    );

    if (result.rowCount === 0) {
      return null;
    }
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new Error("Kode promo sudah digunakan.");
    }
    throw error;
  }

  return fetchPromotionWithUsage(promotionId);
}

export async function deletePromotionRecord(promotionId: string): Promise<boolean> {
  const result = await query(`DELETE FROM PROMOTION WHERE promotion_id = $1`, [promotionId]);
  return (result.rowCount ?? 0) > 0;
}
