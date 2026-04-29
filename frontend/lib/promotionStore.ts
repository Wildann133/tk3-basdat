import { PROMOTIONS } from "@/lib/dummyData";
import { Promotion, PromotionFormValues } from "@/lib/types/promotion";

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
