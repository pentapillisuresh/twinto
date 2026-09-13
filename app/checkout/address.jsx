import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import AppHeader from "../../components/common/AppHeader";

import AddressCard from "../../components/checkout/AddressCard";

import { COLORS } from "../../constants";

import { addresses } from "../../data";

export default function AddressScreen() {
  const insets = useSafeAreaInsets();

  const address = addresses[0];

  function selectAddress() {
    router.back();
  }

  function addNewAddress() {
    router.push("/checkout/add-address");
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <AppHeader title="Delivery Address" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: 125 + insets.bottom,
          },
        ]}
      >
        {/* INTRO */}
        <View style={styles.heading}>
          <View style={styles.headingIcon}>
            <Ionicons
              name="location"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headingContent}>
            <Text style={styles.title}>
              Select delivery address
            </Text>

            <Text style={styles.subtitle}>
              Choose where you want your groceries delivered.
            </Text>
          </View>
        </View>

        {/* SAVED ADDRESS HEADER */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Saved Address
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your available delivery location
            </Text>
          </View>

          <View style={styles.savedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={13}
              color={COLORS.primary}
            />

            <Text style={styles.savedBadgeText}>
              1 SAVED
            </Text>
          </View>
        </View>

        {/* SELECTED ADDRESS */}
        <View style={styles.addressWrapper}>
          <View style={styles.selectedTopLine} />

          <AddressCard
            address={address}
            selected={true}
          />

          <View style={styles.selectedFooter}>
            <View style={styles.selectedIcon}>
              <Ionicons
                name="checkmark"
                size={12}
                color={COLORS.white}
              />
            </View>

            <Text style={styles.selectedText}>
              Selected for delivery
            </Text>
          </View>
        </View>

        {/* ADD NEW ADDRESS */}
        <Pressable
          style={({ pressed }) => [
            styles.addAddress,
            pressed && styles.pressed,
          ]}
          onPress={addNewAddress}
        >
          <View style={styles.addIcon}>
            <Ionicons
              name="add"
              size={23}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.addContent}>
            <Text style={styles.addTitle}>
              Add a new address
            </Text>

            <Text style={styles.addSubtitle}>
              Add another delivery location
            </Text>
          </View>

          <View style={styles.arrowBox}>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={COLORS.primary}
            />
          </View>
        </Pressable>

        {/* DELIVERY INFO */}
        <View style={styles.deliveryInfoCard}>
          <View style={styles.deliveryIcon}>
            <Ionicons
              name="flash"
              size={19}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.deliveryContent}>
            <Text style={styles.deliveryTitle}>
              Fast delivery to your doorstep
            </Text>

            <Text style={styles.deliverySubtitle}>
              Estimated delivery time is approximately 17
              minutes.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(
              12,
              insets.bottom + 8
            ),
          },
        ]}
      >
        <View style={styles.bottomAddress}>
          <View style={styles.bottomLocationIcon}>
            <Ionicons
              name="location"
              size={16}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.bottomAddressInfo}>
            <Text style={styles.bottomAddressLabel}>
              Delivering to
            </Text>

            <Text
              style={styles.bottomAddressText}
              numberOfLines={1}
            >
              {address.type} • {address.name}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={selectAddress}
          style={({ pressed }) => [
            styles.confirm,
            pressed && styles.confirmPressed,
          ]}
        >
          <Text style={styles.confirmText}>
            Deliver Here
          </Text>

          <View style={styles.confirmIcon}>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.primary}
            />
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  heading: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#EEDFE5",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  headingIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },

  headingContent: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 3,
  },

  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F6",
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  savedBadgeText: {
    color: COLORS.primary,
    fontSize: 7,
    fontWeight: "900",
    marginLeft: 4,
    letterSpacing: 0.3,
  },

  addressWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.primary,
    overflow: "hidden",
    marginBottom: 13,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },

  selectedTopLine: {
    height: 3,
    backgroundColor: COLORS.primary,
  },

  selectedFooter: {
    marginHorizontal: 13,
    marginBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1E5EA",
    flexDirection: "row",
    alignItems: "center",
  },

  selectedIcon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedText: {
    color: COLORS.primary,
    fontSize: 9.5,
    fontWeight: "800",
    marginLeft: 7,
  },

  addAddress: {
    minHeight: 72,
    padding: 13,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  addIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFF0F6",
    alignItems: "center",
    justifyContent: "center",
  },

  addContent: {
    flex: 1,
    marginLeft: 11,
  },

  addTitle: {
    color: COLORS.text,
    fontSize: 12.5,
    fontWeight: "900",
  },

  addSubtitle: {
    color: COLORS.muted,
    fontSize: 9.5,
    marginTop: 4,
  },

  arrowBox: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#FFF0F6",
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  deliveryInfoCard: {
    minHeight: 70,
    padding: 12,
    borderRadius: 17,
    backgroundColor: "#FFF0F6",
    borderWidth: 1,
    borderColor: "#F1D2DF",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  deliveryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryContent: {
    flex: 1,
    marginLeft: 10,
  },

  deliveryTitle: {
    color: COLORS.text,
    fontSize: 11.5,
    fontWeight: "900",
  },

  deliverySubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#EEDFE5",
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },

  bottomAddress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  bottomLocationIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FFF0F6",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomAddressInfo: {
    flex: 1,
    marginLeft: 8,
  },

  bottomAddressLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "700",
  },

  bottomAddressText: {
    color: COLORS.text,
    fontSize: 10.5,
    fontWeight: "900",
    marginTop: 2,
  },

  confirm: {
    height: 48,
    minWidth: 139,
    paddingLeft: 15,
    paddingRight: 6,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  confirmText: {
    color: COLORS.white,
    fontSize: 11.5,
    fontWeight: "900",
  },

  confirmIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});