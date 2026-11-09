
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router, useLocalSearchParams } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { sendOtp, verifyOtp } from "../../services/authService";

import { useAuth } from "../../context";

// ==========================================
// LOGO
// ==========================================

// Assumes this file is in app/auth/ or a similar
// two-level-deep folder, as in your existing imports.
const LOGO = require("../../assets/images/twintologo512.png");

// ==========================================
// PREMIUM COLORS
// ==========================================

const PREMIUM = {
  primary: "#C9004F",
  primaryDark: "#A90042",
  navy: "#172033",
  white: "#FFFFFF",
  background: "#FFF9FB",
  pinkSoft: "#FFF0F5",
  pinkLight: "#FDE3EC",
  border: "#E9DDE2",
  muted: "#858B95",
  disabled: "#D9A8B9",
};

const OTP_LENGTH = 4;
const DEFAULT_RESEND_SECONDS = 60;

const validMobile = (value) =>
  /^[6-9]\d{9}$/.test(String(value || ""));

function parseResendSeconds(value) {
  const seconds = Number(value);

  if (!Number.isFinite(seconds) || seconds < 0) {
    return DEFAULT_RESEND_SECONDS;
  }

  return Math.min(Math.ceil(seconds), 3600);
}

// ==========================================
// OTP SCREEN
// ==========================================

