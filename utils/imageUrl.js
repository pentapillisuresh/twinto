// utils/imageUrl.js

import { API_URL } from "../constants";

const API_BASE = String(API_URL || "").replace(/\/+$/, "");

// http://10.29.236.71:5000/api/v1
// becomes http://10.29.236.71:5000
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/i, "");

export function getImageUrl(image) {
  if (!image) return null;

  if (typeof image === "object") {
    image =
      image.url ||
      image.image ||
      image.path ||
      image.filename ||
      null;
  }

  if (typeof image !== "string") return null;

  const value = image.trim();

  if (!value) return null;

  // Fix URLs saved with localhost in MySQL.
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value)) {
    const path = value.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i,
      ""
    );

    return `${BACKEND_ORIGIN}${path}`;
  }

  // Already a complete URL.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Relative image path.
  return `${BACKEND_ORIGIN}/${value.replace(/^\/+/, "")}`;
}