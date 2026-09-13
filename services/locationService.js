import { locations } from "../data";
import { apiRequest } from "./api";

const USE_DUMMY_DATA = true;

export async function getLocations() {
  if (USE_DUMMY_DATA) {
    return locations;
  }

  return apiRequest("/locations");
}

export async function getLocation(id) {
  if (USE_DUMMY_DATA) {
    return (
      locations.find(
        (location) => location.id === String(id)
      ) || locations[2]
    );
  }

  return apiRequest(`/locations/${id}`);
}