
import { useEffect, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../../constants";
import { useAuth } from "../../context";
import { updateProfile } from "../../services/authService";

// ==========================================
// HELPERS
// ==========================================

function getDisplayName(value) {
  const savedName = String(value || "").trim();

  if (savedName.toLowerCase() === "customer") {
    return "";
  }

  return savedName;
}

function formatMobile(value) {
  const mobile = String(value || "").trim();

  if (!mobile) {
    return "";
  }

  if (mobile.startsWith("+")) {
    return mobile;
  }

  return `+91 ${mobile}`;
}

// ==========================================
// EDIT PROFILE SCREEN
// ==========================================

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user, setUser } = useAuth();

  // ==========================================
  // PROFILE STATE
  // ==========================================

  const [name, setName] = useState(
    getDisplayName(user?.name)
  );

  const [saving, setSaving] = useState(false);

  const mobile = String(user?.mobile || "");

  // ==========================================
  // SYNC USER DATA
  // ==========================================

  useEffect(() => {
    setName(getDisplayName(user?.name));
  }, [user?.name]);

  // ==========================================
  // SAFE AREA
  // ==========================================

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" &&
      Platform.Version >= 35)
      ? insets.top
      : 0;

  // ==========================================
  // SAVE PROFILE TO MYSQL
  // ==========================================

  async function saveProfile() {
    if (saving) {
      return;
    }

    const trimmedName = String(name || "")
      .trim()
      .replace(/\s+/g, " ");

    // Validate full name.
    if (
      trimmedName.length < 2 ||
      trimmedName.length > 120
    ) {
      Alert.alert(
        "Invalid Name",
        "Please enter your full name between 2 and 120 characters."
      );
      return;
    }

    try {
      setSaving(true);

      // ======================================
      // STEP 1: SAVE NAME TO BACKEND MYSQL
      // ======================================

      // PUT /api/v1/auth/profile
      // JWT is attached by the existing API service.
      const response = await updateProfile(trimmedName);

      // Support wrapped and unwrapped responses.
      const savedUser =
        response?.user ||
        response?.data?.user;

      if (!savedUser?.id) {
        throw new Error(
          "Profile was not saved correctly. Please try again."
        );
      }

      // ======================================
      // STEP 2: UPDATE LOCAL USER CONTEXT
      // ======================================

      const updatedUser = {
        ...user,
        ...savedUser,
      };

      await setUser(updatedUser);

      // ======================================
      // STEP 3: SHOW SUCCESS MESSAGE
      // ======================================

      Alert.alert(
        "Success",
        "Profile updated successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "[PROFILE UPDATE ERROR]",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
          "Could not update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // SCREEN
  // ==========================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
      />

      {/* WHITE HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 10,
          },
        ]}
      >
        {/* BACK BUTTON */}
        <Pressable
          style={styles.headerButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </Pressable>

        {/* HEADER TITLE */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Edit Profile
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your personal information
          </Text>
        </View>

        {/* HEADER ICON */}
        <View style={styles.headerTrailing}>
          <Ionicons
            name="person-outline"
            size={21}
            color={COLORS.primary}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* ================================= */}
          {/* PROFILE INFORMATION */}
          {/* NO CAMERA OR PHOTO OPTION */}
          {/* ================================= */}

          <View style={styles.profileSection}>
            <View style={styles.profileIconContainer}>
              <Ionicons
                name="person"
                size={45}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.profileName}>
              {getDisplayName(name) || "Your Profile"}
            </Text>

            <Text style={styles.profileMobile}>
              {formatMobile(mobile)}
            </Text>
          </View>

          {/* ================================= */}
          {/* PERSONAL INFORMATION */}
          {/* ================================= */}

          <View style={styles.formCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.heading}>
                  Personal Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Update your profile details
                </Text>
              </View>
            </View>

            {/* FULL NAME */}
            <Text style={styles.label}>
              FULL NAME
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={19}
                color={COLORS.muted}
              />

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect={false}
                maxLength={120}
                returnKeyType="done"
                editable={!saving}
              />
            </View>

            {/* MOBILE NUMBER */}
            <Text style={styles.label}>
              MOBILE NUMBER
            </Text>

            <View
              style={[
                styles.inputContainer,
                styles.disabledInput,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={19}
                color={COLORS.muted}
              />

              <TextInput
                value={formatMobile(mobile)}
                editable={false}
                style={styles.input}
                selectTextOnFocus={false}
              />

              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={COLORS.muted}
              />
            </View>

            {/* MOBILE INFORMATION */}
            <View style={styles.noteRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={COLORS.muted}
              />

              <Text style={styles.note}>
                Your mobile number is linked to your
                TWINTO account.
              </Text>
            </View>
          </View>

          {/* ================================= */}
          {/* SAVE CHANGES BUTTON */}
          {/* ================================= */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.saveButton,
              saving && styles.saveDisabled,
            ]}
            onPress={saveProfile}
            disabled={saving}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={21}
              color={COLORS.white}
            />

            <Text style={styles.saveText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={19}
              color={COLORS.white}
            />
          </TouchableOpacity>
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
    backgroundColor: COLORS.background,
  },

  // ========================================
  // HEADER
  // ========================================

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  headerTrailing: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  // ========================================
  // CONTENT
  // ========================================

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 55,
  },

  // ========================================
  // PROFILE SECTION
  // ========================================

  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },

  profileIconContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.pinkSoft,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  profileName: {
    marginTop: 15,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },

  profileMobile: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 12,
  },

  // ========================================
  // FORM CARD
  // ========================================

  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 24,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
  },

  // ========================================
  // INPUTS
  // ========================================

  label: {
    marginBottom: 8,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.muted,
  },

  inputContainer: {
    height: 54,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  disabledInput: {
    backgroundColor: "#F5F5F7",
  },

  input: {
    flex: 1,
    marginLeft: 11,
    fontSize: 14,
    color: COLORS.text,
  },

  // ========================================
  // INFORMATION NOTE
  // ========================================

  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: -7,
  },

  note: {
    flex: 1,
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 17,
  },

  // ========================================
  // SAVE BUTTON
  // ========================================

  saveButton: {
    marginTop: 25,
    height: 54,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 18,
  },

  saveDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },
});
