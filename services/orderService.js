// services/orderService.js
import { apiRequest } from "./api";
import { ORDER_STATUS_LABEL } from "../constants";

function normalizeOrder(o) {
  if (!o) return null;
  const rawStatus = o.status || "PLACED";
  const uiStatus = ORDER_STATUS_LABEL[rawStatus] || rawStatus;

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
      ? new Date(o.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
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
      weight: "",
    })),
    address: o.address || o.addressSnapshot || null,
    history: o.history || [],
    payments: o.payments || [],
    deliveryPartner:
      o.assignedPersonName || o.assignedPersonMobile
        ? {
            name: o.assignedPersonName || "Delivery Partner",
            phone: o.assignedPersonMobile || "",
          }
        : null,
  };
}

export async function getOrders() {
  const data = await apiRequest("/orders");
  return (data || []).map(normalizeOrder);
}

export async function getOrder(id) {
  const data = await apiRequest(`/orders/${id}`);
  return normalizeOrder(data);
}

export async function createOrder(payload) {
  const data = await apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return {
    order: normalizeOrder(data.order),
    paymentOrder: data.paymentOrder || null,
    razorpayKeyId: data.razorpayKeyId || null,
  };
}

export async function cancelOrder(id) {
  const data = await apiRequest(`/orders/${id}/cancel`, {
    method: "PATCH",
  });
  return normalizeOrder(data);
}