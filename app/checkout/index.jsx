
import { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import AddressCard from "../../components/checkout/AddressCard";
import BillDetails from "../../components/checkout/BillDetails";
import TipSelector from "../../components/checkout/TipSelector";
import FreeDeliveryBanner from "../../components/cart/FreeDeliveryBanner";
import { COLORS } from "../../constants";
import { useCart } from "../../context";
import { getAddresses } from "../../services/addressService";

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
  gold: "#FFE19A",
};

export default function Checkout() {
  const insets = useSafeAreaInsets();

  // ORIGINAL CART CONTEXT - UNCHANGED
  const {
    cart = [],
    itemCount = 0,
    itemTotal = 0,
    freeDelivery = false,
    deliveryFee = 0,
    platformFee = 0,
    minimumOrder = 0,
    freeDeliveryMaxItems = 3,
    tip = 0,
    setTip,
    total = 0,
    locationFees,
  } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ORIGINAL ADDRESS API LOGIC - UNCHANGED
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          setLoading(true);

          const list = await getAddresses();

          if (active) {
            setAddresses(Array.isArray(list) ? list : []);
          }
        } catch (e) {
          console.log("Address load error:", e);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  // ORIGINAL ADDRESS SELECTION
  const address = addresses[0];

  // ORIGINAL LOCATION MATCHING LOGIC
  const addressLocationId =
    address?.locationId ??
    address?.location?.id ??
    null;

  const selectedLocationId =
    locationFees?.locationId ??
    locationFees?.id ??
    null;

  const locationMatchesAddress =
    !addressLocationId ||
    !selectedLocationId ||
    String(addressLocationId) === String(selectedLocationId);

  // ORIGINAL FEE CALCULATIONS
  const displayedPlatformFee = platformFee;
  const displayedDeliveryFee = deliveryFee;

  const minimumOrderRemaining = Math.max(
    0,
    Number(minimumOrder || 0) - Number(itemTotal || 0)
  );

  const isMinimumOrderMet =
    Number(itemTotal || 0) >= Number(minimumOrder || 0);

  const hasItems = cart.length > 0;

  // FULL WIDTH HEADER SAFE AREA HANDLING
  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" && Platform.Version >= 35)
      ? insets.top
      : 0;

  // PREMIUM FIXED HEADER
  function renderHeader() {
    return (
      <View
        style={[
          styles.headerBackground,
          {
            paddingTop: topInset + 16,
          },
        ]}
      >
        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />

        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color={PREMIUM.white}
            />
          </Pressable>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>
              Checkout
            </Text>

            <Text style={styles.headerSubtitle}>
              Review your order details
            </Text>
          </View>

          <View style={styles.headerSide} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerInfoIcon}>
            <Ionicons
              name="bag-check-outline"
              size={20}
              color={PREMIUM.gold}
            />
          </View>

          <View style={styles.headerInfoContent}>
            <Text style={styles.headerInfoTitle}>
              Almost there!
            </Text>

            <Text style={styles.headerInfoSubtitle}>
              {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"} in your order
            </Text>
          </View>

          <View style={styles.headerInfoBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={PREMIUM.white}
            />
          </View>
        </View>
      </View>
    );
  }

  // ORIGINAL EMPTY CART CONDITION
  if (!hasItems) {
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

        {renderHeader()}

        <View style={styles.empty}>
          <View style={styles.emptyIconOuter}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="cart-outline"
                size={36}
                color={PREMIUM.primary}
              />
            </View>
          </View>

          <Text style={styles.emptyTitle}>
            Your cart is empty
          </Text>

          <Text style={styles.emptySubtitle}>
            Add some products before continuing to checkout.
          </Text>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="bag-outline"
              size={18}
              color={PREMIUM.white}
            />

            <Text style={styles.emptyButtonText}>
              Continue Shopping
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color={PREMIUM.white}
            />
          </Pressable>
        </View>
      </View>
    );
  }

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

      {/* FIXED HEADER - DOES NOT SCROLL */}
      {renderHeader()}

      {/* ONLY CHECKOUT CONTENT SCROLLS */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: 150 + insets.bottom,
          },
        ]}
      >
        {/* DELIVERY INFORMATION */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryIcon}>
            <Ionicons
              name="flash"
              size={21}
              color={PREMIUM.primary}
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

        {/* ORIGINAL FREE DELIVERY COMPONENT */}
        <View style={styles.freeDeliveryWrap}>
          <FreeDeliveryBanner
            itemCount={itemCount}
            freeDelivery={freeDelivery}
          />
        </View>

        {/* DELIVERY ADDRESS SECTION */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />

          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>
              Delivery Address
            </Text>

            <Text style={styles.sectionSubtitle}>
              Where should we deliver your order?
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="location-outline"
              size={17}
              color={PREMIUM.primary}
            />
          </View>
        </View>

        {/* ORIGINAL ADDRESS LOGIC */}
        {loading ? (
          <View style={styles.addressLoading}>
            <ActivityIndicator
              size="small"
              color={PREMIUM.primary}
            />

            <Text style={styles.addressLoadingText}>
              Loading address...
            </Text>
          </View>
        ) : address ? (
          <View style={styles.addressCardWrap}>
            <AddressCard
              address={address}
              selected={true}
              onChange={() =>
                router.push("/checkout/address")
              }
            />
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.noAddress,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              router.push("/checkout/add-address")
            }
          >
            <View style={styles.noAddressIcon}>
              <Ionicons
                name="add"
                size={22}
                color={PREMIUM.primary}
              />
            </View>

            <View style={styles.noAddressContent}>
              <Text style={styles.noAddressText}>
                Add a delivery address
              </Text>

              <Text style={styles.noAddressSubtitle}>
                Choose where to receive your order
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={PREMIUM.primary}
            />
          </Pressable>
        )}

        {/* ORIGINAL LOCATION / MINIMUM ORDER LOGIC */}
        {address && (
          <>
            {!locationMatchesAddress && (
              <View style={styles.locationWarning}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#B45309"
                />

                <Text style={styles.locationWarningText}>
                  Your selected delivery address belongs to a
                  different location. Please verify the address
                  before placing your order.
                </Text>
              </View>
            )}

            {Number(minimumOrder) > 0 && (
              <View style={styles.minimumOrderCard}>
                <View style={styles.minimumOrderIcon}>
                  <Ionicons
                    name={
                      isMinimumOrderMet
                        ? "checkmark-circle"
                        : "information-circle-outline"
                    }
                    size={21}
                    color={
                      isMinimumOrderMet
                        ? "#15803D"
                        : PREMIUM.primary
                    }
                  />
                </View>

                <View style={styles.minimumOrderContent}>
                  <Text style={styles.minimumOrderTitle}>
                    Minimum Order: ₹
                    {Number(minimumOrder).toFixed(2)}
                  </Text>

                  <Text style={styles.minimumOrderSubtitle}>
                    {isMinimumOrderMet
                      ? "Minimum order amount reached."
                      : `Add ₹${minimumOrderRemaining.toFixed(
                          2
                        )} more to continue.`}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* PAYMENT SECTION */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />

          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>
              Payment
            </Text>

            <Text style={styles.sectionSubtitle}>
              Select payment method on next step
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="card-outline"
              size={17}
              color={PREMIUM.primary}
            />
          </View>
        </View>

        {/* ORIGINAL PAYMENT NAVIGATION */}
        <Pressable
          onPress={() => router.push("/checkout/payment")}
          style={({ pressed }) => [
            styles.paymentCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.paymentIcon}>
            <Ionicons
              name="wallet-outline"
              size={21}
              color={PREMIUM.primary}
            />
          </View>

          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>
              Choose payment method
            </Text>

            <Text style={styles.paymentSubtitle}>
              Cash on Delivery available now
            </Text>
          </View>

          <View style={styles.chevronBox}>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={PREMIUM.primary}
            />
          </View>
        </Pressable>

        {/* ORIGINAL TIP COMPONENT */}
        <View style={styles.tipWrap}>
          <TipSelector tip={tip} setTip={setTip} />
        </View>

        {/* BILL DETAILS */}
        <View style={styles.billSection}>
          <View style={styles.billHeader}>
            <View style={styles.billHeadingContent}>
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
                size={19}
                color={PREMIUM.primary}
              />
            </View>
          </View>

          {/* ORIGINAL BILL CALCULATIONS */}
          <BillDetails
            itemTotal={itemTotal}
            platformFee={displayedPlatformFee}
            deliveryFee={displayedDeliveryFee}
            tip={tip}
            total={total}
          />
        </View>
      </ScrollView>

      {/* FIXED BOTTOM TOTAL BAR */}
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

        {/* ORIGINAL CONTINUE NAVIGATION */}
        <Pressable
          onPress={() => router.push("/checkout/payment")}
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
              size={17}
              color={PREMIUM.primary}
            />
          </View>
        </Pressable>
      </View>
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

  scroll: {
    paddingTop: 3,
  },

  // FIXED FULL-WIDTH HEADER
  headerBackground: {
    backgroundColor: PREMIUM.primary,
    paddingHorizontal: 18,
    paddingBottom: 21,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.17)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerSide: {
    width: 44,
    height: 44,
  },

  headerTitleBox: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  headerTitle: {
    color: PREMIUM.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },

  headerInfo: {
    marginTop: 19,
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
  },

  headerInfoIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.14)",
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
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // DELIVERY CARD
  deliveryCard: {
    marginHorizontal: 16,
    marginTop: 17,
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 21,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  deliveryIcon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: PREMIUM.pinkSoft,
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
    color: PREMIUM.navy,
    fontSize: 13,
    fontWeight: "800",
  },

  deliverySubtitle: {
    marginTop: 5,
    color: PREMIUM.muted,
    fontSize: 10,
  },

  fastBadge: {
    marginLeft: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: PREMIUM.pinkSoft,
    flexDirection: "row",
    alignItems: "center",
  },

  fastDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PREMIUM.primary,
    marginRight: 4,
  },

  fastText: {
    color: PREMIUM.primary,
    fontSize: 8,
    fontWeight: "900",
  },

  // FREE DELIVERY
  freeDeliveryWrap: {
    marginTop: 3,
  },

  // SECTION HEADERS
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  sectionAccent: {
    width: 4,
    height: 36,
    borderRadius: 3,
    backgroundColor: PREMIUM.primary,
    marginRight: 11,
  },

  sectionTitleWrap: {
    flex: 1,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    marginTop: 4,
    color: PREMIUM.muted,
    fontSize: 10,
  },

  sectionIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  // ADDRESS
  addressLoading: {
    marginHorizontal: 16,
    minHeight: 78,
    backgroundColor: PREMIUM.white,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  addressLoadingText: {
    color: PREMIUM.muted,
    fontSize: 11,
    fontWeight: "600",
  },

  addressCardWrap: {
    borderRadius: 20,
  },

  noAddress: {
    marginHorizontal: 16,
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 21,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
  },

  noAddressIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  noAddressContent: {
    flex: 1,
    marginLeft: 12,
  },

  noAddressText: {
    color: PREMIUM.primary,
    fontWeight: "800",
    fontSize: 13,
  },

  noAddressSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  // LOCATION WARNING
  locationWarning: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  locationWarningText: {
    flex: 1,
    color: "#92400E",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },

  // MINIMUM ORDER
  minimumOrderCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 13,
    borderRadius: 19,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
  },

  minimumOrderIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  minimumOrderContent: {
    flex: 1,
    marginLeft: 11,
  },

  minimumOrderTitle: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "800",
  },

  minimumOrderSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 5,
  },

  // PAYMENT CARD
  paymentCard: {
    marginHorizontal: 16,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 21,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  paymentIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  paymentTitle: {
    color: PREMIUM.navy,
    fontSize: 13,
    fontWeight: "800",
  },

  paymentSubtitle: {
    marginTop: 4,
    color: PREMIUM.muted,
    fontSize: 10,
  },

  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  // TIP SECTION
  tipWrap: {
    marginTop: 5,
  },

  // BILL DETAILS
  billSection: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 15,
    borderRadius: 22,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  billHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  billHeadingContent: {
    flex: 1,
  },

  billTitle: {
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "900",
  },

  billSubtitle: {
    marginTop: 4,
    color: PREMIUM.muted,
    fontSize: 10,
  },

  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  // FIXED BOTTOM BAR
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: PREMIUM.white,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10,
    shadowColor: PREMIUM.navy,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },

  bottomTotal: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  totalLabel: {
    color: PREMIUM.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  total: {
    marginTop: 4,
    color: PREMIUM.navy,
    fontSize: 21,
    fontWeight: "900",
  },

  continue: {
    minWidth: 150,
    height: 52,
    paddingLeft: 20,
    paddingRight: 7,
    borderRadius: 27,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  continuePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  continueText: {
    color: PREMIUM.white,
    fontSize: 13,
    fontWeight: "900",
    marginRight: 12,
  },

  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // EMPTY CART
  empty: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyIconOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: PREMIUM.navy,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },

  emptySubtitle: {
    color: PREMIUM.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
  },

  emptyButton: {
    marginTop: 23,
    minWidth: 205,
    height: 52,
    paddingHorizontal: 19,
    borderRadius: 27,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  emptyButtonText: {
    color: PREMIUM.white,
    fontSize: 12,
    fontWeight: "900",
  },
});
