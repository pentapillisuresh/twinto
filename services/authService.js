import { DUMMY_OTP } from "../constants";
import { apiRequest } from "./api";

const USE_DUMMY_DATA = true;

export async function sendOtp(mobile) {
  if (USE_DUMMY_DATA) {
    return {
      success: true,
      mobile,
    };
  }

  return apiRequest("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({
      mobile,
    }),
  });
}

export async function verifyOtp(mobile, otp) {
  if (USE_DUMMY_DATA) {
    if (otp !== DUMMY_OTP) {
      throw new Error(
        "Invalid OTP. Demo OTP is 123456."
      );
    }

    return {
      user: {
        id: "1",
        name: "ANIL",
        mobile,
      },

      token: "dummy-token",
    };
  }

  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      mobile,
      otp,
    }),
  });
}