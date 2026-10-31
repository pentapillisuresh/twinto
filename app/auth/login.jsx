
import { useRef, useState } from "react";

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

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { sendOtp } from "../../services/authService";

// ==========================================
// PREMIUM COLORS
// ==========================================

const PREMIUM = {
  magenta: "#C9004F",
  magentaDark: "#A90042",
  navy: "#172033",
  navyLight: "#3C4352",
  white: "#FFFFFF",
  background: "#FFF9FB",
  pinkSoft: "#FFF0F5",
  pinkLight: "#FDE3EC",
  border: "#E9DDE2",
  muted: "#858B95",
  disabled: "#D9A8B9",
};

// ==========================================
// VALIDATION
// ==========================================

const cleanMobile = (value) =>
  String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);

const validMobile = (value) =>
  /^[6-9]\d{9}$/.test(value);

// ==========================================
// LOGIN SCREEN
// ==========================================

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const sendingRef = useRef(false);

  const isValid = validMobile(mobile);

  // ========================================
  // SEND OTP
  // ========================================

  async function handleContinue() {
    if (sendingRef.current) {
      return;
    }

    const number = cleanMobile(mobile);

    if (!number) {
      Alert.alert(
        "Mobile Number",
        "Please enter your mobile number."
      );
      return;
    }

    if (!validMobile(number)) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    sendingRef.current = true;
    setLoading(true);

    Keyboard.dismiss();

    try {
      // Calls existing backend:
      // POST /api/v1/auth/send-otp
      const response = await sendOtp(number);

      // Do not navigate if the API explicitly
      // reports a failed request.
      if (response?.success === false) {
        throw new Error(
          response?.message || "Unable to send OTP."
        );
      }

      // Pass mobile number to OTP screen.
      // OTP is never generated in the app.
      router.push({
        pathname: "/auth/otp",
        params: {
          mobile: number,
          resendAfter: String(
            response?.data?.resendAfter ??
              response?.resendAfter ??
              60
          ),
        },
      });
    } catch (error) {
      Alert.alert(
        "Unable to Send OTP",
        error?.message ||
          "Please check your internet connection and try again."
      );
    } finally {
      sendingRef.current = false;
      setLoading(false);
    }
  }

  // ========================================
  // MOBILE NUMBER CHANGE
  // ========================================

  function handleMobileChange(text) {
    setMobile(cleanMobile(text));
  }

  // ========================================
  // UI
  // ========================================

  return (
    <SafeAreaView style={styles.safeArea}>
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* HERO */}
          <View style={styles.hero}>
            <View style={styles.circleLarge} />
            <View style={styles.circleSmall} />

            <Image
              source={require("../../assets/images/loginbg.png")}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* LOGIN CARD */}
          <View style={styles.loginCard}>
            <View style={styles.handle} />

            {/* HEADING */}
            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Sign in with your mobile number{"\n"}
              to continue shopping.
            </Text>

            {/* MOBILE LABEL */}
            <Text style={styles.label}>
              Mobile Number
            </Text>

            {/* PHONE INPUT */}
            <View
              style={[
                styles.phoneBox,
                isValid && styles.phoneBoxActive,
              ]}
            >
              <View style={styles.phoneIcon}>
                <Ionicons
                  name="call-outline"
                  size={19}
                  color={PREMIUM.magenta}
                />
              </View>

              <Text style={styles.prefix}>
                +91
              </Text>

              <View style={styles.verticalDivider} />

              <TextInput
                value={mobile}
                onChangeText={handleMobileChange}
                keyboardType="number-pad"
                placeholder="Enter mobile number"
                placeholderTextColor="#A1A5AD"
                style={styles.input}
                maxLength={10}
                returnKeyType="done"
                autoCorrect={false}
                autoCapitalize="none"
                textContentType="telephoneNumber"
                autoComplete="tel-national"
                editable={!loading}
                onSubmitEditing={
                  isValid && !loading
                    ? handleContinue
                    : undefined
                }
              />

              {isValid && (
                <View style={styles.checkCircle}>
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={PREMIUM.white}
                  />
                </View>
              )}
            </View>

            {/* CONTINUE BUTTON */}
            <Pressable
              onPress={handleContinue}
              disabled={!isValid || loading}
              accessibilityRole="button"
              accessibilityLabel="Send OTP"
              style={({ pressed }) => [
                styles.continueButton,
                (!isValid || loading) &&
                  styles.continueDisabled,
                pressed &&
                  isValid &&
                  !loading &&
                  styles.buttonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  color={PREMIUM.white}
                  style={styles.buttonLoader}
                />
              ) : (
                <Text style={styles.continueText}>
                  Continue
                </Text>
              )}

              <View style={styles.arrowCircle}>
                {loading ? (
                  <Ionicons
                    name="hourglass-outline"
                    size={18}
                    color={PREMIUM.magenta}
                  />
                ) : (
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={PREMIUM.magenta}
                  />
                )}
              </View>
            </Pressable>

            {/* SECURITY MESSAGE */}
            <View style={styles.securityRow}>
              <View style={styles.securityIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color={PREMIUM.magenta}
                />
              </View>

              <Text style={styles.securityText}>
                Your number is secure and private
              </Text>
            </View>

            {/* TERMS */}
            <Text style={styles.terms}>
              By continuing, you agree to our
            </Text>

            <View style={styles.termsRow}>
              <Text style={styles.termsLink}>
                Terms & Conditions
              </Text>

              <Text style={styles.termsNormal}>
                {"  "}and{"  "}
              </Text>

              <Text style={styles.termsLink}>
                Privacy Policy
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
    height: 300,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  circleLarge: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: PREMIUM.pinkLight,
    top: -125,
    right: -80,
  },

  circleSmall: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: PREMIUM.white,
    opacity: 0.5,
    bottom: -95,
    left: -65,
  },

  heroImage: {
    width: "105%",
    height: "105%",
    zIndex: 2,
    marginTop: 90,
  },

  loginCard: {
    flexGrow: 1,
    backgroundColor: PREMIUM.white,
    marginHorizontal: 12,
    marginTop: -25,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 23,
    paddingTop: 12,
    paddingBottom: 24,
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: 10,
    backgroundColor: "#E3E0E2",
    alignSelf: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    color: PREMIUM.navy,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: PREMIUM.muted,
    textAlign: "center",
  },

  label: {
    marginTop: 17,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "800",
    color: PREMIUM.navy,
  },

  phoneBox: {
    height: 54,
    borderWidth: 1.2,
    borderColor: PREMIUM.border,
    borderRadius: 17,
    backgroundColor: "#FFFDFE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  phoneBoxActive: {
    borderColor: PREMIUM.magenta,
    backgroundColor: "#FFF8FA",
  },

  phoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FCE8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  prefix: {
    fontSize: 14,
    fontWeight: "900",
    color: PREMIUM.navy,
  },

  verticalDivider: {
    width: 1,
    height: 23,
    backgroundColor: "#E4DDE1",
    marginHorizontal: 10,
  },

  input: {
    flex: 1,
    height: 52,
    paddingVertical: 0,
    fontSize: 15,
    fontWeight: "600",
    color: PREMIUM.navy,
  },

  checkCircle: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: PREMIUM.magenta,
    alignItems: "center",
    justifyContent: "center",
  },

  continueButton: {
    height: 56,
    borderRadius: 30,
    backgroundColor: PREMIUM.magenta,
    marginTop: 13,
    paddingLeft: 20,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: PREMIUM.magenta,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
  },

  continueDisabled: {
    backgroundColor: PREMIUM.disabled,
    shadowOpacity: 0,
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  continueText: {
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
    gap: 6,
  },

  securityIcon: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#FCE8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  securityText: {
    fontSize: 11,
    color: PREMIUM.muted,
    fontWeight: "600",
  },

  terms: {
    marginTop: 12,
    fontSize: 10,
    color: "#A0A3AA",
    textAlign: "center",
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  termsLink: {
    fontSize: 10,
    color: PREMIUM.magenta,
    fontWeight: "800",
  },

  termsNormal: {
    fontSize: 10,
    color: "#A0A3AA",
  },
});
