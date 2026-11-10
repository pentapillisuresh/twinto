
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
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
  sendOtp,
  verifyOtp,
} from "../../services/authService";

import { useAuth } from "../../context";

// ==========================================
// LOGO
// ==========================================

const LOGO = require("../../assets/images/logo1.png");

// ==========================================
// COLORS
// ==========================================

const C = {
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
  green: "#169B62",
};

// ==========================================
// CONSTANTS
// ==========================================

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

  // ========================================
  // STATE
  // ========================================

  const [otp, setOtp] = useState("");

  const [verifying, setVerifying] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(initialResendAfter);

  const [focused, setFocused] =
    useState(false);

  // ========================================
  // REFS
  // ========================================

  const inputRef = useRef(null);

  const verifyingRef = useRef(false);
  const resendingRef = useRef(false);

  const resendUntilRef = useRef(
    Date.now() + initialResendAfter * 1000
  );

  // ========================================
  // VALIDATION
  // ========================================

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
  // RESEND COUNTDOWN
  // ========================================

  useEffect(() => {
    function updateCountdown() {
      const remaining = Math.max(
        0,
        Math.ceil(
          (resendUntilRef.current - Date.now()) /
            1000
        )
      );

      setRemainingSeconds(remaining);
    }

    updateCountdown();

    const interval = setInterval(
      updateCountdown,
      1000
    );

    return () => clearInterval(interval);
  }, []);

  // ========================================
  // AUTO FOCUS OTP INPUT
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

  // ========================================
  // FOCUS INPUT
  // ========================================

  function focusOtpInput() {
    if (!verifying && !resending) {
      inputRef.current?.focus();
    }
  }

  // ========================================
  // OTP INPUT HANDLER
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
    if (
      verifyingRef.current ||
      resendingRef.current
    ) {
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
      const response = await verifyOtp(
        mobile,
        otp
      );

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            "OTP verification failed."
        );
      }

      // Supports wrapped and unwrapped responses.
      const authData = response?.data?.token
        ? response.data
        : response;

      if (
        !authData?.token ||
        !authData?.user
      ) {
        throw new Error(
          "Invalid login response from server."
        );
      }

      // ====================================
      // SAVE JWT AND USER
      // ====================================

      await login(authData);

      setOtp("");

      // ====================================
      // CHECK CUSTOMER PROFILE
      // ====================================

      const needsProfileSetup =
        authData.needsProfileSetup ??
        (
          !authData.user?.name ||
          String(authData.user.name)
            .trim()
            .toLowerCase() === "customer"
        );

      // ====================================
      // NAVIGATION
      // ====================================

      if (needsProfileSetup) {
        router.replace(
          "/auth/complete-profile"
        );
      } else {
        router.replace("/location");
      }
    } catch (error) {
      console.error(
        "[OTP VERIFY ERROR]",
        error
      );

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
          response?.message ||
            "Unable to resend OTP."
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
      const message = String(
        error?.message || ""
      );

      // Preserve backend resend cooldown.
      const match = message.match(
        /wait\s+(\d+)\s+seconds?/i
      );

      if (match) {
        const wait = parseResendSeconds(
          match[1]
        );

        resendUntilRef.current =
          Date.now() + wait * 1000;

        setRemainingSeconds(wait);
      }

      console.error(
        "[OTP RESEND ERROR]",
        error
      );

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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <View style={styles.header}>
            <Pressable
              onPress={changeNumber}
              disabled={verifying || resending}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color={C.navy}
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              Mobile Verification
            </Text>

            <View style={styles.headerRight} />
          </View>

          {/* ================================= */}
          {/* LOGO */}
          {/* ================================= */}

          <View style={styles.logoSection}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="TWINTO logo"
            />
          </View>

          {/* ================================= */}
          {/* TITLE */}
          {/* ================================= */}

          <View style={styles.intro}>
            <Text style={styles.title}>
              Verify your number
            </Text>

            <Text style={styles.subtitle}>
              Enter the 4-digit verification code
              sent to your mobile number.
            </Text>
          </View>

          {/* ================================= */}
          {/* VERIFIED MOBILE DETAILS */}
          {/* ================================= */}

          <View style={styles.mobileCard}>
            <View style={styles.mobileIcon}>
              <Ionicons
                name="phone-portrait-outline"
                size={19}
                color={C.primary}
              />
            </View>

            <View style={styles.mobileInfo}>
              <Text style={styles.mobileLabel}>
                OTP sent to
              </Text>

              <Text style={styles.mobileNumber}>
                +91 {mobile || ""}
              </Text>
            </View>

            <Pressable
              onPress={changeNumber}
              disabled={verifying || resending}
              style={styles.changeButton}
            >
              <Text style={styles.changeText}>
                Change
              </Text>
            </Pressable>
          </View>

          {/* ================================= */}
          {/* OTP FORM */}
          {/* ================================= */}

          <View style={styles.formSection}>
            <Text style={styles.otpLabel}>
              Verification Code
            </Text>

            {/* OTP BOXES */}

            <Pressable
              onPress={focusOtpInput}
              style={styles.otpWrapper}
            >
              {Array.from({
                length: OTP_LENGTH,
              }).map((_, index) => {
                const digit = otp[index] || "";

                const active =
                  focused &&
                  index === otp.length &&
                  otp.length < OTP_LENGTH;

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      active &&
                        styles.otpBoxActive,
                      digit &&
                        styles.otpBoxFilled,
                    ]}
                  >
                    <Text style={styles.otpDigit}>
                      {digit}
                    </Text>
                  </View>
                );
              })}

              {/* REAL INPUT FOR SMS AUTOFILL */}

              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={OTP_LENGTH}
                autoComplete={
                  Platform.OS === "android"
                    ? "sms-otp"
                    : "one-time-code"
                }
                textContentType="oneTimeCode"
                importantForAutofill="yes"
                returnKeyType="done"
                editable={
                  !verifying && !resending
                }
                caretHidden
                selectionColor={C.primary}
                style={styles.realInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={() => {
                  if (canVerify) {
                    handleVerify();
                  }
                }}
              />
            </Pressable>

            {/* AUTOFILL INFO */}

            <View style={styles.autoFillRow}>
              <Ionicons
                name="information-circle-outline"
                size={15}
                color={C.muted}
              />

              <Text style={styles.autoFillText}>
                Enter the OTP or use the SMS
                autofill suggestion.
              </Text>
            </View>

            {/* ================================= */}
            {/* RESEND OTP */}
            {/* ================================= */}

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
                    color={C.primary}
                  />
                ) : (
                  <Text
                    style={[
                      styles.resendText,
                      !canResend &&
                        styles.resendDisabled,
                    ]}
                  >
                    {remainingSeconds > 0
                      ? `Resend in ${remainingSeconds}s`
                      : "Resend OTP"}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* ================================= */}
            {/* VERIFY BUTTON */}
            {/* ================================= */}

            <Pressable
              onPress={handleVerify}
              disabled={!canVerify}
              accessibilityRole="button"
              accessibilityLabel="Verify OTP"
              style={({ pressed }) => [
                styles.verifyButton,
                !canVerify &&
                  styles.verifyDisabled,
                pressed &&
                  canVerify &&
                  styles.buttonPressed,
              ]}
            >
              {verifying ? (
                <ActivityIndicator
                  color={C.white}
                  size="small"
                />
              ) : (
                <>
                  <Text style={styles.verifyText}>
                    Verify & Continue
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color={C.white}
                  />
                </>
              )}
            </Pressable>

            {/* ================================= */}
            {/* SECURITY */}
            {/* ================================= */}

            <View style={styles.securityRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={C.green}
              />

              <Text style={styles.securityText}>
                Secure verification powered by TWINTO
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  // ========================================
  // HEADER
  // ========================================

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.navy,
  },

  headerRight: {
    width: 40,
  },

  pressed: {
    opacity: 0.7,
  },

  // ========================================
  // LOGO
  // ========================================

  logoSection: {
    height: 118,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 10,
  },

  logo: {
    width: 150,
    height: 110,
  },

  // ========================================
  // INTRO
  // ========================================

  intro: {
    marginBottom: 23,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: C.navy,
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: C.muted,
    maxWidth: 320,
  },

  // ========================================
  // MOBILE CARD
  // ========================================

  mobileCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  mobileIcon: {
    width: 39,
    height: 39,
    borderRadius: 10,
    backgroundColor: C.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  mobileInfo: {
    flex: 1,
    marginLeft: 12,
  },

  mobileLabel: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 4,
  },

  mobileNumber: {
    fontSize: 14,
    fontWeight: "900",
    color: C.navy,
  },

  changeButton: {
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  changeText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.primary,
  },

  // ========================================
  // OTP FORM
  // ========================================

  formSection: {
    width: "100%",
  },

  otpLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: C.navy,
    marginBottom: 12,
  },

  otpWrapper: {
    width: "100%",
    height: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    gap: 10,
  },

  otpBox: {
    flex: 1,
    height: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },

  otpBoxActive: {
    borderWidth: 2,
    borderColor: C.primary,
    backgroundColor: "#FFFAFC",
  },

  otpBoxFilled: {
    borderColor: C.primary,
    backgroundColor: C.pinkSoft,
  },

  otpDigit: {
    fontSize: 22,
    fontWeight: "900",
    color: C.navy,
    textAlign: "center",
  },

  realInput: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: 58,
    backgroundColor: "transparent",
    color: "transparent",
    fontSize: 1,
    padding: 0,
    margin: 0,
    opacity: 0.02,
    zIndex: 20,
  },

  autoFillRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  autoFillText: {
    flex: 1,
    fontSize: 11,
    color: C.muted,
    lineHeight: 17,
  },

  // ========================================
  // RESEND OTP
  // ========================================

  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    gap: 6,
  },

  resendNormal: {
    fontSize: 12,
    color: C.muted,
  },

  resendText: {
    fontSize: 12,
    color: C.primary,
    fontWeight: "900",
  },

  resendDisabled: {
    color: C.muted,
  },

  // ========================================
  // VERIFY BUTTON
  // ========================================

  verifyButton: {
    width: "100%",
    height: 54,
    borderRadius: 11,
    backgroundColor: C.primary,
    marginTop: 27,
    paddingHorizontal: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  verifyDisabled: {
    backgroundColor: C.disabled,
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  verifyText: {
    fontSize: 15,
    fontWeight: "900",
    color: C.white,
  },

  // ========================================
  // SECURITY
  // ========================================

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    gap: 7,
  },

  securityText: {
    fontSize: 10,
    color: C.muted,
    fontWeight: "600",
  },
});
