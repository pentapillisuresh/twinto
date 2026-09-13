import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import AppHeader from "../../components/common/AppHeader";

import AddressCard from "../../components/checkout/AddressCard";

import BillDetails from "../../components/checkout/BillDetails";

import TipSelector from "../../components/checkout/TipSelector";

import FreeDeliveryBanner from "../../components/cart/FreeDeliveryBanner";

import { COLORS } from "../../constants";

import { addresses } from "../../data";

import { useCart } from "../../context";

export default function Checkout() {
  const {
    cart,
    itemCount,
    itemTotal,
    freeDelivery,
    deliveryFee,
    platformFee,
    tip,
    setTip,
    total,
  } = useCart();

  const address = addresses[0];

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            Your cart is empty
          </Text>

          <Pressable
            onPress={() =>
              router.replace("/(tabs)")
            }
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>
              Continue Shopping
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Checkout" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* DELIVERY TIME */}

        <View style={styles.deliveryCard}>
          <View style={styles.deliveryIcon}>
            <Ionicons
              name="flash"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>
              Delivery in 17–20 mins
            </Text>

            <Text style={styles.deliverySubtitle}>
              Your order will be delivered quickly.
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>
              FAST
            </Text>
          </View>
        </View>

        {/* FREE DELIVERY */}

        <FreeDeliveryBanner
          itemCount={itemCount}
          freeDelivery={freeDelivery}
        />

        {/* ADDRESS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Delivery Address
            </Text>

            <Text style={styles.sectionSubtitle}>
              Where should we deliver your order?
            </Text>
          </View>
        </View>

        <AddressCard
          address={address}
          selected={true}
          onChange={() =>
            router.push("/checkout/address")
          }
        />

        {/* SEND TO ADMIN */}

        <View style={styles.adminCard}>
          <View style={styles.adminIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.adminContent}>
            <Text style={styles.adminTitle}>
              Send this address to Admin
            </Text>

            <Text style={styles.adminSubtitle}>
              Allow TWINTO admin to receive this
              delivery address for order processing.
            </Text>
          </View>

          <View style={styles.toggle}>
            <View style={styles.toggleCircle} />
          </View>
        </View>

        {/* PAYMENT PREVIEW */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Payment
            </Text>

            <Text style={styles.sectionSubtitle}>
              Select payment method on next step
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            router.push("/checkout/payment")
          }
          style={styles.paymentCard}
        >
          <View style={styles.paymentIcon}>
            <Ionicons
              name="wallet-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>
              Choose payment method
            </Text>

            <Text style={styles.paymentSubtitle}>
              UPI, Card, Net Banking or Cash
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.muted}
          />
        </Pressable>

        {/* TIP */}

        <TipSelector
          tip={tip}
          setTip={setTip}
        />

        {/* BILL */}

        <BillDetails
          itemTotal={itemTotal}
          platformFee={platformFee}
          deliveryFee={deliveryFee}
          tip={tip}
          total={total}
        />

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* BOTTOM */}

      <View style={styles.bottom}>
        <View>
          <Text style={styles.totalLabel}>
            To Pay
          </Text>

          <Text style={styles.total}>
            ₹{total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push("/checkout/payment")
          }
          style={styles.continue}
        >
          <Text style={styles.continueText}>
            Continue
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color={COLORS.white}
          />
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
    paddingBottom: 20,
  },

  deliveryCard: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  deliveryIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryInfo: {
    flex: 1,
    marginLeft: 11,
  },

  deliveryTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },

  deliverySubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
  },

  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: COLORS.primaryLight,
  },

  liveText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 23,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
  },

  adminCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    flexDirection: "row",
    alignItems: "center",
  },

  adminIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  adminContent: {
    flex: 1,
    marginLeft: 10,
  },

  adminTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  adminSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  toggle: {
    width: 40,
    height: 23,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    padding: 3,
    justifyContent: "center",
  },

  toggleCircle: {
    width: 17,
    height: 17,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignSelf: "flex-end",
  },

  paymentCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  paymentIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentContent: {
    flex: 1,
    marginLeft: 11,
  },

  paymentTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  paymentSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
  },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },

  total: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },

  continue: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
  },

  continueText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
    marginRight: 8,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },

  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 22,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonText: {
    color: COLORS.white,
    fontWeight: "900",
  },
});