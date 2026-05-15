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

export type CheckoutPromotion = {
  promotionId: string;
  promoCode: string;
  discountType: "PERCENTAGE" | "NOMINAL";
  discountValue: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
};

export type CheckoutEvent = {
  event_id: string;
  event_title: string;
  event_datetime: string;
  venue_id: string;
};

export type CheckoutVenue = {
  venue_id: string;
  venue_name: string;
  seating_type: string;
};

export type PersistedOrder = {
  order_id: string;
  order_date: string;
  payment_status: PaymentStatus;
  total_amount: number;
  customer_id: string;
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
