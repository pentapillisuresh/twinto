
import { apiRequest } from "./api";

/* =========================================
   RESPONSE NORMALIZATION
========================================= */

function normalizeLocation(location) {
  if (!location || typeof location !== "object") {
    return null;
  }

  return {
    id: location.id,
    name: location.name || location.city || "",
    city: location.city || "",
    state: location.state || "",
    pincode: location.pincode || "",

    platformFee: Number(location.platformFee ?? 5),
    minimumOrder: Number(location.minimumOrder ?? 5),
    deliveryCharge: Number(location.deliveryCharge ?? 30),

    freeDeliveryEnabled:
      location.freeDeliveryEnabled === true ||
      location.freeDeliveryEnabled === 1 ||
      location.freeDeliveryEnabled === "1",

    freeDeliveryMaxItems: Number(
      location.freeDeliveryMaxItems ?? 3
    ),

    deliveryTime: location.deliveryTime || "30-45 minutes",

    isAvailable:
      location.isAvailable === true ||
      location.isAvailable === 1,

    isActive:
      location.isActive === true ||
      location.isActive === 1,
  };
}

/* =========================================
   ADDRESS NORMALIZATION
========================================= */

function toUI(address) {
  if (!address || typeof address !== "object") {
    return null;
  }

  const location = normalizeLocation(address.location);

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);

  return {
    id: address.id,
    userId: address.userId,

    type: address.type || "HOME",
    name: address.name || "",

    address: parts.join(", "),

    phone: address.mobile || "",
    mobile: address.mobile || "",

    addressLine1: address.addressLine1 || "",
    addressLine2: address.addressLine2 || "",
    landmark: address.landmark || "",

    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",

    lat: address.lat ?? null,
    lng: address.lng ?? null,

    isDefault: Boolean(address.isDefault),
    isActive: address.isActive !== false,

    // Important: selected delivery location ID
    locationId:
      address.locationId != null
        ? Number(address.locationId)
        : null,

    // Location-specific fee settings
    location,
  };
}

/* =========================================
   GET CUSTOMER ADDRESSES
   GET /addresses
========================================= */

export async function getAddresses() {
  const data = await apiRequest("/addresses");

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.addresses)
      ? data.addresses
      : [];

  return list.map(toUI).filter(Boolean);
}

/* =========================================
   CREATE CUSTOMER ADDRESS
   POST /addresses
========================================= */

export async function createAddress(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Address details are required.");
  }

  if (!payload.locationId) {
    throw new Error("Please select a delivery location.");
  }

  const data = await apiRequest("/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const address = data?.address || data;

  const normalized = toUI(address);

  if (!normalized?.id) {
    throw new Error(
      "Address was saved, but the server did not return its ID."
    );
  }

  return normalized;
}

/* =========================================
   UPDATE CUSTOMER ADDRESS
   PUT /addresses/:id
========================================= */

export async function updateAddress(id, payload) {
  if (!id) {
    throw new Error("Valid address ID is required.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Address details are required.");
  }

  const data = await apiRequest(`/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  const address = data?.address || data;

  return toUI(address);
}

/* =========================================
   DELETE CUSTOMER ADDRESS
   DELETE /addresses/:id
========================================= */

export async function deleteAddress(id) {
  if (!id) {
    throw new Error("Valid address ID is required.");
  }

  return apiRequest(`/addresses/${id}`, {
    method: "DELETE",
  });
}
