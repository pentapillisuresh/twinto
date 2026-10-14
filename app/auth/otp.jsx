import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useLocalSearchParams, router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { verifyOtp } from "../../services/authService";

import { useAuth } from "../../context";


/* =========================================================
   PREMIUM COLORS
========================================================= */

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


/* =========================================================
   OTP SCREEN
========================================================= */

export default function OTP() {
  const { mobile } = useLocalSearchParams();

  const [otp, setOtp] = useState("");

  const inputRef = useRef(null);

  const { login } = useAuth();


  /* =======================================================
     FOCUS OTP INPUT
  ======================================================= */

  function focusOtpInput() {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }


  /* =======================================================
     VERIFY OTP
  ======================================================= */

  async function handleVerify() {
    if (otp.length !== 6) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 6-digit OTP."
      );

      return;
    }


    Keyboard.dismiss();


    try {
     const response = await verifyOtp(mobile, otp);
console.log("[OTP] verifyOtp response:", response);   // ← add this to verify
await login(response);                                // ✅ pass the FULL object
router.replace("/location");

    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error?.message ||
          "Unable to verify OTP."
      );
    }
  }


  /* =======================================================
     CHANGE MOBILE
  ======================================================= */

  function changeNumber() {
    Keyboard.dismiss();

    router.back();
  }


  /* =======================================================
     OTP CHANGE
  ======================================================= */

  function handleOtpChange(text) {
    const cleaned =
      text
        .replace(/[^0-9]/g, "")
        .slice(0, 6);

    setOtp(cleaned);
  }


  /* =======================================================
     AUTO FOCUS
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);

    return () => clearTimeout(timer);
  }, []);


  /* =======================================================
     SCREEN
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={0}
      >

        <View style={styles.container}>

          {/* =================================================
              TOP IMAGE
          ================================================= */}

          <View style={styles.hero}>

            {/* Decorative background */}

            <View style={styles.circleLarge} />

            <View style={styles.circleSmall} />


            {/* Login / grocery image */}

            <ImagePlaceholder />


            {/* Back button */}

            <Pressable
              onPress={changeNumber}
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


          {/* =================================================
              OTP CARD
          ================================================= */}

          <View style={styles.card}>

            {/* Handle */}

            <View style={styles.handle} />


            {/* Security icon */}

            <View style={styles.lockCircle}>

              <Ionicons
                name="shield-checkmark"
                size={24}
                color={PREMIUM.primary}
              />

            </View>


            {/* =================================================
                TITLE
            ================================================= */}

            <Text style={styles.title}>
              Verify your number
            </Text>


            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to
            </Text>


            {/* Mobile number */}

            <View style={styles.mobileRow}>

              <Text style={styles.mobileNumber}>
                +91 {mobile}
              </Text>


              <Pressable
                onPress={changeNumber}
              >

                <Text style={styles.changeText}>
                  Change
                </Text>

              </Pressable>

            </View>


            {/* =================================================
                OTP LABEL
            ================================================= */}

            <Text style={styles.otpLabel}>
              Verification Code
            </Text>


            {/* =================================================
                OTP BOXES
            ================================================= */}

            <Pressable
              onPress={focusOtpInput}
              style={styles.otpWrapper}
            >

              {/* Individual boxes */}

              {Array.from({
                length: 6,
              }).map((_, index) => {

                const digit =
                  otp[index] || "";

                const active =
                  index === otp.length;

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


              {/* =================================================
                  REAL TEXT INPUT
              ================================================= */}

              <TextInput
                ref={inputRef}

                value={otp}

                onChangeText={handleOtpChange}

                keyboardType={
                  Platform.OS === "ios"
                    ? "number-pad"
                    : "phone-pad"
                }

                inputMode="numeric"

                showSoftInputOnFocus={true}

                editable={true}

                autoFocus={true}

                maxLength={6}

                returnKeyType="done"

                style={styles.realInput}

                caretHidden={true}

                selectionColor={
                  PREMIUM.primary
                }

                onSubmitEditing={() => {
                  if (otp.length === 6) {
                    handleVerify();
                  }
                }}
              />

            </Pressable>


            {/* =================================================
                OTP STATUS
            ================================================= */}

            <Text style={styles.otpHint}>
              Enter the 6-digit OTP
            </Text>


            {/* =================================================
                RESEND
            ================================================= */}

            <View style={styles.resendRow}>

              <Text style={styles.resendNormal}>
                Didn't receive the code?
              </Text>


              <Pressable>

                <Text style={styles.resendText}>
                  Resend OTP
                </Text>

              </Pressable>

            </View>


            {/* =================================================
                VERIFY BUTTON
            ================================================= */}

            <Pressable
              onPress={handleVerify}
              disabled={otp.length !== 6}
              style={({ pressed }) => [
                styles.verifyButton,

                otp.length !== 6 &&
                  styles.verifyDisabled,

                pressed &&
                  otp.length === 6 &&
                  styles.buttonPressed,
              ]}
            >

              <Text style={styles.verifyText}>
                Verify & Continue
              </Text>


              <View style={styles.arrowCircle}>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={PREMIUM.primary}
                />

              </View>

            </Pressable>


            {/* =================================================
                DEMO BOX
            ================================================= */}

            <View style={styles.demoBox}>

              <View style={styles.demoIcon}>

                <Ionicons
                  name="key-outline"
                  size={15}
                  color={PREMIUM.primary}
                />

              </View>


              <View>

                <Text style={styles.demoTitle}>
                  Demo Mode
                </Text>

                <Text style={styles.demoText}>
                  Use OTP 123456
                </Text>

              </View>

            </View>


            {/* =================================================
                SECURITY
            ================================================= */}

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

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


/* =========================================================
   IMAGE COMPONENT
========================================================= */

function ImagePlaceholder() {
  return (
    <View style={styles.imageArea}>

      <View style={styles.imageCard}>

        <Ionicons
          name="bag-handle"
          size={54}
          color={PREMIUM.primary}
        />

        <Text style={styles.imageBrand}>
          TWINTO
        </Text>

        <Text style={styles.imageText}>
          Fresh groceries
        </Text>

      </View>

    </View>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* =======================================================
     SAFE AREA
  ======================================================= */

  safeArea: {
    flex: 1,

    backgroundColor:
      PREMIUM.background,
  },


  keyboard: {
    flex: 1,
  },


  /* =======================================================
     CONTAINER
  ======================================================= */

  container: {
    flex: 1,

    backgroundColor:
      PREMIUM.background,
  },


  /* =======================================================
     HERO
  ======================================================= */

  hero: {
    height: "39%",

    width: "100%",

    backgroundColor:
      PREMIUM.pinkSoft,

    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",

    position: "relative",
  },


  /* =======================================================
     CIRCLE
  ======================================================= */

  circleLarge: {
    position: "absolute",

    width: 370,

    height: 370,

    borderRadius: 185,

    backgroundColor:
      PREMIUM.pinkLight,

    top: -145,

    right: -100,
  },


  circleSmall: {
    position: "absolute",

    width: 190,

    height: 190,

    borderRadius: 95,

    backgroundColor:
      PREMIUM.white,

    opacity: 0.5,

    bottom: -110,

    left: -65,
  },


  /* =======================================================
     IMAGE AREA
  ======================================================= */

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

    backgroundColor:
      PREMIUM.white,

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
  },


  imageBrand: {
    marginTop: 8,

    fontSize: 24,

    fontWeight: "900",

    color: PREMIUM.primary,
  },


  imageText: {
    marginTop: 3,

    fontSize: 12,

    color: PREMIUM.muted,

    fontWeight: "600",
  },


  /* =======================================================
     BACK
  ======================================================= */

  backButton: {
    position: "absolute",

    top: 15,

    left: 18,

    width: 44,

    height: 44,

    borderRadius: 22,

    backgroundColor:
      PREMIUM.white,

    alignItems: "center",

    justifyContent: "center",

    zIndex: 10,

    elevation: 4,
  },


  pressed: {
    opacity: 0.7,
  },


  /* =======================================================
     CARD
  ======================================================= */

  card: {
    flex: 1,

    backgroundColor:
      PREMIUM.white,

    marginHorizontal: 10,

    marginTop: -25,

    borderTopLeftRadius: 34,

    borderTopRightRadius: 34,

    paddingHorizontal: 23,

    paddingTop: 10,

    paddingBottom: 10,

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


  /* =======================================================
     HANDLE
  ======================================================= */

  handle: {
    width: 42,

    height: 4,

    borderRadius: 10,

    backgroundColor:
      "#E3E0E2",

    marginBottom: 10,
  },


  /* =======================================================
     LOCK
  ======================================================= */

  lockCircle: {
    width: 44,

    height: 44,

    borderRadius: 22,

    backgroundColor:
      "#FCE8F0",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 7,
  },


  /* =======================================================
     TITLE
  ======================================================= */

  title: {
    fontSize: 25,

    lineHeight: 30,

    fontWeight: "900",

    color: PREMIUM.navy,

    textAlign: "center",
  },


  /* =======================================================
     SUBTITLE
  ======================================================= */

  subtitle: {
    marginTop: 4,

    fontSize: 12.5,

    lineHeight: 18,

    color: PREMIUM.muted,

    textAlign: "center",
  },


  /* =======================================================
     MOBILE
  ======================================================= */

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


  /* =======================================================
     OTP LABEL
  ======================================================= */

  otpLabel: {
    width: "100%",

    marginTop: 14,

    marginBottom: 7,

    fontSize: 12,

    color: PREMIUM.navy,

    fontWeight: "800",
  },


  /* =======================================================
     OTP WRAPPER
  ======================================================= */

  otpWrapper: {
    width: "100%",

    height: 52,

    flexDirection: "row",

    justifyContent: "space-between",

    position: "relative",
  },


  /* =======================================================
     OTP BOX
  ======================================================= */

  otpBox: {
    width: 45,

    height: 52,

    borderRadius: 14,

    borderWidth: 1.2,

    borderColor:
      PREMIUM.border,

    backgroundColor:
      "#FFFDFE",

    alignItems: "center",

    justifyContent: "center",
  },


  otpBoxActive: {
    borderWidth: 2,

    borderColor:
      PREMIUM.primary,

    backgroundColor:
      "#FFF8FA",
  },


  otpBoxFilled: {
    borderColor:
      PREMIUM.primary,

    backgroundColor:
      "#FFF8FA",
  },


  otpDigit: {
    fontSize: 20,

    fontWeight: "900",

    color: PREMIUM.navy,

    textAlign: "center",
  },


  /* =======================================================
     REAL INPUT
  ======================================================= */

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


  /* =======================================================
     OTP HINT
  ======================================================= */

  otpHint: {
    marginTop: 5,

    fontSize: 10,

    color: PREMIUM.muted,

    fontWeight: "500",
  },


  /* =======================================================
     RESEND
  ======================================================= */

  resendRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 9,

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


  /* =======================================================
     VERIFY
  ======================================================= */

  verifyButton: {
    width: "100%",

    height: 54,

    borderRadius: 29,

    backgroundColor:
      PREMIUM.primary,

    marginTop: 12,

    paddingLeft: 20,

    paddingRight: 6,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    elevation: 4,

    shadowColor:
      PREMIUM.primary,

    shadowOffset: {
      width: 0,

      height: 4,
    },

    shadowOpacity: 0.18,

    shadowRadius: 7,
  },


  verifyDisabled: {
    backgroundColor:
      PREMIUM.disabled,

    shadowOpacity: 0,
  },


  buttonPressed: {
    opacity: 0.9,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },


  verifyText: {
    flex: 1,

    color: PREMIUM.white,

    fontSize: 15,

    fontWeight: "900",

    textAlign: "center",
  },


  /* =======================================================
     ARROW
  ======================================================= */

  arrowCircle: {
    width: 43,

    height: 43,

    borderRadius: 22,

    backgroundColor:
      PREMIUM.white,

    alignItems: "center",

    justifyContent: "center",
  },


  /* =======================================================
     DEMO
  ======================================================= */

  demoBox: {
    marginTop: 8,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      "#FFF5F8",

    borderWidth: 1,

    borderColor:
      "#F5DDE6",

    borderRadius: 13,

    paddingHorizontal: 11,

    paddingVertical: 6,

    alignSelf: "center",
  },


  demoIcon: {
    width: 27,

    height: 27,

    borderRadius: 14,

    backgroundColor:
      PREMIUM.white,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 8,
  },


  demoTitle: {
    fontSize: 9,

    color: PREMIUM.muted,

    fontWeight: "700",
  },


  demoText: {
    fontSize: 11,

    color: PREMIUM.primary,

    fontWeight: "900",

    marginTop: 1,
  },


  /* =======================================================
     SECURITY
  ======================================================= */

  securityRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 6,

    gap: 5,
  },


  securityText: {
    fontSize: 10,

    color: PREMIUM.muted,

    fontWeight: "600",
  },

});