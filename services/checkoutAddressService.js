
import AsyncStorage from "@react-native-async-storage/async-storage";

/* =========================================
   STORAGE CONFIGURATION
========================================= */

const CHECKOUT_ADDRESS_KEY =
  "twinto_selected_checkout_address";

/* =========================================
   COMMON HELPERS
========================================= */

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
   SAVE SELECTED CHECKOUT ADDRESS
========================================= */

export async function saveCheckoutAddress(address) {
  const addressId = validId(address?.id);

  if (!addressId) {
    throw new Error(
      "Please select a valid delivery address."
    );
  }

  await AsyncStorage.setItem(
    CHECKOUT_ADDRESS_KEY,
    String(addressId)
  );

  return addressId;
}

/* =========================================
   GET SAVED CHECKOUT ADDRESS ID
========================================= */

export async function getCheckoutAddressId() {
  try {
    const savedId = await AsyncStorage.getItem(
      CHECKOUT_ADDRESS_KEY
    );

    return validId(savedId);
  } catch (error) {
    console.log(
      "[CHECKOUT ADDRESS] Read error:",
      error?.message
    );

    return null;
  }
}

/* =========================================
   CLEAR SAVED CHECKOUT ADDRESS
========================================= */

export async function clearCheckoutAddress() {
  await AsyncStorage.removeItem(
    CHECKOUT_ADDRESS_KEY
  );
}

/* =========================================
   CHECK ADDRESS BELONGS TO LOCATION
========================================= */

export function addressBelongsToLocation(
  address,
  selectedLocationId
) {
  if (!address || typeof address !== "object") {
    return false;
  }

  const locationId = validId(selectedLocationId);

  const addressLocationId = validId(
    address.locationId ?? address.location?.id
  );

  if (!locationId || !addressLocationId) {
    return false;
  }

  // Address must belong to selected delivery area.
  if (locationId !== addressLocationId) {
    return false;
  }

  // Inactive addresses cannot be used.
  if (address.isActive === false) {
    return false;
  }

  const location = address.location;

  // Location details are required to confirm availability.
  if (!location) {
    return false;
  }

  // Prevent inconsistent location data.
  if (validId(location.id) !== locationId) {
    return false;
  }

  // Delivery area must be active and available.
  if (
    location.isActive !== true ||
    location.isAvailable !== true
  ) {
    return false;
  }

  return true;
}

/* =========================================
   FIND SAVED ADDRESS FROM ADDRESS LIST
========================================= */

export async function getSavedCheckoutAddress(
  addresses,
  selectedLocationId
) {
  if (!Array.isArray(addresses)) {
    return null;
  }

  const savedId = await getCheckoutAddressId();

  if (!savedId) {
    return null;
  }

  const address = addresses.find(
    (item) => validId(item?.id) === savedId
  );

  if (!address) {
    return null;
  }

  if (
    !addressBelongsToLocation(
      address,
      selectedLocationId
    )
  ) {
    return null;
  }

  return address;
}

/* =========================================
   SAVE ADDRESS AFTER VALIDATION
========================================= */

export async function saveValidatedCheckoutAddress(
  address,
  selectedLocationId
) {
  if (
    !addressBelongsToLocation(
      address,
      selectedLocationId
    )
  ) {
    throw new Error(
      "This address is unavailable for the selected delivery location."
    );
  }

  return saveCheckoutAddress(address);
}
