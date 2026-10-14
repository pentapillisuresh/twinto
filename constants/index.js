// constants/index.js
// Pure constants — DO NOT import from services/ or context/ here.

export const API_URL = "http://10.56.245.71:5000/api/v1";

export const COLORS = {
  primary: "#C9004F",
  primaryDark: "#A90042",
  primaryLight: "#FFF0F5",
  background: "#FFF9FB",
  white: "#FFFFFF",
  text: "#172033",
  textSecondary: "#59606D",
  muted: "#858B95",
  border: "#E9DDE2",
  danger: "#C93652",
  warning: "#F6C843",
  black: "#111111",
};

export const DUMMY_OTP = "123456";

export const PLATFORM_FEE = 5;
export const DELIVERY_PARTNER_FEE = 30;
export const FREE_DELIVERY_MAX_ITEMS = 3;

export const ORDER_STATUS_LABEL = {
  PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PACKING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};