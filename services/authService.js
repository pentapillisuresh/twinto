
import { apiRequest } from "./api";

// ==========================================
// HELPERS
// ==========================================

// Normalize Indian mobile number
function normalizeMobile(value) {
  const mobile = String(value ?? "").replace(/\D/g, "");

  // Support +91 country code if supplied.
  if (mobile.length === 12 && mobile.startsWith("91")) {
    return mobile.slice(2);
  }

  return mobile;
}

// Validate Indian mobile number
function validateMobile(value) {
  const mobile = normalizeMobile(value);

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new Error(
      "Please enter a valid 10-digit Indian mobile number."
    );
  }

  return mobile;
}

// Handle wrapped and unwrapped backend responses
function unwrapResponse(response) {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid response from server.");
  }

  if (response.success === false) {
    throw new Error(
      response.message || "Request failed. Please try again."
    );
  }

  // Your backend may return:
  // { success: true, message: "...", data: {...} }
  // or apiRequest may already return the data object.
  return response.data ?? response;
}

// ==========================================
// SEND OTP
// POST /api/v1/auth/send-otp
// ==========================================

export async function sendOtp(mobile) {
  const number = validateMobile(mobile);

  const response = await apiRequest("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({
      mobile: number,
    }),
  });

  const data = unwrapResponse(response);

  return {
    mobile: data.mobile ?? number,
    expiresIn: data.expiresIn ?? 300,
    resendAfter: data.resendAfter ?? 60,
  };
}

// ==========================================
// VERIFY OTP
// POST /api/v1/auth/verify-otp
// ==========================================

export async function verifyOtp(mobile, otp, name) {
  const number = validateMobile(mobile);

  const code = String(otp ?? "").trim();

  if (!/^\d{4}$/.test(code)) {
    throw new Error("Please enter a valid 4-digit OTP.");
  }

  const body = {
    mobile: number,
    otp: code,
  };

  // Optional customer name for first-time registration
  if (typeof name === "string" && name.trim()) {
    body.name = name.trim().slice(0, 100);
  }

  const response = await apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = unwrapResponse(response);

  if (!data.token || !data.user) {
    throw new Error(
      "Login response is missing authentication details."
    );
  }

  return {
    token: data.token,
    user: data.user,
  };
}

// ==========================================
// GET LOGGED-IN USER
// GET /api/v1/auth/me
// ==========================================

export async function getMe() {
  const response = await apiRequest("/auth/me");

  const data = unwrapResponse(response);

  if (!data.id) {
    throw new Error("Invalid user profile response.");
  }

  return data;
}

// ==========================================
// ADMIN LOGIN
// POST /api/v1/admin/auth/login
// ==========================================

export async function adminLogin(email, password) {
  const normalizedEmail = String(email ?? "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const response = await apiRequest("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: normalizedEmail,
      password,
    }),
  });

  const data = unwrapResponse(response);

  if (!data.token || !data.user) {
    throw new Error("Invalid admin login response.");
  }

  return {
    token: data.token,
    user: data.user,
  };
}
