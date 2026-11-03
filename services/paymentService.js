
import { apiRequest } from "./api";

/* =========================================
   HELPERS
========================================= */

function validateOrderId(orderId) {
  const id = Number(orderId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid order ID.");
  }

  return id;
}

function unwrapResponse(response) {
  const body = response?.data ?? response;
  return body?.data ?? body;
}

/* =========================================
   GET PAYMENT STATUS
   GET /payments/status/:orderId
========================================= */

export async function getPaymentStatus(orderId) {
  const id = validateOrderId(orderId);

  const response = await apiRequest(
    `/payments/status/${id}`
  );

  const data = unwrapResponse(response);

  if (!data || typeof data !== "object") {
    throw new Error(
      "Invalid payment status response."
    );
  }

  return {
    ...data,
    orderId: data.orderId || id,
    paymentStatus:
      String(
        data.paymentStatus ||
        data.order?.paymentStatus ||
        "PENDING"
      ).toUpperCase(),
    isPaid:
      data.isPaid === true ||
      String(
        data.paymentStatus ||
        data.order?.paymentStatus ||
        ""
      ).toUpperCase() === "PAID",
  };
}

/* =========================================
   VERIFY PAYMENT
   POST /payments/verify
========================================= */

export async function verifyPayment(orderId) {
  const id = validateOrderId(orderId);

  const response = await apiRequest(
    "/payments/verify",
    {
      method: "POST",
      body: JSON.stringify({
        orderId: id,
      }),
    }
  );

  const data = unwrapResponse(response);

  if (!data || typeof data !== "object") {
    throw new Error(
      "Invalid payment verification response."
    );
  }

  const paymentStatus = String(
    data.paymentStatus ||
    data.order?.paymentStatus ||
    "PENDING"
  ).toUpperCase();

  return {
    ...data,
    orderId: data.orderId || id,
    paymentStatus,
    isPaid:
      data.isPaid === true ||
      paymentStatus === "PAID",
  };
}

/* =========================================
   PAYMENT RESULT CHECK
========================================= */

export async function checkPaymentResult(orderId) {
  const id = validateOrderId(orderId);

  // Verify with backend first.
  const verification = await verifyPayment(id);

  if (verification.isPaid) {
    return verification;
  }

  // If payment is not confirmed, retrieve current status.
  return getPaymentStatus(id);
}
