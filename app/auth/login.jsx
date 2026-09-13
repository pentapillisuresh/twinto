import { useState } from "react";

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { COLORS } from "../../constants";

import { sendOtp } from "../../services/authService";


/* =========================================================
   PREMIUM COLORS
========================================================= */

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


/* =========================================================
   LOGIN
========================================================= */

export default function Login() {
  const [mobile, setMobile] = useState("");


  /* =======================================================
     CONTINUE
  ======================================================= */

  async function handleContinue() {
    if (!mobile.trim()) {
      Alert.alert(
        "Mobile Number",
        "Please enter your mobile number."
      );

      return;
    }


    if (mobile.length !== 10) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }


    try {
      await sendOtp(mobile);


      router.push({
        pathname: "/auth/otp",

        params: {
          mobile,
        },
      });

    } catch (error) {
      Alert.alert(
        "Error",
        error?.message || "Unable to send OTP."
      );
    }
  }


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
            : undefined
        }
      >

        <View style={styles.container}>

          {/* =================================================
              TOP IMAGE AREA
          ================================================= */}

          <View style={styles.hero}>

            {/* Decorative pink circle */}

            <View style={styles.circleLarge} />

            <View style={styles.circleSmall} />


            {/* Login artwork */}

            <Image
              source={require("../../assets/images/loginbg.png")}
              style={styles.heroImage}
              resizeMode="contain"
            />

          </View>


          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <View style={styles.loginCard}>

            {/* Top handle */}

            <View style={styles.handle} />


            {/* =================================================
                HEADING
            ================================================= */}

            <Text style={styles.title}>
              Welcome Back
            </Text>


            <Text style={styles.subtitle}>
              Sign in with your mobile number
              to continue shopping.
            </Text>


            {/* =================================================
                MOBILE LABEL
            ================================================= */}

            <Text style={styles.label}>
              Mobile Number
            </Text>


            {/* =================================================
                PHONE INPUT
            ================================================= */}

            <View
              style={[
                styles.phoneBox,

                mobile.length === 10 &&
                  styles.phoneBoxActive,
              ]}
            >

              {/* Phone icon */}

              <View style={styles.phoneIcon}>

                <Ionicons
                  name="call-outline"
                  size={19}
                  color={PREMIUM.magenta}
                />

              </View>


              {/* Country code */}

              <Text style={styles.prefix}>
                +91
              </Text>


              {/* Vertical divider */}

              <View style={styles.verticalDivider} />


              {/* Number */}

              <TextInput
                value={mobile}

                onChangeText={(text) =>
                  setMobile(
                    text
                      .replace(/[^0-9]/g, "")
                      .slice(0, 10)
                  )
                }

                keyboardType="number-pad"

                placeholder="Enter mobile number"

                placeholderTextColor="#A1A5AD"

                style={styles.input}

                maxLength={10}

                returnKeyType="done"

                onSubmitEditing={
                  mobile.length === 10
                    ? handleContinue
                    : undefined
                }
              />


              {/* Valid check */}

              {mobile.length === 10 && (
                <View style={styles.checkCircle}>

                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={PREMIUM.white}
                  />

                </View>
              )}

            </View>


            {/* =================================================
                CONTINUE
            ================================================= */}

            <Pressable
              onPress={handleContinue}

              disabled={mobile.length !== 10}

              style={({ pressed }) => [
                styles.continueButton,

                mobile.length !== 10 &&
                  styles.continueDisabled,

                pressed &&
                  mobile.length === 10 &&
                  styles.buttonPressed,
              ]}
            >

              <Text style={styles.continueText}>
                Continue
              </Text>


              <View style={styles.arrowCircle}>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={PREMIUM.magenta}
                />

              </View>

            </Pressable>


            {/* =================================================
                SECURITY MESSAGE
            ================================================= */}

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


            {/* =================================================
                TERMS
            ================================================= */}

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


            {/* =================================================
                DEMO
            ================================================= */}

            <View style={styles.demoBox}>

              <View style={styles.demoIcon}>

                <Ionicons
                  name="key-outline"
                  size={15}
                  color={PREMIUM.magenta}
                />

              </View>


              <View>

                <Text style={styles.demoTitle}>
                  Demo Mode
                </Text>

                <Text style={styles.demoText}>
                  OTP 123456
                </Text>

              </View>

            </View>

          </View>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
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
    height: "43%",

    backgroundColor:
      PREMIUM.pinkSoft,

    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",

    position: "relative",
  },


  /* =======================================================
     DECORATIVE CIRCLE
  ======================================================= */

  circleLarge: {
    position: "absolute",

    width: 360,

    height: 360,

    borderRadius: 180,

    backgroundColor:
      PREMIUM.pinkLight,

    top: -125,

    right: -80,
  },


  circleSmall: {
    position: "absolute",

    width: 180,

    height: 180,

    borderRadius: 90,

    backgroundColor:
      PREMIUM.white,

    opacity: 0.5,

    bottom: -95,

    left: -65,
  },


  /* =======================================================
     HERO IMAGE
  ======================================================= */
