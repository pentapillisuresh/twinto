
import { apiRequest } from "./api";

/**
 * Validate the TWINTO order ID.
 */
function requireOrderId(orderId) {
  const id = Number(orderId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Valid order ID is required.");
  }

  return id;
}

/**
 * Verify Cashfree payment.
 *
 * Backend endpoint:
 * POST /api/v1/payments/verify
 *
 * The backend checks Cashfree directly.
 * Never mark an order PAID from the app alone.
 */
export function verifyPayment(orderId) {
  return apiRequest("/payments/verify", {
    method: "POST",
    body: JSON.stringify({
      orderId: requireOrderId(orderId),
    }),
  });
}

/**
 * Fetch the latest payment status.
 *
 * Backend endpoint:
 * GET /api/v1/payments/status/:orderId
 *
 * Useful when the customer returns from
 * Cashfree checkout to the TWINTO app.
 */
export function getPaymentStatus(orderId) {
  return apiRequest(
    `/payments/status/${requireOrderId(orderId)}`
  );
}
