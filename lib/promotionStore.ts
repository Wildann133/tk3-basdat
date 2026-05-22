import { PROMOTIONS } from "@/lib/dummyData";
import { Promotion, PromotionFormValues } from "@/lib/types/promotion";
import { getAllOrders } from "@/lib/orderStore";

const globalPromotionState = globalThis as typeof globalThis & {
  __tiktaktukPromotions?: Promotion[];
};

if (!globalPromotionState.__tiktaktukPromotions) {
  globalPromotionState.__tiktaktukPromotions = PROMOTIONS.map((promotion) => ({
    ...promotion,
    discount_type: promotion.discount_type as Promotion["discount_type"],
  }));
}

const getStore = () => globalPromotionState.__tiktaktukPromotions as Promotion[];

const byPromoCode = (a: Promotion, b: Promotion) =>
  a.promo_code.localeCompare(b.promo_code);

export function getAllPromotions() {
  return [...getStore()].sort(byPromoCode);
}

export function isPromoCodeUnique(promoCode: string, excludeId?: string) {
  const normalized = promoCode.trim().toLowerCase();
  return !getStore().some(
    (promotion) =>
      promotion.promo_code.toLowerCase() === normalized &&
      promotion.promotion_id !== excludeId
  );
}

function getNextPromotionId() {
  const maxNumericId = getStore().reduce((maxValue, promotion) => {
    const numericPart = Number(promotion.promotion_id.replace(/^p/, ""));
    if (Number.isNaN(numericPart)) return maxValue;
    return Math.max(maxValue, numericPart);
  }, 0);
  return `p${maxNumericId + 1}`;
}

export function createPromotion(values: PromotionFormValues) {
  const newPromotion: Promotion = {
    promotion_id: getNextPromotionId(),
    ...values,
  };
  getStore().push(newPromotion);
  return newPromotion;
}

export function updatePromotionById(
  promotionId: string,
  patch: PromotionFormValues
) {
  const promotion = getStore().find((item) => item.promotion_id === promotionId);
  if (!promotion) return null;
  Object.assign(promotion, patch);
  return promotion;
}

export function deletePromotionById(promotionId: string) {
  const currentStore = getStore();
  const index = currentStore.findIndex((item) => item.promotion_id === promotionId);
  if (index < 0) return false;
  currentStore.splice(index, 1);
  return true;
}

export function getPromotionUsedCount(promoCode: string) {
  const normalized = promoCode.trim().toLowerCase();
  if (!normalized) return 0;
  return getAllOrders().reduce((total, order) => {
    if (!order.promo_code) return total;
    if (order.promo_code.trim().toLowerCase() !== normalized) return total;
    return total + order.quantity;
  }, 0);
}

export function getPromotionUsageSnapshot(promotions: Promotion[]) {
  return promotions.map((promotion) => ({
    promotion_id: promotion.promotion_id,
    used_count: getPromotionUsedCount(promotion.promo_code),
    usage_limit: promotion.usage_limit,
  }));
}
