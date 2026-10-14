// services/authService.js
// Real backend OTP flow. Backend uses fixed OTP 123456 in dev.

import { apiRequest } from "./api";

export async function sendOtp(mobile) {
  return apiRequest("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ mobile }),
  });
}

export async function verifyOtp(mobile, otp, name) {
  // Returns: { token: "<real JWT>", user: {...} }
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ mobile, otp, name }),
  });
}

export async function getMe() {
  return apiRequest("/auth/me");
}

export async function adminLogin(email, password) {
  return apiRequest("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}