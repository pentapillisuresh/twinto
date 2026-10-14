// services/addressService.js
import { apiRequest } from "./api";

function toUI(a) {
  if (!a) return null;
  const parts = [
    a.addressLine1,
    a.addressLine2,
    a.landmark,
    a.city,
    a.state,
    a.pincode,
  ].filter(Boolean);

  return {
    id: a.id,
    type: a.type || "HOME",
    name: a.name,
    address: parts.join(", "),
    phone: a.mobile,
    mobile: a.mobile,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2,
    landmark: a.landmark,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    isDefault: Boolean(a.isDefault),
  };
}

export async function getAddresses() {
  const data = await apiRequest("/addresses");
  return (data || []).map(toUI);
}

export async function createAddress(payload) {
  const data = await apiRequest("/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toUI(data);
}

export async function updateAddress(id, payload) {
  const data = await apiRequest(`/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return toUI(data);
}

export async function deleteAddress(id) {
  return apiRequest(`/addresses/${id}`, { method: "DELETE" });
}