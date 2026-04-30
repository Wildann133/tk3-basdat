export type PaymentStatus = "Pending" | "Paid" | "Cancelled";

export type TicketCategory = {
  id: string;
  name: string;
  price: number;
  capacity: number;
};

export type CheckoutFormState = {
  ticketCategoryId: string;
  quantity: number;
  seatsInput: string;
  promoCodeInput: string;
};

export type AppliedPromotion = {
  promotionId: string;
  promoCode: string;
  discountAmount: number;
};

export type Order = {
  order_id: string;
  order_date: string;
  payment_status: PaymentStatus;
  total_amount: number;
  customer_id: string;
  event_id: string;
  ticket_category_id: string;
  ticket_category_name: string;
  ticket_price: number;
  quantity: number;
  selected_seats: string[];
  promo_code: string | null;
  discount_amount: number;
  subtotal_amount: number;
};
