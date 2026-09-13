import { dummyOrders } from "../data";
import { apiRequest } from "./api";

const USE_DUMMY_DATA = true;

export async function getOrders() {
  if (USE_DUMMY_DATA) {
    return dummyOrders;
  }

  return apiRequest("/orders");
}

export async function getOrder(id) {
  if (USE_DUMMY_DATA) {
    const existing = dummyOrders.find(
      (order) => order.id === String(id)
    );

    if (existing) {
      return existing;
    }

    return {
      id: String(id),
      status: "Order placed",
      date: "09 Sep 2026",
      total: 0,
      items: [],
      deliveryPartner: {
        name: "Ramesh",
        phone: "+91 90000 00000",
      },
    };
  }

  return apiRequest(`/orders/${id}`);
}

export async function createOrder(orderData) {
  if (USE_DUMMY_DATA) {
    const orderId =
      "TW" + Math.floor(Math.random() * 900000 + 100000);

    return {
      success: true,

      order: {
        id: orderId,
        ...orderData,
        status: "Order placed",

        date: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),

        deliveryPartner: {
          name: "Ramesh",
          phone: "+91 90000 00000",
        },
      },
    };
  }

  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}