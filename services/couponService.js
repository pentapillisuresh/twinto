import { apiRequest } from "./api";

export async function validateCoupon(code, itemTotal) {
  const normalizedCode = String(code || "").trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error("Enter a coupon code.");
  }

  return apiRequest("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({
      code: normalizedCode,
      itemTotal: Number(itemTotal),
    }),
  });
}