// services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants";

const TOKEN_KEY = "twinto_token_v2";
let memoryToken = null;

export async function setToken(token) {
  memoryToken = token || null;
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.log("setToken error:", e);
  }
}

export async function getToken() {
  if (memoryToken) return memoryToken;
  try {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    memoryToken = t || null;
    return memoryToken;
  } catch (e) {
    return null;
  }
}

export async function clearToken() {
  memoryToken = null;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
}

export async function apiRequest(endpoint, options = {}) {
  const token = await getToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint}`;

  console.log(`[API] ${options.method || "GET"} ${url}`);

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    console.log("[API] Network error:", networkError);
    throw new Error("Cannot reach server. Check your connection.");
  }

  let body = null;
  try {
    body = await response.json();
  } catch (e) {
    body = null;
  }

  if (body && typeof body.success === "boolean") {
    if (body.success) return body.data;
    throw new Error(body.message || "Request failed");
  }

  if (!response.ok) {
    throw new Error(
      (body && body.message) || `API Error: ${response.status}`
    );
  }

  return body;
}