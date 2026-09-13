import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import AppHeader from "../../components/common/AppHeader";
import { COLORS } from "../../constants";
import { useAuth } from "../../context";

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

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
            danger && { backgroundColor: "#FDECEC" },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={danger ? COLORS.danger : COLORS.primary}
          />
        </View>

        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              danger && { color: COLORS.danger },
            ]}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.itemSubtitle}>{subtitle}</Text>
          ) : null}
        </View>

        {!danger && (
          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.muted}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="My Account" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || "ANIL"}</Text>

            <Text style={styles.mobile}>
              {user?.mobile || "+91 98490 12345"}
            </Text>

            <View style={styles.verified}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.verifiedText}>Verified account</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/account/profile")}
          >
            <Ionicons
              name="create-outline"
              size={19}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>ORDERS</Text>

        <View style={styles.sectionCard}>
          <AccountItem
            icon="receipt-outline"
            title="My Orders"
            subtitle="View your recent orders"
            onPress={() => router.push("/orders")}
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

        <Text style={styles.sectionTitle}>DELIVERY</Text>

        <View style={styles.sectionCard}>
          <AccountItem
            icon="location-outline"
            title="My Addresses"
            subtitle="Manage delivery addresses"
            onPress={() => router.push("/checkout/address")}
          />
        </View>

        <Text style={styles.sectionTitle}>SUPPORT</Text>

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

        <Text style={styles.sectionTitle}>ACCOUNT</Text>

        <View style={styles.sectionCard}>
          <AccountItem
            icon="log-out-outline"
            title={loggingOut ? "Logging out..." : "Logout"}
            danger
            onPress={loggingOut ? undefined : handleLogout}
          />
        </View>

        <Text style={styles.version}>TWINTO v1.0.0</Text>

        <Text style={styles.tagline}>
          Fresh groceries. Delivered with care.
        </Text>
      </ScrollView>
    </View>
  );
}

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  content: {
    padding: 16,
    paddingBottom: 120,
  },

  profileCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: PREMIUM.border,
    shadowColor: PREMIUM.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: PREMIUM.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PREMIUM.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 3,
  },

  avatarText: {
    color: PREMIUM.white,
    fontSize: 24,
    fontWeight: "900",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 18,
    fontWeight: "900",
    color: PREMIUM.navy,
  },

  mobile: {
    marginTop: 4,
    fontSize: 12,
    color: PREMIUM.gray,
  },

  verified: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: PREMIUM.pinkSoft,
  },

  verifiedText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "800",
    color: PREMIUM.primary,
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 9,
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: PREMIUM.muted,
  },

  sectionCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    overflow: "hidden",
    shadowColor: PREMIUM.navy,
    shadowOffset: { width: 0, height: 4 },
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
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    alignItems: "center",
    justifyContent: "center",
  },

  itemContent: {
    flex: 1,
    marginLeft: 12,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: PREMIUM.navy,
  },

  itemSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: PREMIUM.muted,
  },

  separator: {
    height: 1,
    backgroundColor: PREMIUM.border,
    marginLeft: 71,
  },

  version: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 11,
    color: PREMIUM.muted,
    fontWeight: "700",
  },

  tagline: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 10,
    color: PREMIUM.muted,
  },
});