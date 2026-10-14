// services/cartService.js
import { apiRequest } from "./api";

export async function syncCartToBackend(items) {
  // 1. Clear backend cart
  try {
    const current = await apiRequest("/cart");
    const existing = current?.items || [];
    for (const it of existing) {
      try {
        await apiRequest(`/cart/items/${it.id}`, { method: "DELETE" });
      } catch (e) {}
    }
  } catch (e) {}

  // 2. Add each local item
  for (const item of items) {
    await apiRequest("/cart/items", {
      method: "POST",
      body: JSON.stringify({
        productId: item.id,
        quantity: item.quantity,
      }),
    });
  }

  return true;
}

export async function validateCoupon(code, itemTotal) {
  return apiRequest("/cart/validate-coupon", {
    method: "POST",
    body: JSON.stringify({ code, itemTotal }),
  });
}