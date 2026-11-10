
import React, { useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { COLORS } from "../../constants";
import { useAuth } from "../../context";

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
  gray: "#68717F",
  danger: "#C93652",
  green: "#16844A",
};

function AccountItem({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
  last = false,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.72}
      style={[
        styles.accountItem,
        disabled && styles.disabledItem,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.itemIcon,
          danger && styles.dangerIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            danger ? PREMIUM.danger : PREMIUM.primary
          }
        />
      </View>

      <View
        style={[
          styles.itemBody,
          last && styles.lastItem,
        ]}
      >
        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              danger && styles.dangerText,
            ]}
          >
            {title}
          </Text>

          {!!subtitle && (
            <Text style={styles.itemSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        {!danger && (
          <Ionicons
            name="chevron-forward"
            size={17}
            color="#B0AAB1"
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeading({ title, icon }) {
  return (
    <View style={styles.sectionHeading}>
      <Ionicons
        name={icon}
        size={15}
        color={PREMIUM.primary}
      />

      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user, logout } = useAuth();

  const [loggingOut, setLoggingOut] =
    useState(false);

  // EXISTING LOGOUT LOGIC PRESERVED
  async function handleLogout() {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from TWINTO?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logout();
              router.replace("/auth/login");
            } catch (error) {
              console.log("Logout error:", error);
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  }

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" &&
      Platform.Version >= 35)
      ? insets.top
      : 0;

  const displayName =
    user?.name || "Welcome to TWINTO";

  const displayMobile =
    user?.mobile || "Mobile number unavailable";

  const initial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    "T";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={PREMIUM.white}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

      {/* CLEAN FIXED WHITE HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: topInset + 11 },
        ]}
      >
        <View style={styles.headerIcon}>
          <Ionicons
            name="person-outline"
            size={21}
            color={PREMIUM.primary}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            My Account
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your profile and preferences
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={PREMIUM.primary}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Math.max(insets.bottom, 12) + 26,
          },
        ]}
      >
        {/* COMPACT PREMIUM PROFILE */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {initial}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text
                style={styles.name}
                numberOfLines={1}
              >
                {displayName}
              </Text>

              <Text
                style={styles.mobile}
                numberOfLines={1}
              >
                {displayMobile}
              </Text>

              <View style={styles.verified}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={PREMIUM.green}
                />

                <Text style={styles.verifiedText}>
                  Your TWINTO account
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.editButton}
              onPress={() =>
                router.push("/account/profile")
              }
            >
              <Ionicons
                name="create-outline"
                size={19}
                color={PREMIUM.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.profileBottom}>
            <View style={styles.profileBottomLeft}>
              <Ionicons
                name="bag-handle-outline"
                size={15}
                color={PREMIUM.primary}
              />

              <Text style={styles.profileBottomText}>
                Fresh shopping starts here
              </Text>
            </View>

            <Ionicons
              name="sparkles-outline"
              size={16}
              color={PREMIUM.primary}
            />
          </View>
        </View>

        {/* ORDERS */}
        <SectionHeading
          title="SHOPPING"
          icon="bag-handle-outline"
        />

        <View style={styles.settingsGroup}>
          <AccountItem
            icon="receipt-outline"
            title="My Orders"
            subtitle="View orders and track deliveries"
            onPress={() =>
              router.push("/orders")
            }
          />

          <AccountItem
            icon="heart-outline"
            title="Saved Items"
            subtitle="Your favourite products"
            onPress={() =>
              Alert.alert(
                "Saved Items",
                "Saved items will be available soon."
              )
            }
            last
          />
        </View>

        {/* DELIVERY */}
        <SectionHeading
          title="DELIVERY"
          icon="location-outline"
        />

        <View style={styles.settingsGroup}>
          <AccountItem
            icon="location-outline"
            title="My Addresses"
            subtitle="Manage your delivery locations"
            onPress={() =>
              router.push("/checkout/address")
            }
            last
          />
        </View>

        {/* HELP */}
        <SectionHeading
          title="HELP & INFORMATION"
          icon="help-circle-outline"
        />

        <View style={styles.settingsGroup}>
          <AccountItem
            icon="headset-outline"
            title="Help & Support"
            subtitle="We're here to help you"
            onPress={() =>
              router.push("/account/help-support")
            }
          />

          <AccountItem
            icon="document-text-outline"
            title="Terms & Conditions"
            subtitle="Read our terms of service"
            onPress={() =>
              router.push("/account/terms-conditions")
            }
          />

          <AccountItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="How your information is handled"
            onPress={() =>
              router.push("/account/privacy-policy")
            }
            last
          />
        </View>

        {/* ACCOUNT ACTION */}
        <SectionHeading
          title="ACCOUNT"
          icon="settings-outline"
        />

        <View style={styles.settingsGroup}>
          <AccountItem
            icon="log-out-outline"
            title={
              loggingOut
                ? "Logging out..."
                : "Logout"
            }
            subtitle="Sign out of your TWINTO account"
            danger
            disabled={loggingOut}
            onPress={handleLogout}
            last
          />
        </View>

        {loggingOut && (
          <View style={styles.logoutLoading}>
            <ActivityIndicator
              color={PREMIUM.primary}
              size="small"
            />
            <Text style={styles.logoutLoadingText}>
              Signing out...
            </Text>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Ionicons
              name="bag-handle"
              size={18}
              color={PREMIUM.primary}
            />

            <Text style={styles.footerBrand}>
              TWINTO
            </Text>
          </View>

          <Text style={styles.version}>
            Version 1.0.0
          </Text>

          <Text style={styles.tagline}>
            Fresh groceries. Delivered with care.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 15,
    paddingTop: 17,
  },

  // WHITE HEADER
  header: {
    backgroundColor: PREMIUM.white,
    paddingHorizontal: 16,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM.border,
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
  },

  headerTitle: {
    color: PREMIUM.navy,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  headerSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 3,
  },

  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  // PROFILE
  profileCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    overflow: "hidden",
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: PREMIUM.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: PREMIUM.white,
    fontSize: 23,
    fontWeight: "900",
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },

  name: {
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "900",
  },

  mobile: {
    color: PREMIUM.gray,
    fontSize: 11,
    marginTop: 5,
  },

  verified: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    marginTop: 8,
  },

  verifiedText: {
    color: PREMIUM.green,
    fontSize: 10,
    fontWeight: "700",
  },

  editButton: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },

  profileBottom: {
    minHeight: 39,
    backgroundColor: "#FFF5F8",
    borderTopWidth: 1,
    borderTopColor: "#F7E7ED",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  profileBottomLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  profileBottomText: {
    color: PREMIUM.primary,
    fontSize: 10,
    fontWeight: "700",
  },

  // SECTION HEADINGS
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 23,
    marginBottom: 10,
    paddingHorizontal: 3,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  // SETTINGS
  settingsGroup: {
    backgroundColor: PREMIUM.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    overflow: "hidden",
  },

  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 68,
    paddingLeft: 14,
  },

  disabledItem: {
    opacity: 0.55,
  },

  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  dangerIcon: {
    backgroundColor: "#FFF0F1",
  },

  itemBody: {
    flex: 1,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3EDF0",
    marginLeft: 12,
    paddingRight: 15,
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  itemContent: {
    flex: 1,
    paddingVertical: 10,
  },

  itemTitle: {
    color: PREMIUM.navy,
    fontSize: 13,
    fontWeight: "800",
  },

  dangerText: {
    color: PREMIUM.danger,
  },

  itemSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
  },

  // LOGOUT
  logoutLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 16,
  },

  logoutLoadingText: {
    color: PREMIUM.muted,
    fontSize: 11,
  },

  // FOOTER
  footer: {
    alignItems: "center",
    marginTop: 31,
  },

  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 9,
  },

  footerBrand: {
    color: PREMIUM.primary,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.6,
  },

  version: {
    color: PREMIUM.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  tagline: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 6,
    textAlign: "center",
  },
});
