// services/paymentService.js
import { apiRequest } from "./api";

export async function verifyPayment(payload) {
  return apiRequest("/payments/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}