export default function OTP() {
  const params = useLocalSearchParams();

  const mobile = Array.isArray(params.mobile)
    ? params.mobile[0]
    : params.mobile;

  const initialResendAfter = parseResendSeconds(
    Array.isArray(params.resendAfter)
      ? params.resendAfter[0]
      : params.resendAfter
  );

  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [remainingSeconds, setRemainingSeconds] =
    useState(initialResendAfter);

  const inputRef = useRef(null);
  const verifyingRef = useRef(false);
  const resendingRef = useRef(false);

  const resendUntilRef = useRef(
    Date.now() + initialResendAfter * 1000
  );

  const canVerify =
    otp.length === OTP_LENGTH &&
    !verifying &&
    !resending &&
    validMobile(mobile);

  const canResend =
    remainingSeconds === 0 &&
    !verifying &&
    !resending &&
    validMobile(mobile);

  // ========================================
  // COUNTDOWN TIMER
  // ========================================

  useEffect(() => {
    function updateCountdown() {
      const remaining = Math.max(
        0,
        Math.ceil(
          (resendUntilRef.current - Date.now()) / 1000
        )
      );

      setRemainingSeconds(remaining);
    }

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // ========================================
  // FOCUS OTP INPUT
  // ========================================

  useEffect(() => {
    if (!validMobile(mobile)) {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);

    return () => clearTimeout(timer);
  }, [mobile]);

  function focusOtpInput() {
    if (!verifying && !resending) {
      inputRef.current?.focus();
    }
  }

  // ========================================
  // HANDLE OTP INPUT
  // ========================================

  function handleOtpChange(text) {
    const cleaned = String(text || "")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    setOtp(cleaned);
  }

  // ========================================
  // VERIFY OTP
  // ========================================

  async function handleVerify() {
    if (verifyingRef.current || resendingRef.current) {
      return;
    }

    if (!validMobile(mobile)) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please return to the login screen and enter your mobile number."
      );
      return;
    }

    if (!/^\d{4}$/.test(otp)) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 4-digit OTP sent to your mobile number."
      );
      return;
    }

    verifyingRef.current = true;
    setVerifying(true);

    Keyboard.dismiss();

    try {
      // POST /api/v1/auth/verify-otp
      const response = await verifyOtp(mobile, otp);

      if (response?.success === false) {
        throw new Error(
          response?.message || "OTP verification failed."
        );
      }

      // Supports both wrapped and unwrapped API responses.
      const authData = response?.data?.token
        ? response.data
        : response;

      if (!authData?.token || !authData?.user) {
        throw new Error(
          "Invalid login response from server."
        );
      }

      // Pass token and user to existing auth context.
      await login(authData);

      setOtp("");

      router.replace("/location");
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error?.message ||
          "Unable to verify OTP. Please try again."
      );
    } finally {
      verifyingRef.current = false;
      setVerifying(false);
    }
  }

  // ========================================
  // RESEND OTP
  // ========================================

  async function handleResend() {
    if (
      resendingRef.current ||
      verifyingRef.current ||
      Date.now() < resendUntilRef.current
    ) {
      return;
    }

    if (!validMobile(mobile)) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please return to the login screen."
      );
      return;
    }

    resendingRef.current = true;
    setResending(true);

    Keyboard.dismiss();

    try {
      // POST /api/v1/auth/send-otp
      const response = await sendOtp(mobile);

      if (response?.success === false) {
        throw new Error(
          response?.message || "Unable to resend OTP."
        );
      }

      const resendAfter = parseResendSeconds(
        response?.data?.resendAfter ??
          response?.resendAfter ??
          DEFAULT_RESEND_SECONDS
      );

      resendUntilRef.current =
        Date.now() + resendAfter * 1000;

      setRemainingSeconds(resendAfter);
      setOtp("");

      Alert.alert(
        "OTP Sent",
        "A new verification code has been sent to your mobile number."
      );

      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } catch (error) {
      // If the server reports a cooldown, apply it locally.
      const message = String(error?.message || "");

      const match = message.match(
        /wait\s+(\d+)\s+seconds?/i
      );

      if (match) {
        const wait = parseResendSeconds(match[1]);

        resendUntilRef.current =
          Date.now() + wait * 1000;

        setRemainingSeconds(wait);
      }

      Alert.alert(
        "Unable to Resend OTP",
        message ||
          "Please check your connection and try again."
      );
    } finally {
      resendingRef.current = false;
      setResending(false);
    }
  }

  // ========================================
  // CHANGE MOBILE NUMBER
  // ========================================

  function changeNumber() {
    if (verifying || resending) {
      return;
    }

    Keyboard.dismiss();
    router.back();
  }

  // ========================================
  // SCREEN
  // ========================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* HERO */}
          <View style={styles.hero}>
            <View style={styles.circleLarge} />
            <View style={styles.circleSmall} />

            {/* LOGO REPLACES ORIGINAL TEXT */}
            <LogoArtwork />

            <Pressable
              onPress={changeNumber}
              disabled={verifying || resending}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={PREMIUM.navy}
              />
            </Pressable>
          </View>

          {/* OTP CARD */}
          <View style={styles.card}>
            <View style={styles.handle} />

            <View style={styles.lockCircle}>
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={PREMIUM.primary}
              />
            </View>

            <Text style={styles.title}>
              Verify your number
            </Text>

            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to
            </Text>

            {/* MOBILE NUMBER */}
            <View style={styles.mobileRow}>
              <Text style={styles.mobileNumber}>
                +91 {mobile || ""}
              </Text>

              <Pressable
                onPress={changeNumber}
                disabled={verifying || resending}
              >
                <Text style={styles.changeText}>
                  Change
                </Text>
              </Pressable>
            </View>

            {/* OTP INPUT */}
            <Text style={styles.otpLabel}>
              Verification Code
            </Text>

            <Pressable
              onPress={focusOtpInput}
              style={styles.otpWrapper}
            >
              {Array.from({
                length: OTP_LENGTH,
              }).map((_, index) => {
                const digit = otp[index] || "";

                const active =
                  index ===
                  Math.min(
                    otp.length,
                    OTP_LENGTH - 1
                  );

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      active && styles.otpBoxActive,
                      digit && styles.otpBoxFilled,
                    ]}
                  >
                    <Text style={styles.otpDigit}>
                      {digit}
                    </Text>
                  </View>
                );
              })}

              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={OTP_LENGTH}
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                returnKeyType="done"
                editable={!verifying && !resending}
                caretHidden
                selectionColor={PREMIUM.primary}
                style={styles.realInput}
                onSubmitEditing={() => {
                  if (canVerify) {
                    handleVerify();
                  }
                }}
              />
            </Pressable>

            <Text style={styles.otpHint}>
              Enter the 4-digit OTP
            </Text>

            {/* RESEND OTP */}
            <View style={styles.resendRow}>
              <Text style={styles.resendNormal}>
                Didn't receive the code?
              </Text>

              <Pressable
                onPress={handleResend}
                disabled={!canResend}
              >
                {resending ? (
                  <ActivityIndicator
                    size="small"
                    color={PREMIUM.primary}
                  />
                ) : (
                  <Text
                    style={[
                      styles.resendText,
                      !canResend && styles.resendDisabled,
                    ]}
                  >
                    {remainingSeconds > 0
                      ? `Resend in ${remainingSeconds}s`
                      : "Resend OTP"}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* VERIFY BUTTON */}
            <Pressable
              onPress={handleVerify}
              disabled={!canVerify}
              accessibilityRole="button"
              accessibilityLabel="Verify OTP"
              style={({ pressed }) => [
                styles.verifyButton,
                !canVerify && styles.verifyDisabled,
                pressed &&
                  canVerify &&
                  styles.buttonPressed,
              ]}
            >
              {verifying ? (
                <ActivityIndicator
                  color={PREMIUM.white}
                  style={styles.buttonLoader}
                />
              ) : (
                <Text style={styles.verifyText}>
                  Verify & Continue
                </Text>
              )}

              <View style={styles.arrowCircle}>
                <Ionicons
                  name={
                    verifying
                      ? "hourglass-outline"
                      : "arrow-forward"
                  }
                  size={18}
                  color={PREMIUM.primary}
                />
              </View>
            </Pressable>

            {/* SECURITY */}
            <View style={styles.securityRow}>
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color={PREMIUM.muted}
              />

              <Text style={styles.securityText}>
                Your verification is secure
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================
// LOGO ARTWORK
// ==========================================

function LogoArtwork() {
  return (
    <View style={styles.imageArea}>
      <View style={styles.imageCard}>
        <Image
          source={LOGO}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="TWINTO logo"
        />
      </View>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  hero: {
    height: 275,
    width: "100%",
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  circleLarge: {
    position: "absolute",
    width: 370,
    height: 370,
    borderRadius: 185,
    backgroundColor: PREMIUM.pinkLight,
    top: -145,
    right: -100,
  },

  circleSmall: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: PREMIUM.white,
    opacity: 0.5,
    bottom: -110,
    left: -65,
  },

  imageArea: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  imageCard: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    overflow: "hidden",
  },

  logo: {
    width: 185,
    height: 185,
  },

  backButton: {
    position: "absolute",
    top: 15,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 4,
  },

  pressed: {
    opacity: 0.7,
  },

  card: {
    flexGrow: 1,
    backgroundColor: PREMIUM.white,
    marginHorizontal: 10,
    marginTop: -25,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 23,
    paddingTop: 10,
    paddingBottom: 24,
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    alignItems: "center",
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: 10,
    backgroundColor: "#E3E0E2",
    marginBottom: 10,
  },

  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FCE8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  title: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    color: PREMIUM.navy,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 18,
    color: PREMIUM.muted,
    textAlign: "center",
  },

  mobileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    gap: 10,
  },

  mobileNumber: {
    fontSize: 14,
    color: PREMIUM.navy,
    fontWeight: "900",
  },

  changeText: {
    fontSize: 12,
    color: PREMIUM.primary,
    fontWeight: "900",
  },

  otpLabel: {
    width: "100%",
    marginTop: 14,
    marginBottom: 7,
    fontSize: 12,
    color: PREMIUM.navy,
    fontWeight: "800",
  },

  otpWrapper: {
    width: "100%",
    height: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
  },

  otpBox: {
    flex: 1,
    maxWidth: 65,
    height: 52,
    marginHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: PREMIUM.border,
    backgroundColor: "#FFFDFE",
    alignItems: "center",
    justifyContent: "center",
  },

  otpBoxActive: {
    borderWidth: 2,
    borderColor: PREMIUM.primary,
    backgroundColor: "#FFF8FA",
  },

  otpBoxFilled: {
    borderColor: PREMIUM.primary,
    backgroundColor: "#FFF8FA",
  },

  otpDigit: {
    fontSize: 20,
    fontWeight: "900",
    color: PREMIUM.navy,
    textAlign: "center",
  },

  realInput: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: 52,
    backgroundColor: "transparent",
    color: "transparent",
    fontSize: 1,
    padding: 0,
    margin: 0,
    opacity: 0.02,
    zIndex: 20,
  },

  otpHint: {
    marginTop: 5,
    fontSize: 10,
    color: PREMIUM.muted,
    fontWeight: "500",
  },

  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 5,
  },

  resendNormal: {
    fontSize: 11,
    color: PREMIUM.muted,
  },

  resendText: {
    fontSize: 11,
    color: PREMIUM.primary,
    fontWeight: "900",
  },

  resendDisabled: {
    color: PREMIUM.muted,
  },

  verifyButton: {
    width: "100%",
    height: 54,
    borderRadius: 29,
    backgroundColor: PREMIUM.primary,
    marginTop: 16,
    paddingLeft: 20,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: PREMIUM.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
  },

  verifyDisabled: {
    backgroundColor: PREMIUM.disabled,
    shadowOpacity: 0,
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  verifyText: {
    flex: 1,
    color: PREMIUM.white,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },

  buttonLoader: {
    flex: 1,
  },

  arrowCircle: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 5,
  },

  securityText: {
    fontSize: 10,
    color: PREMIUM.muted,
    fontWeight: "600",
  },
});
