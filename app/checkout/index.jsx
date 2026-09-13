import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

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
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right"]}
      >
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cart-outline"
              size={34}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Your cart is empty
          </Text>

          <Text style={styles.emptySubtitle}>
            Add some products before continuing to checkout.
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

            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.white}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <AppHeader title="Checkout" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: 150 + insets.bottom,
          },
        ]}
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
            <View style={styles.deliveryTitleRow}>
              <Text style={styles.deliveryTitle}>
                Delivery in 17–20 mins
              </Text>

              <View style={styles.fastBadge}>
                <View style={styles.fastDot} />

                <Text style={styles.fastText}>
                  FAST
                </Text>
              </View>
            </View>

            <Text style={styles.deliverySubtitle}>
              Your order will be delivered quickly.
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
          <View style={styles.sectionTitleWrap}>
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
              size={21}
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

        {/* PAYMENT */}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
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
          style={({ pressed }) => [
            styles.paymentCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.paymentIcon}>
            <Ionicons
              name="wallet-outline"
              size={21}
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

          <View style={styles.chevronBox}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.primary}
            />
          </View>
        </Pressable>

        {/* TIP */}

        <TipSelector
          tip={tip}
          setTip={setTip}
        />

        {/* BILL */}

        <View style={styles.billSection}>
          <View style={styles.billHeader}>
            <View>
              <Text style={styles.billTitle}>
                Bill Details
              </Text>

              <Text style={styles.billSubtitle}>
                Final amount for your order
              </Text>
            </View>

            <View style={styles.billIcon}>
              <Ionicons
                name="receipt-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>
          </View>

          <BillDetails
            itemTotal={itemTotal}
            platformFee={platformFee}
            deliveryFee={deliveryFee}
            tip={tip}
            total={total}
          />
        </View>
      </ScrollView>

      {/* BOTTOM CHECKOUT BAR */}

      <View
        style={[
          styles.bottom,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.bottomTotal}>
          <Text style={styles.totalLabel}>
            Total to Pay
          </Text>

          <Text style={styles.total}>
            ₹{total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push("/checkout/payment")
          }
          style={({ pressed }) => [
            styles.continue,
            pressed && styles.continuePressed,
          ]}
        >
          <Text style={styles.continueText}>
            Continue
          </Text>

          <View style={styles.arrowCircle}>
            <Ionicons
              name="arrow-forward"
              size={16}
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
    paddingTop: 2,
  },

  /* DELIVERY */

  deliveryCard: {
    marginHorizontal: 16,
    marginTop: 14,

    minHeight: 76,

    paddingHorizontal: 13,
    paddingVertical: 12,

    borderRadius: 18,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#F0D5E1",

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  deliveryIcon: {
    width: 45,
    height: 45,

    borderRadius: 14,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  deliveryInfo: {
    flex: 1,
    marginLeft: 12,
  },

  deliveryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  deliveryTitle: {
    color: COLORS.text,

    fontSize: 13,
    fontWeight: "900",

    letterSpacing: -0.15,
  },

  deliverySubtitle: {
    marginTop: 5,

    color: COLORS.muted,

    fontSize: 10,
    lineHeight: 14,
  },

  fastBadge: {
    marginLeft: 7,

    paddingHorizontal: 7,
    paddingVertical: 4,

    borderRadius: 8,

    backgroundColor: "#FFE3EF",

    flexDirection: "row",
    alignItems: "center",
  },

  fastDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: COLORS.primary,

    marginRight: 4,
  },

  fastText: {
    color: COLORS.primary,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.4,
  },

  /* SECTION */

  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 23,
    marginBottom: 11,
  },

  sectionTitleWrap: {
    paddingLeft: 1,
  },

  sectionTitle: {
    color: COLORS.text,

    fontSize: 17,
    fontWeight: "900",

    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    marginTop: 4,

    color: COLORS.muted,

    fontSize: 10.5,
    lineHeight: 15,
  },

  /* ADMIN */

  adminCard: {
    marginHorizontal: 16,
    marginTop: 12,

    minHeight: 72,

    paddingHorizontal: 13,
    paddingVertical: 12,

    borderRadius: 17,

    backgroundColor: "#FFF0F6",

    borderWidth: 1,
    borderColor: "#F3D5E2",

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

    marginLeft: 11,
    marginRight: 8,
  },

  adminTitle: {
    color: COLORS.text,

    fontSize: 12,
    fontWeight: "900",

    letterSpacing: -0.1,
  },

  adminSubtitle: {
    marginTop: 4,

    color: COLORS.muted,

    fontSize: 9,
    lineHeight: 13,
  },

  toggle: {
    width: 40,
    height: 23,

    borderRadius: 13,

    backgroundColor: COLORS.primary,

    padding: 3,

    justifyContent: "center",
  },

  toggleCircle: {
    width: 17,
    height: 17,

    borderRadius: 9,

    backgroundColor: COLORS.white,

    alignSelf: "flex-end",
  },

  /* PAYMENT */

  paymentCard: {
    marginHorizontal: 16,
    marginTop: 0,

    minHeight: 70,

    paddingHorizontal: 13,
    paddingVertical: 12,

    borderRadius: 17,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EEDFE5",

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },

  paymentIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  paymentContent: {
    flex: 1,

    marginLeft: 11,
    marginRight: 8,
  },

  paymentTitle: {
    color: COLORS.text,

    fontSize: 12.5,
    fontWeight: "900",
  },

  paymentSubtitle: {
    marginTop: 4,

    color: COLORS.muted,

    fontSize: 10,
  },

  chevronBox: {
    width: 29,
    height: 29,

    borderRadius: 10,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  /* BILL */

  billSection: {
    marginHorizontal: 16,
    marginTop: 24,

    padding: 15,

    borderRadius: 18,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EEDFE5",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 9,
    elevation: 1,
  },

  billHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 7,
  },

  billTitle: {
    color: COLORS.text,

    fontSize: 15,
    fontWeight: "900",
  },

  billSubtitle: {
    marginTop: 3,

    color: COLORS.muted,

    fontSize: 9.5,
  },

  billIcon: {
    width: 36,
    height: 36,

    borderRadius: 11,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  /* BOTTOM */

  bottom: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    minHeight: 76,

    paddingHorizontal: 16,
    paddingTop: 11,

    backgroundColor: COLORS.white,

    borderTopWidth: 1,
    borderTopColor: "#EEDFE5",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,

    elevation: 10,
  },

  bottomTotal: {
    flex: 1,
  },

  totalLabel: {
    color: COLORS.muted,

    fontSize: 10,
    fontWeight: "700",
  },

  total: {
    marginTop: 2,

    color: COLORS.text,

    fontSize: 21,
    fontWeight: "900",

    letterSpacing: -0.4,
  },

  continue: {
    minWidth: 145,
    height: 50,

    paddingLeft: 20,
    paddingRight: 7,

    borderRadius: 16,

    backgroundColor: COLORS.primary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,

    elevation: 4,
  },

  continuePressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  continueText: {
    color: COLORS.white,

    fontSize: 14,
    fontWeight: "900",

    marginRight: 10,
  },

  arrowCircle: {
    width: 36,
    height: 36,

    borderRadius: 12,

    backgroundColor: COLORS.white,

    alignItems: "center",
    justifyContent: "center",
  },

  /* EMPTY */

  empty: {
    flex: 1,

    paddingHorizontal: 30,

    justifyContent: "center",
    alignItems: "center",
  },

  emptyIcon: {
    width: 76,
    height: 76,

    borderRadius: 25,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 18,
  },

  emptyTitle: {
    color: COLORS.text,

    fontSize: 22,
    fontWeight: "900",

    textAlign: "center",
  },

  emptySubtitle: {
    color: COLORS.muted,

    fontSize: 12,
    lineHeight: 18,

    textAlign: "center",

    marginTop: 7,

    maxWidth: 280,
  },

  emptyButton: {
    marginTop: 22,

    minWidth: 190,
    height: 50,

    paddingHorizontal: 18,

    borderRadius: 15,

    backgroundColor: COLORS.primary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,

    elevation: 4,
  },

  emptyButtonText: {
    color: COLORS.white,

    fontSize: 13,
    fontWeight: "900",

    marginRight: 9,
  },
});