
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants";

// ==========================================
// CONFIGURATION
// ==========================================

const TOKEN_KEY = "twinto_token_v2";
const REQUEST_TIMEOUT = 30000;

let memoryToken = null;
let tokenLoaded = false;

// ==========================================
// TOKEN MANAGEMENT
// ==========================================

export async function setToken(token) {
  const normalizedToken =
    typeof token === "string" && token.trim()
      ? token.trim()
      : null;

  // Persist first so a failed write does not
  // silently report a successful login.
  if (normalizedToken) {
    await AsyncStorage.setItem(
      TOKEN_KEY,
      normalizedToken
    );
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  memoryToken = normalizedToken;
  tokenLoaded = true;
}

export async function getToken() {
  if (tokenLoaded) {
    return memoryToken;
  }

  try {
    const storedToken =
      await AsyncStorage.getItem(TOKEN_KEY);

    memoryToken = storedToken || null;
    tokenLoaded = true;

    return memoryToken;
  } catch (error) {
    console.log(
      "[AUTH] Unable to read stored token:",
      error?.message
    );

    // Allow a future request to retry reading storage.
    return null;
  }
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);

  memoryToken = null;
  tokenLoaded = true;
}

// ==========================================
// URL HELPER
// ==========================================

function buildUrl(endpoint) {
  if (
    typeof endpoint !== "string" ||
    !endpoint.trim()
  ) {
    throw new Error("API endpoint is required.");
  }

  const path = endpoint.trim();

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!API_URL || typeof API_URL !== "string") {
    throw new Error("API_URL is not configured.");
  }

  const base = API_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${base}${normalizedPath}`;
}

// ==========================================
// ERROR MESSAGE HELPER
// ==========================================

function getErrorMessage(body, status) {
  if (typeof body === "string" && body.trim()) {
    return body;
  }

  if (body && typeof body === "object") {
    if (
      typeof body.message === "string" &&
      body.message.trim()
    ) {
      return body.message;
    }

    if (
      typeof body.error === "string" &&
      body.error.trim()
    ) {
      return body.error;
    }

    if (
      typeof body.error?.message === "string"
    ) {
      return body.error.message;
    }
  }

  if (status === 400) {
    return "Invalid request. Please check your details.";
  }

  if (status === 401) {
    return "Your session is invalid or has expired. Please log in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested service was not found.";
  }

  if (status === 408 || status === 504) {
    return "The server took too long to respond.";
  }

  if (status === 429) {
    return "Too many requests. Please wait and try again.";
  }

  if (status >= 500) {
    return "Server error. Please try again later.";
  }

  return `Request failed (${status}).`;
}

// ==========================================
// MAIN API REQUEST
// ==========================================

export async function apiRequest(endpoint, options = {}) {
  const {
    headers: customHeaders = {},
    timeout = REQUEST_TIMEOUT,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  const url = buildUrl(endpoint);
  const method = String(
    fetchOptions.method || "GET"
  ).toUpperCase();

  const token = await getToken();

  // Normalize custom headers without changing
  // their original values.
  const headers = new Headers(customHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Set JSON Content-Type only when appropriate.
  // FormData must set its own multipart boundary.
  const isFormData =
    typeof FormData !== "undefined" &&
    fetchOptions.body instanceof FormData;

  if (
    fetchOptions.body != null &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token && !headers.has("Authorization")) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  console.log(`[API] ${method} ${url}`);

  // ========================================
  // REQUEST TIMEOUT
  // ========================================

  const controller = new AbortController();

  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  const abortFromExternal = () => {
    controller.abort();
  };

  if (externalSignal?.aborted) {
    controller.abort();
  } else {
    externalSignal?.addEventListener?.(
      "abort",
      abortFromExternal,
      { once: true }
    );
  }

  let response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      method,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (timedOut) {
      throw new Error(
        "Request timed out. Please try again."
      );
    }

    if (
      controller.signal.aborted ||
      error?.name === "AbortError"
    ) {
      throw new Error("Request cancelled.");
    }

    console.log(
      "[API] Network error:",
      error?.message
    );

    throw new Error(
      "Cannot reach server. Check your internet connection and try again."
    );
  } finally {
    clearTimeout(timeoutId);

    externalSignal?.removeEventListener?.(
      "abort",
      abortFromExternal
    );
  }

  // ========================================
  // PARSE RESPONSE
  // ========================================

  let body = null;

  if (response.status !== 204) {
    const responseText = await response.text();

    if (responseText) {
      try {
        body = JSON.parse(responseText);
      } catch (error) {
        body = responseText;
      }
    }
  }

  // ========================================
  // HTTP ERROR HANDLING
  // ========================================

  if (!response.ok) {
    const message = getErrorMessage(
      body,
      response.status
    );

    console.log(
      `[API] HTTP ${response.status}: ${message}`
    );

    const error = new Error(message);

    error.status = response.status;
    error.data = body;

    throw error;
  }

  // ========================================
  // BACKEND RESPONSE HANDLING
  // ========================================

  // Preserve your existing behavior:
  //
  // { success: true, data: {...} }
  // returns {...}
  //
  // { success: false, message: "..." }
  // throws an error.

  if (
    body &&
    typeof body === "object" &&
    typeof body.success === "boolean"
  ) {
    if (!body.success) {
      const error = new Error(
        getErrorMessage(body, response.status)
      );

      error.status = response.status;
      error.data = body;

      throw error;
    }

    return body.data ?? null;
  }

  return body;
}
