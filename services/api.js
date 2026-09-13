// services/api.js

export const USE_DUMMY_DATA = true;

export const API_URL =
  "https://your-api-url.com/api";

export async function apiRequest(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );

  if (!response.ok) {
    throw new Error(
      `API Error: ${response.status}`
    );
  }

  return response.json();
}