heroImage: {
  width: "105%",
  height: "105%",
  zIndex: 2,
  marginTop: 90,
},


  /* =======================================================
     LOGIN CARD
  ======================================================= */

  loginCard: {
    flex: 1,

    backgroundColor:
      PREMIUM.white,

    marginHorizontal: 12,

    marginTop: -25,

    borderTopLeftRadius: 32,

    borderTopRightRadius: 32,

    paddingHorizontal: 23,

    paddingTop: 12,

    paddingBottom: 14,

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


  /* =======================================================
     HANDLE
  ======================================================= */

  handle: {
    width: 42,

    height: 4,

    borderRadius: 10,

    backgroundColor: "#E3E0E2",

    alignSelf: "center",

    marginBottom: 12,
  },


  /* =======================================================
     TITLE
  ======================================================= */

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


  /* =======================================================
     LABEL
  ======================================================= */

  label: {
    marginTop: 17,

    marginBottom: 7,

    fontSize: 13,

    fontWeight: "800",

    color: PREMIUM.navy,
  },


  /* =======================================================
     PHONE BOX
  ======================================================= */

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
    borderColor:
      PREMIUM.magenta,

    backgroundColor:
      "#FFF8FA",
  },


  /* =======================================================
     PHONE ICON
  ======================================================= */

  phoneIcon: {
    width: 32,

    height: 32,

    borderRadius: 16,

    backgroundColor:
      "#FCE8F0",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 8,
  },


  /* =======================================================
     PREFIX
  ======================================================= */

  prefix: {
    fontSize: 14,

    fontWeight: "900",

    color: PREMIUM.navy,
  },


  /* =======================================================
     DIVIDER
  ======================================================= */

  verticalDivider: {
    width: 1,

    height: 23,

    backgroundColor:
      "#E4DDE1",

    marginHorizontal: 10,
  },


  /* =======================================================
     INPUT
  ======================================================= */

  input: {
    flex: 1,

    height: 52,

    paddingVertical: 0,

    fontSize: 15,

    fontWeight: "600",

    color: PREMIUM.navy,
  },


  /* =======================================================
     CHECK
  ======================================================= */

  checkCircle: {
    width: 23,

    height: 23,

    borderRadius: 12,

    backgroundColor:
      PREMIUM.magenta,

    alignItems: "center",

    justifyContent: "center",
  },


  /* =======================================================
     CONTINUE BUTTON
  ======================================================= */

  continueButton: {
    height: 56,

    borderRadius: 30,

    backgroundColor:
      PREMIUM.magenta,

    marginTop: 13,

    paddingLeft: 20,

    paddingRight: 6,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    elevation: 4,

    shadowColor:
      PREMIUM.magenta,

    shadowOffset: {
      width: 0,

      height: 4,
    },

    shadowOpacity: 0.18,

    shadowRadius: 7,
  },


  continueDisabled: {
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


  /* =======================================================
     BUTTON TEXT
  ======================================================= */

  continueText: {
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
    width: 44,

    height: 44,

    borderRadius: 22,

    backgroundColor:
      PREMIUM.white,

    alignItems: "center",

    justifyContent: "center",
  },


  /* =======================================================
     SECURITY
  ======================================================= */

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

    backgroundColor:
      "#FCE8F0",

    alignItems: "center",

    justifyContent: "center",
  },


  securityText: {
    fontSize: 11,

    color: PREMIUM.muted,

    fontWeight: "600",
  },


  /* =======================================================
     TERMS
  ======================================================= */

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

    color:
      PREMIUM.magenta,

    fontWeight: "800",
  },


  termsNormal: {
    fontSize: 10,

    color: "#A0A3AA",
  },


  /* =======================================================
     DEMO
  ======================================================= */

  demoBox: {
    marginTop: 9,

    alignSelf: "center",

    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      "#FFF5F8",

    borderWidth: 1,

    borderColor:
      "#F5DDE6",

    borderRadius: 13,

    paddingHorizontal: 12,

    paddingVertical: 7,
  },


  demoIcon: {
    width: 28,

    height: 28,

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

    color: PREMIUM.magenta,

    fontWeight: "900",

    marginTop: 1,
  },

});