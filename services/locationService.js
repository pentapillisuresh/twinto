// services/locationService.js
import { apiRequest } from "./api";

function normalize(l) {
  if (!l) return null;
  return {
    id: l.id,
    name: l.name || l.city,
    city: l.city,
    state: l.state,
    pincode: l.pincode,
    available: Boolean(l.isAvailable && l.isActive),
    deliveryTime: l.deliveryTime || "15 mins",
  };
}

export async function getLocations() {
  const data = await apiRequest("/locations");
  return (data || []).map(normalize);
}

export async function getLocation(id) {
  const list = await getLocations();
  return list.find((l) => String(l.id) === String(id)) || list[0] || null;
}