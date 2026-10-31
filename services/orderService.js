
import { apiRequest } from "./api";
import { ORDER_STATUS_LABEL } from "../constants";

/**
 * Convert backend order data into the
 * format used by the TWINTO app.
 */
function normalizeOrder(o) {
  if (!o) return null;

  const rawStatus = o.status || "PLACED";

  const uiStatus =
    ORDER_STATUS_LABEL[rawStatus] || rawStatus;

  return {
    id: o.id,
    orderNumber: o.orderNumber,

    status: uiStatus,
    rawStatus,

    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,

    itemTotal: Number(o.itemTotal) || 0,
    platformFee: Number(o.platformFee) || 0,
    deliveryFee: Number(o.deliveryPartnerFee) || 0,
    discount: Number(o.discount) || 0,
    tip: Number(o.tip) || 0,
    total: Number(o.total) || 0,

    date: o.createdAt
      ? new Date(o.createdAt).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      : "",

    items: (o.items || []).map((it) => ({
      id: it.productId ?? it.id,
      productId: it.productId,

      name: it.productName,
      productName: it.productName,

      image: it.productImage || null,
      productImage: it.productImage,

      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      subtotal: Number(it.subtotal) || 0,

      weight: it.weight || "",
    })),

    address:
      o.address ||
      o.addressSnapshot ||
      null,

    history: o.history || [],
    payments: o.payments || [],

    deliveryPartner:
      o.assignedPersonName ||
      o.assignedPersonMobile
        ? {
            name:
              o.assignedPersonName ||
              "Delivery Partner",

            phone:
              o.assignedPersonMobile || "",
          }
        : null,
  };
}

/**
 * GET /api/v1/orders
 *
 * Fetch all customer orders.
 */
export async function getOrders() {
  const data = await apiRequest("/orders");

  const orders = Array.isArray(data)
    ? data
    : Array.isArray(data?.orders)
      ? data.orders
      : [];

  return orders.map(normalizeOrder);
}

/**
 * GET /api/v1/orders/:id
 *
 * Fetch a single order.
 */
export async function getOrder(id) {
  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    throw new Error("Order ID is required.");
  }

  const data = await apiRequest(
    `/orders/${encodeURIComponent(String(id))}`
  );

  return normalizeOrder(data?.order || data);
}

/**
 * POST /api/v1/orders
 *
 * Create a COD or Cashfree order.
 *
 * COD:
 *   paymentMethod: "COD"
 *
 * Cashfree:
 *   paymentMethod: "CASHFREE"
 *
 * Expected Cashfree backend response:
 *
 * {
 *   order: {...},
 *   cashfree: {
 *     paymentSessionId: "...",
 *     checkoutUrl: "https://...",
 *     environment: "sandbox"
 *   }
 * }
 */
export async function createOrder(payload) {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error(
      "Valid order details are required."
    );
  }

  const paymentMethod = String(
    payload.paymentMethod || "COD"
  ).toUpperCase();

  if (
    paymentMethod !== "COD" &&
    paymentMethod !== "CASHFREE"
  ) {
    throw new Error(
      "Unsupported payment method."
    );
  }

  const data = await apiRequest("/orders", {
    method: "POST",

    body: JSON.stringify({
      ...payload,
      paymentMethod,
    }),
  });

  if (!data) {
    throw new Error(
      "Invalid response from order server."
    );
  }

  const orderData = data.order || data;

  const order = normalizeOrder(orderData);

  if (!order?.id) {
    throw new Error(
      "Order created but order ID was not returned."
    );
  }

  /**
   * Cashfree details are returned under
   * the "cashfree" object by the backend.
   */
  const cashfree = data.cashfree || null;

  const paymentSessionId =
    cashfree?.paymentSessionId ||
    cashfree?.payment_session_id ||
    null;

  const checkoutUrl =
    cashfree?.checkoutUrl ||
    null;

  const environment =
    cashfree?.environment ||
    null;

  /**
   * Do not create another order if Cashfree
   * session details are missing.
   *
   * The backend may have already saved
   * this order.
   */
  return {
    order,

    paymentMethod,

    cashfree,

    paymentSessionId,
    checkoutUrl,
    environment,

    requiresPayment:
      paymentMethod === "CASHFREE",

    paymentReady:
      paymentMethod === "CASHFREE" &&
      Boolean(checkoutUrl),

    rawResponse: data,
  };
}

/**
 * PATCH /api/v1/orders/:id/cancel
 *
 * Cancel an order.
 */
export async function cancelOrder(id) {
  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    throw new Error("Order ID is required.");
  }

  const data = await apiRequest(
    `/orders/${encodeURIComponent(String(id))}/cancel`,
    {
      method: "PATCH",
    }
  );

  return normalizeOrder(data?.order || data);
}
