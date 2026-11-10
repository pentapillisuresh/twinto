
import React, { useEffect, useState } from "react";

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

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../../constants";
import { useAuth } from "../../context";
import { completeProfile } from "../../services/authService";

// ==========================================
// COLORS
// ==========================================

const C = {
  primary: COLORS.primary || "#C9004F",
  primaryDark: COLORS.primaryDark || "#A90042",
  background: COLORS.background || "#FFF9FB",
  pinkSoft: COLORS.pinkSoft || "#FFF0F5",
  border: COLORS.border || "#E9DDE2",
  muted: COLORS.muted || "#858B95",
  text: COLORS.text || "#172033",
  white: COLORS.white || "#FFFFFF",
  green: "#169B62",
};

// ==========================================
// HELPERS
// ==========================================

function getInitialName(value) {
  const name = String(value || "").trim();

  if (name.toLowerCase() === "customer") {
    return "";
  }

  return name;
}

function formatMobile(value) {
  const mobile = String(value || "").trim();

  if (!mobile) {
    return "Verified";
  }

  return mobile.startsWith("+")
    ? mobile
    : `+91 ${mobile}`;
}

// ==========================================
// COMPLETE PROFILE SCREEN
// ==========================================

export default function CompleteProfileScreen() {
  const insets = useSafeAreaInsets();

  const { user, setUser } = useAuth();

  // ========================================
  // STATE
  // ========================================

  const [name, setName] = useState(
    getInitialName(user?.name)
  );

  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(false);

  // ========================================
  // SYNC USER NAME
  // ========================================

  useEffect(() => {
    const savedName = getInitialName(user?.name);

    if (savedName) {
      setName(savedName);
    }
  }, [user?.name]);

  // ========================================
  // VALIDATION
  // ========================================

  const cleanedName = name
    .trim()
    .replace(/\s+/g, " ");

  const isValidName =
    cleanedName.length >= 2 &&
    cleanedName.length <= 120 &&
    cleanedName.toLowerCase() !== "customer";

  // ========================================
  // SAVE PROFILE TO MYSQL
  // ========================================

  async function handleContinue() {
    if (saving) {
      return;
    }

    Keyboard.dismiss();

    if (!isValidName) {
      Alert.alert(
        "Invalid Name",
        "Please enter your full name between 2 and 120 characters."
      );
      return;
    }

    try {
      setSaving(true);

      // ====================================
      // STEP 1: SAVE NAME TO BACKEND
      // ====================================

      // PUT /api/v1/auth/complete-profile
      // Existing API client attaches JWT.
      const response = await completeProfile(cleanedName);

      const savedUser =
        response?.user ||
        response?.data?.user;

      if (!savedUser?.id) {
        throw new Error(
          "Profile was not saved correctly. Please try again."
        );
      }

      // ====================================
      // STEP 2: UPDATE AUTH CONTEXT
      // ====================================

      await setUser({
        ...user,
        ...savedUser,
      });

      // ====================================
      // STEP 3: GO TO LOCATION
      // ====================================

      router.replace("/location");
    } catch (error) {
      console.error(
        "[COMPLETE PROFILE ERROR]",
        error
      );

      Alert.alert(
        "Unable to Save Profile",
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // SCREEN
  // ========================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.background}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 22,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ================================= */}
          {/* TOP HEADER WITH TWINTO LOGO */}
          {/* ================================= */}

          <View style={styles.topRow}>
            <Image
              source={require("../../assets/images/logo1.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />

            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>
                STEP 2 OF 3
              </Text>
            </View>
          </View>

          {/* ================================= */}
          {/* INTRODUCTION */}
          {/* ================================= */}

          <View style={styles.introSection}>
            <View style={styles.introIcon}>
              <Ionicons
                name="person-outline"
                size={24}
                color={C.primary}
              />
            </View>

            <Text style={styles.title}>
              Let's get to know you
            </Text>

            <Text style={styles.subtitle}>
              Enter your name to personalize your
              TWINTO shopping experience.
            </Text>
          </View>

          {/* ================================= */}
          {/* PROFILE FORM */}
          {/* ================================= */}

          <View style={styles.formCard}>
            {/* FULL NAME */}

            <Text style={styles.label}>
              Full Name
            </Text>

            <View
              style={[
                styles.inputContainer,
                focused && styles.inputFocused,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={19}
                color={
                  focused ? C.primary : C.muted
                }
              />

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={C.muted}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                textContentType="name"
                maxLength={120}
                returnKeyType="done"
                editable={!saving}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={handleContinue}
              />

              {isValidName && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={C.green}
                />
              )}
            </View>

            <Text style={styles.helperText}>
              This name will appear in your profile
              and orders.
            </Text>

            {/* ================================= */}
            {/* VERIFIED MOBILE NUMBER */}
            {/* ================================= */}

            <View style={styles.mobileRow}>
              <View style={styles.mobileLeft}>
                <View style={styles.mobileIcon}>
                  <Ionicons
                    name="call-outline"
                    size={17}
                    color={C.primary}
                  />
                </View>

                <View style={styles.mobileInfo}>
                  <Text style={styles.mobileLabel}>
                    Verified Mobile
                  </Text>

                  <Text style={styles.mobileValue}>
                    {formatMobile(user?.mobile)}
                  </Text>
                </View>
              </View>

              <Ionicons
                name="checkmark-circle"
                size={20}
                color={C.green}
              />
            </View>
          </View>

          {/* ================================= */}
          {/* SAVE & CONTINUE BUTTON */}
          {/* ================================= */}

          <Pressable
            onPress={handleContinue}
            disabled={saving || !isValidName}
            style={({ pressed }) => [
              styles.continueButton,
              (saving || !isValidName) &&
                styles.buttonDisabled,
              pressed &&
                !saving &&
                isValidName &&
                styles.buttonPressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={C.white}
              />
            ) : (
              <>
                <Text style={styles.continueText}>
                  Save & Continue
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={C.white}
                />
              </>
            )}
          </Pressable>

          {/* ================================= */}
          {/* SECURITY MESSAGE */}
          {/* ================================= */}

          <View style={styles.securityRow}>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={C.muted}
            />

            <Text style={styles.securityText}>
              Your information is securely saved
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },

  // ========================================
  // HEADER
  // ========================================

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  brandLogo: {
    width: 125,
    height: 48,
  },

  stepBadge: {
    backgroundColor: C.pinkSoft,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  stepText: {
    color: C.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // ========================================
  // INTRODUCTION
  // ========================================

  introSection: {
    marginBottom: 24,
  },

  introIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 310,
  },

  // ========================================
  // FORM CARD
  // ========================================

  formCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: C.text,
    marginBottom: 10,
  },

  inputContainer: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: C.border,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  inputFocused: {
    borderColor: C.primary,
    backgroundColor: "#FFFCFD",
  },

  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    paddingVertical: 0,
  },

  helperText: {
    fontSize: 11,
    color: C.muted,
    marginTop: 10,
    lineHeight: 17,
  },

  // ========================================
  // VERIFIED MOBILE
  // ========================================

  mobileRow: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  mobileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
  },

  mobileIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: C.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  mobileInfo: {
    flex: 1,
  },

  mobileLabel: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 4,
  },

  mobileValue: {
    fontSize: 13,
    fontWeight: "800",
    color: C.text,
  },

  // ========================================
  // CONTINUE BUTTON
  // ========================================

  continueButton: {
    height: 54,
    backgroundColor: C.primary,
    borderRadius: 13,
    marginTop: 22,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonPressed: {
    opacity: 0.9,
  },

  continueText: {
    fontSize: 15,
    fontWeight: "900",
    color: C.white,
  },

  // ========================================
  // SECURITY MESSAGE
  // ========================================

  securityRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  securityText: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "500",
  },
});
