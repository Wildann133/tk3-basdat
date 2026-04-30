export type DiscountType = "PERCENTAGE" | "NOMINAL";

export type Promotion = {
  promotion_id: string;
  promo_code: string;
  discount_type: DiscountType;
  discount_value: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
};

export type PromotionFormValues = {
  promo_code: string;
  discount_type: DiscountType;
  discount_value: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
};
