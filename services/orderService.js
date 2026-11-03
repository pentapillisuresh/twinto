
import { apiRequest } from "./api";

/* =========================================
   HELPERS
========================================= */

function requireOrderId(orderId) {
  const id = Number(orderId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid order ID.");
  }

  return id;
}

function normalizeOrder(order) {
  if (!order || typeof order !== "object") {
    return null;
  }

  return {
    ...order,
    id: order.id != null ? Number(order.id) : order.id,
    total: Number(order.total || 0),
    itemTotal: Number(order.itemTotal || 0),
    platformFee: Number(order.platformFee || 0),
    deliveryPartnerFee: Number(
      order.deliveryPartnerFee || 0
    ),
    discount: Number(order.discount || 0),
    tip: Number(order.tip || 0),
    items: Array.isArray(order.items) ? order.items : [],
  };
}

function unwrapResponse(response) {
  const body = response?.data ?? response;
  return body?.data ?? body;
}

/* =========================================
   NORMALIZE CASHFREE RESPONSE
========================================= */

function normalizeCashfree(data) {
  if (!data || typeof data !== "object") {
    throw new Error(
      "Cashfree payment details are missing."
    );
  }

  const paymentSessionId =
    data.paymentSessionId ||
    data.payment_session_id ||
    data.sessionId;

  const cashfreeOrderId =
    data.cashfreeOrderId ||
    data.cashfree_order_id ||
    data.orderId ||
    data.cfOrderId;

  const environment = String(
    data.environment || ""
  ).toLowerCase();

  if (!paymentSessionId) {
    throw new Error(
      "Cashfree payment session ID is missing."
    );
  }

  if (!cashfreeOrderId) {
    throw new Error(
      "Cashfree order ID is missing."
    );
  }

  if (!["sandbox", "production"].includes(environment)) {
    throw new Error(
      "Invalid Cashfree environment returned by backend."
    );
  }

  return {
    paymentSessionId: String(paymentSessionId),
    cashfreeOrderId: String(cashfreeOrderId),
    environment,
  };
}

/* =========================================
   GET ALL ORDERS
========================================= */

export async function getOrders() {
  const response = await apiRequest("/orders");

  const data = unwrapResponse(response);

  const orders = Array.isArray(data)
    ? data
    : data?.orders || data?.rows || [];

  return orders.map(normalizeOrder).filter(Boolean);
}

/* =========================================
   GET SINGLE ORDER
========================================= */

export async function getOrder(orderId) {
  const id = requireOrderId(orderId);

  const response = await apiRequest(`/orders/${id}`);

  const data = unwrapResponse(response);

  return normalizeOrder(data?.order || data);
}

/* =========================================
   CREATE ORDER
========================================= */

export async function createOrder(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Order details are required.");
  }

  if (!payload.addressId) {
    throw new Error("Please select a delivery address.");
  }

  const paymentMethod = String(
    payload.paymentMethod || "COD"
  ).toUpperCase();

  if (!["COD", "CASHFREE"].includes(paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  const response = await apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      paymentMethod,
    }),
  });

  const data = unwrapResponse(response);

  const order = normalizeOrder(data?.order || data);

  if (!order?.id) {
    throw new Error(
      data?.message ||
      "Order response did not include a valid order ID."
    );
  }

  let cashfree = null;
  let retryRequired = Boolean(data?.retryRequired);

  if (paymentMethod === "CASHFREE" && data?.cashfree) {
    cashfree = normalizeCashfree(data.cashfree);
  } else if (paymentMethod === "CASHFREE") {
    retryRequired = true;
  }

  return {
    order,
    paymentMethod,
    cashfree,
    checkoutUrl: null,

    paymentSessionId:
      cashfree?.paymentSessionId || null,

    cashfreeOrderId:
      cashfree?.cashfreeOrderId || null,

    environment:
      cashfree?.environment || null,

    requiresPayment: paymentMethod === "CASHFREE",

    paymentReady: Boolean(cashfree),
    retryRequired,

    rawResponse: data,
  };
}

/* =========================================
   RETRY CASHFREE PAYMENT
   POST /orders/:id/retry-payment
========================================= */

export async function retryCashfreePayment(orderId) {
  const id = requireOrderId(orderId);

  const response = await apiRequest(
    `/orders/${id}/retry-payment`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );

  const data = unwrapResponse(response);

  if (!data || typeof data !== "object") {
    throw new Error(
      "Invalid payment response from backend."
    );
  }

  const paymentStatus = String(
    data.paymentStatus ||
    data.order?.paymentStatus ||
    ""
  ).toUpperCase();

  if (
    paymentStatus === "PAID" ||
    data.isPaid === true
  ) {
    return {
      order: normalizeOrder(data.order),
      orderId: id,
      paymentStatus: "PAID",
      isPaid: true,
      cashfree: null,
      rawResponse: data,
    };
  }

  const cashfree = normalizeCashfree(data.cashfree);

  return {
    order: normalizeOrder(data.order),
    orderId: id,
    paymentStatus: paymentStatus || "PENDING",
    isPaid: false,
    cashfree,
    paymentSessionId: cashfree.paymentSessionId,
    cashfreeOrderId: cashfree.cashfreeOrderId,
    environment: cashfree.environment,
    rawResponse: data,
  };
}

/* =========================================
   CANCEL ORDER
========================================= */

export async function cancelOrder(orderId) {
  const id = requireOrderId(orderId);

  const response = await apiRequest(
    `/orders/${id}/cancel`,
    {
      method: "PATCH",
      body: JSON.stringify({}),
    }
  );

  const data = unwrapResponse(response);

  return normalizeOrder(data?.order || data);
}
