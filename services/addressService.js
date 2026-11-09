
import { apiRequest } from "./api";

/* =========================================
   COMMON HELPERS
========================================= */

function toBoolean(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

function validId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

/* =========================================
   RESPONSE NORMALIZATION
========================================= */

function normalizeLocation(location) {
  if (!location || typeof location !== "object") {
    return null;
  }

  return {
    id: validId(location.id),

    name: location.name || location.city || "",
    city: location.city || "",
    state: location.state || "",
    pincode: location.pincode || "",

    platformFee: Number(location.platformFee ?? 5),
    minimumOrder: Number(location.minimumOrder ?? 5),
    deliveryCharge: Number(location.deliveryCharge ?? 30),

    freeDeliveryEnabled: toBoolean(
      location.freeDeliveryEnabled
    ),

    freeDeliveryMaxItems: Number(
      location.freeDeliveryMaxItems ?? 3
    ),

    deliveryTime:
      location.deliveryTime || "30-45 minutes",

    isAvailable: toBoolean(location.isAvailable),

    isActive: toBoolean(location.isActive),
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
    id: validId(address.id),
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

    isDefault: toBoolean(address.isDefault),

    isActive:
      address.isActive === undefined ||
      address.isActive === null
        ? true
        : toBoolean(address.isActive),

    locationId:
      validId(address.locationId) ||
      location?.id ||
      null,

    location,
  };
}

/* =========================================
   CHECK ADDRESS DELIVERY AVAILABILITY
========================================= */

export function isAddressServiceable(
  address,
  selectedLocationId = null
) {
  if (!address?.id || !address.isActive) {
    return false;
  }

  const addressLocationId = validId(
    address.locationId ?? address.location?.id
  );

  if (!addressLocationId) {
    return false;
  }

  if (
    selectedLocationId !== null &&
    selectedLocationId !== undefined
  ) {
    const selectedId = validId(selectedLocationId);

    if (
      !selectedId ||
      selectedId !== addressLocationId
    ) {
      return false;
    }
  }

  const location = address.location;

  if (!location) {
    return false;
  }

  if (validId(location.id) !== addressLocationId) {
    return false;
  }

  return (
    location.isActive === true &&
    location.isAvailable === true
  );
}

/* =========================================
   FILTER ADDRESSES BY SELECTED LOCATION
========================================= */

export function filterAddressesByLocation(
  addresses,
  selectedLocationId
) {
  if (!Array.isArray(addresses)) {
    return [];
  }

  const locationId = validId(selectedLocationId);

  if (!locationId) {
    return [];
  }

  return addresses.filter((address) =>
    isAddressServiceable(address, locationId)
  );
}

/* =========================================
   GET CUSTOMER ADDRESSES
   GET /addresses
========================================= */

export async function getAddresses(
  selectedLocationId = null
) {
  const data = await apiRequest("/addresses");

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.addresses)
      ? data.addresses
      : [];

  const addresses = list
    .map(toUI)
    .filter((address) => address?.id);

  if (
    selectedLocationId === null ||
    selectedLocationId === undefined
  ) {
    return addresses;
  }

  return filterAddressesByLocation(
    addresses,
    selectedLocationId
  );
}

/* =========================================
   GET SELECTED DELIVERY ADDRESS
========================================= */

export function getSelectedAddress(
  addresses,
  selectedAddressId,
  selectedLocationId
) {
  const availableAddresses =
    filterAddressesByLocation(
      addresses,
      selectedLocationId
    );

  const selectedId = validId(selectedAddressId);

  if (selectedId) {
    const selectedAddress = availableAddresses.find(
      (address) => validId(address.id) === selectedId
    );

    return selectedAddress || null;
  }

  return (
    availableAddresses.find(
      (address) => address.isDefault
    ) ||
    availableAddresses[0] ||
    null
  );
}

/* =========================================
   CREATE CUSTOMER ADDRESS
   POST /addresses
========================================= */

export async function createAddress(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error(
      "Address details are required."
    );
  }

  const locationId = validId(payload.locationId);

  if (!locationId) {
    throw new Error(
      "Please select a valid delivery location."
    );
  }

  const requestPayload = {
    ...payload,
    locationId,
  };

  const data = await apiRequest("/addresses", {
    method: "POST",
    body: JSON.stringify(requestPayload),
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
  const addressId = validId(id);

  if (!addressId) {
    throw new Error(
      "Valid address ID is required."
    );
  }

  if (!payload || typeof payload !== "object") {
    throw new Error(
      "Address details are required."
    );
  }

  const requestPayload = {
    ...payload,
  };

  if (requestPayload.locationId !== undefined) {
    const locationId = validId(
      requestPayload.locationId
    );

    if (!locationId) {
      throw new Error(
        "Please select a valid delivery location."
      );
    }

    requestPayload.locationId = locationId;
  }

  const data = await apiRequest(
    `/addresses/${addressId}`,
    {
      method: "PUT",
      body: JSON.stringify(requestPayload),
    }
  );

  const address = data?.address || data;

  return toUI(address);
}

/* =========================================
   DELETE CUSTOMER ADDRESS
   DELETE /addresses/:id
========================================= */

export async function deleteAddress(id) {
  const addressId = validId(id);

  if (!addressId) {
    throw new Error(
      "Valid address ID is required."
    );
  }

  return apiRequest(`/addresses/${addressId}`, {
    method: "DELETE",
  });
}
