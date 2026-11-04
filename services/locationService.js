
import { apiRequest } from "./api";

// =========================================
// BOOLEAN NORMALIZER
// Handles true, false, 1, 0, "1", "0"
// =========================================

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (value === true || value === 1 || value === "1") {
    return true;
  }

  if (value === false || value === 0 || value === "0") {
    return false;
  }

  return fallback;
}

// =========================================
// LOCATION NORMALIZER
// =========================================

function normalize(location) {
  if (!location) return null;

  const isActive = toBoolean(location.isActive, true);
  const isAvailable = toBoolean(location.isAvailable, true);

  return {
    id: Number(location.id),

    name: location.name || location.city || "",
    city: location.city || "",
    state: location.state || "",
    pincode: location.pincode || "",

    isActive,
    isAvailable,

    available: isActive && isAvailable,

    deliveryTime:
      location.deliveryTime || "30-45 minutes",

    // LOCATION-SPECIFIC FEE SETTINGS

    platformFee: Number(location.platformFee ?? 5),

    minimumOrder: Number(location.minimumOrder ?? 5),

    deliveryCharge: Number(location.deliveryCharge ?? 30),

    freeDeliveryEnabled: toBoolean(
      location.freeDeliveryEnabled,
      true
    ),

    freeDeliveryMaxItems: Number(
      location.freeDeliveryMaxItems ?? 3
    ),
  };
}

// =========================================
// GET ALL AVAILABLE LOCATIONS
// GET /locations
// =========================================

export async function getLocations() {
  const data = await apiRequest("/locations");

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.locations)
      ? data.locations
      : [];

  return list
    .map(normalize)
    .filter((location) => location && location.available);
}

// =========================================
// GET LOCATION BY ID
// =========================================

export async function getLocation(id) {
  if (!id) return null;

  const locations = await getLocations();

  return (
    locations.find(
      (location) => String(location.id) === String(id)
    ) || null
  );
}
