
import { useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
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
  gold: "#FFE19A",
};

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user, logout } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  // ORIGINAL LOGOUT LOGIC - UNCHANGED
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

  // ORIGINAL ACCOUNT ITEM FUNCTIONALITY
  function AccountItem({
    icon,
    title,
    subtitle,
    onPress,
    danger = false,
  }) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.accountItem}
        onPress={onPress}
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
              danger
                ? COLORS.danger
                : PREMIUM.primary
            }
          />
        </View>

        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              danger && {
                color: COLORS.danger,
              },
            ]}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.itemSubtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {!danger && (
          <View style={styles.itemArrow}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={PREMIUM.primary}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // SAME TOP SPACING AS YOUR CART / ORDERS PAGE
  const topInset =
    Platform.OS === "ios"
      ? insets.top
      : Platform.Version >= 35
      ? insets.top
      : 0;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PREMIUM.primary}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

      {/* FIXED FULL-WIDTH PREMIUM HEADER */}
      <View
        style={[
          styles.headerBackground,
          {
            paddingTop: topInset + 18,
          },
        ]}
      >
        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />

        <View style={styles.headerRow}>
          <View style={styles.headerSide} />

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>
              My Account
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage your TWINTO account
            </Text>
          </View>

          <View style={styles.headerSide} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerInfoIcon}>
            <Ionicons
              name="person-outline"
              size={20}
              color={PREMIUM.gold}
            />
          </View>

          <View style={styles.headerInfoContent}>
            <Text
              style={styles.headerInfoTitle}
              numberOfLines={1}
            >
              {user?.name || "Welcome to TWINTO"}
            </Text>

            <Text
              style={styles.headerInfoSubtitle}
              numberOfLines={1}
            >
              Your personal shopping space
            </Text>
          </View>

          <View style={styles.headerInfoBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={PREMIUM.white}
            />
          </View>
        </View>
      </View>

      {/* ONLY CONTENT SCROLLS */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* PROFILE */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {user?.name || "ANIL"}
            </Text>

            <Text
              style={styles.mobile}
              numberOfLines={1}
            >
              {user?.mobile || "+91 98490 12345"}
            </Text>

            <View style={styles.verified}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.primary}
              />

              <Text style={styles.verifiedText}>
                Verified account
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.editButton}
            onPress={() =>
              router.push("/account/profile")
            }
          >
            <Ionicons
              name="create-outline"
              size={19}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ORDERS */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionAccent} />

          <Text style={styles.sectionTitle}>
            ORDERS
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <AccountItem
            icon="receipt-outline"
            title="My Orders"
            subtitle="View your recent orders"
            onPress={() =>
              router.push("/orders")
            }
          />

          <View style={styles.separator} />

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
          />
        </View>

        {/* DELIVERY */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionAccent} />

          <Text style={styles.sectionTitle}>
            DELIVERY
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <AccountItem
            icon="location-outline"
            title="My Addresses"
            subtitle="Manage delivery addresses"
            onPress={() =>
              router.push("/checkout/address")
            }
          />
        </View>

        {/* SUPPORT */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionAccent} />

          <Text style={styles.sectionTitle}>
            SUPPORT
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <AccountItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with your orders"
            onPress={() =>
              Alert.alert(
                "Help & Support",
                "Our support team is available for your assistance."
              )
            }
          />

          <View style={styles.separator} />

          <AccountItem
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={() =>
              Alert.alert(
                "Terms & Conditions",
                "Terms and conditions will be connected to the backend later."
              )
            }
          />

          <View style={styles.separator} />

          <AccountItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() =>
              Alert.alert(
                "Privacy Policy",
                "Privacy policy will be connected to the backend later."
              )
            }
          />
        </View>

        {/* ACCOUNT */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionAccent} />

          <Text style={styles.sectionTitle}>
            ACCOUNT
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <AccountItem
            icon="log-out-outline"
            title={
              loggingOut
                ? "Logging out..."
                : "Logout"
            }
            danger
            onPress={
              loggingOut
                ? undefined
                : handleLogout
            }
          />
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Ionicons
              name="bag-handle"
              size={16}
              color={PREMIUM.primary}
            />

            <Text style={styles.footerBrand}>
              TWINTO
            </Text>
          </View>

          <Text style={styles.version}>
            TWINTO v1.0.0
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
  // PAGE
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 35,
  },

  // FIXED FULL-WIDTH HEADER
  headerBackground: {
    backgroundColor: PREMIUM.primary,
    paddingHorizontal: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: "hidden",
    zIndex: 10,
    elevation: 4,
  },

  headerCircleOne: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.055)",
    right: -95,
    top: -110,
  },

  headerCircleTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.045)",
    left: -65,
    bottom: -60,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerSide: {
    width: 42,
  },

  headerTitleBox: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    color: PREMIUM.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 3,
  },

  headerInfo: {
    marginTop: 19,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
  },

  headerInfoIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  headerInfoContent: {
    flex: 1,
    minWidth: 0,
  },

  headerInfoTitle: {
    color: PREMIUM.white,
    fontSize: 13,
    fontWeight: "800",
  },

  headerInfoSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    marginTop: 4,
  },

  headerInfoBadge: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // PROFILE CARD
  profileCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 21,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: PREMIUM.border,
    shadowColor: PREMIUM.navy,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 11,
    elevation: 2,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: PREMIUM.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PREMIUM.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: "900",
    color: PREMIUM.navy,
  },

  mobile: {
    marginTop: 5,
    fontSize: 11,
    color: PREMIUM.gray,
  },

  verified: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: PREMIUM.pinkSoft,
  },

  verifiedText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "800",
    color: PREMIUM.primary,
  },

  editButton: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // SECTION HEADING
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
    marginLeft: 4,
  },

  sectionAccent: {
    width: 3,
    height: 17,
    borderRadius: 3,
    backgroundColor: PREMIUM.primary,
    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: PREMIUM.navy,
  },

  // ACCOUNT SECTION CARDS
  sectionCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    overflow: "hidden",
    shadowColor: PREMIUM.navy,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },

  accountItem: {
    minHeight: 72,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  itemIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    alignItems: "center",
    justifyContent: "center",
  },

  dangerIcon: {
    backgroundColor: "#FDECEC",
    borderColor: "#F8D8DF",
  },

  itemContent: {
    flex: 1,
    marginLeft: 12,
  },

  itemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: PREMIUM.navy,
  },

  itemSubtitle: {
    marginTop: 4,
    fontSize: 10,
    color: PREMIUM.muted,
  },

  itemArrow: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  separator: {
    height: 1,
    backgroundColor: PREMIUM.border,
    marginLeft: 71,
  },

  // FOOTER
  footer: {
    alignItems: "center",
    marginTop: 31,
  },

  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 9,
  },

  footerBrand: {
    color: PREMIUM.primary,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  version: {
    textAlign: "center",
    fontSize: 11,
    color: PREMIUM.muted,
    fontWeight: "700",
  },

  tagline: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 10,
    color: PREMIUM.muted,
  },
});
