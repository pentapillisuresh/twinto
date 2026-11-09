
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddressCard from "../../components/checkout/AddressCard";
import BillDetails from "../../components/checkout/BillDetails";
import TipSelector from "../../components/checkout/TipSelector";
import FreeDeliveryBanner from "../../components/cart/FreeDeliveryBanner";

import { useCart, useLocation } from "../../context";
import {
  getAddresses,
  getSelectedAddress,
  isAddressServiceable,
} from "../../services/addressService";
import {
  getCheckoutAddressId,
  saveCheckoutAddress,
} from "../../services/checkoutAddressService";
import { validateCoupon } from "../../services/couponService";

/* =========================================
   THEME
========================================= */

const C = {
  primary: "#C9004F",
  primaryDark: "#A90042",
  navy: "#172033",
  white: "#FFFFFF",
  background: "#FFF9FB",
  soft: "#FFF0F5",
  border: "#E9DDE2",
  muted: "#858B95",
  green: "#15803D",
  gold: "#FFE19A",
};

const COUPON_STORAGE_KEY = "twinto_checkout_coupon";

const money = (value) =>
  `₹${Number(value || 0).toFixed(2)}`;

/* =========================================
   SECTION HEADING
========================================= */

function SectionHeading({ title, subtitle, icon }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionAccent} />

      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {!!subtitle && (
          <Text style={styles.sectionSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.sectionIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={C.primary}
        />
      </View>
    </View>
  );
}

/* =========================================
   MAIN CHECKOUT
========================================= */

export default function Checkout() {
  const insets = useSafeAreaInsets();
  const { location: homeLocation } = useLocation();

const {
  cart = [],
  itemCount = 0,
  itemTotal = 0,

  freeDelivery = false,
  freeDeliveryEnabled = false,
  freeDeliveryMaxItems = 3,

  deliveryFee = 0,
  platformFee = 0,
  minimumOrder = 0,

  tip = 0,
  setTip,
  total = 0,

  location,
  refreshLocation,
} = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState(null);
  const [hasSavedSelection, setHasSavedSelection] =
    useState(false);
  const [loading, setLoading] = useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const hasItems = cart.length > 0;

  // Use the same selected location and delivery-time value as Home.
  // Do not display an invented fixed delivery estimate.
  const deliveryTimeValue =
    homeLocation?.deliveryTime ?? location?.deliveryTime;
  const deliveryTimeText =
    deliveryTimeValue == null || String(deliveryTimeValue).trim() === ""
      ? null
      : /(?:min|hour|hr)/i.test(String(deliveryTimeValue))
      ? String(deliveryTimeValue).trim()
      : `${String(deliveryTimeValue).trim()} mins`;


  /* =========================================
     FIX: SELECTED LOCATION FROM CONTEXT
  ========================================= */

  const selectedLocationId =
    location?.isActive !== false &&
    location?.isAvailable !== false
      ? Number(location?.id) || null
      : null;

  /* =========================================
     SELECT SAVED ADDRESS
  ========================================= */

  const address = getSelectedAddress(
    addresses,
    hasSavedSelection ? selectedAddressId : null,
    selectedLocationId
  );

  const locationMatchesAddress =
    !!address &&
    !!selectedLocationId &&
    Number(address.locationId) ===
      Number(selectedLocationId);

  /* =========================================
     ADDRESS NAVIGATION
  ========================================= */

  const openAddressSelection = () => {
    if (!selectedLocationId) {
      Alert.alert(
        "Select Delivery Location",
        "Please select an available delivery location before choosing an address."
      );
      return;
    }

    router.push({
      pathname: "/checkout/address",
      params: {
        locationId: String(selectedLocationId),
      },
    });
  };

  const openAddAddress = () => {
    if (!selectedLocationId) {
      Alert.alert(
        "Select Delivery Location",
        "Please select an available delivery location first."
      );
      return;
    }

    router.push({
      pathname: "/checkout/add-address",
      params: {
        locationId: String(selectedLocationId),
      },
    });
  };

  /* =========================================
     ORDER CALCULATIONS
  ========================================= */

  const minimumOrderRemaining = Math.max(
    0,
    Number(minimumOrder || 0) -
      Number(itemTotal || 0)
  );

  const isMinimumOrderMet =
    Number(itemTotal || 0) >=
    Number(minimumOrder || 0);

  const discount = Math.max(
    0,
    Math.min(
      Number(itemTotal || 0),
      Number(appliedCoupon?.discount || 0)
    )
  );

  const estimatedTotal = Math.max(
    0,
    Number(total || 0) - discount
  );

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" && Platform.Version >= 35)
      ? insets.top
      : 0;

  /* =========================================
     LOAD ADDRESSES ON SCREEN FOCUS
  ========================================= */

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadAddresses = async () => {
        try {
          setLoading(true);

          const [list, savedId] = await Promise.all([
            getAddresses(),
            getCheckoutAddressId(),
          ]);

          if (!active) return;

          setAddresses(
            Array.isArray(list) ? list : []
          );
          setSelectedAddressId(savedId);
          setHasSavedSelection(savedId != null);
        } catch (error) {
          console.log(
            "[CHECKOUT] Address load error:",
            error
          );

          if (active) {
            setAddresses([]);
            setSelectedAddressId(null);
            setHasSavedSelection(false);
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      loadAddresses();

      return () => {
        active = false;
      };
    }, [selectedLocationId])
  );

  /* =========================================
     RESTORE SAVED COUPON
  ========================================= */

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem(
          COUPON_STORAGE_KEY
        );

        if (!saved || !active) return;

        const parsed = JSON.parse(saved);

        if (parsed?.code) {
          setCouponCode(
            String(parsed.code).toUpperCase()
          );
        }
      } catch (error) {
        console.log(
          "[CHECKOUT] Coupon restore error:",
          error?.message
        );
      }
    };

    restore();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================
     REMOVE COUPON
  ========================================= */

  const removeCoupon = async () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");

    try {
      await AsyncStorage.removeItem(
        COUPON_STORAGE_KEY
      );
    } catch (error) {
      console.log(
        "[CHECKOUT] Remove coupon error:",
        error?.message
      );
    }
  };

  /* =========================================
     APPLY COUPON
  ========================================= */

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (couponLoading) return;

    try {
      setCouponLoading(true);
      setCouponError("");

      const result = await validateCoupon(
        code,
        Number(itemTotal || 0)
      );

      const coupon = {
        code: String(
          result?.code || code
        ).toUpperCase(),
        discount: Math.max(
          0,
          Number(result?.discount || 0)
        ),
      };

      setAppliedCoupon(coupon);
      setCouponCode(coupon.code);

      await AsyncStorage.setItem(
        COUPON_STORAGE_KEY,
        JSON.stringify(coupon)
      );
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(
        error?.message || "Unable to apply coupon."
      );

      await AsyncStorage.removeItem(
        COUPON_STORAGE_KEY
      ).catch(() => {});
    } finally {
      setCouponLoading(false);
    }
  };

  /* =========================================
     REVALIDATE COUPON ON CART CHANGE
  ========================================= */

  useEffect(() => {
    if (!appliedCoupon?.code) return;

    let active = true;

    const revalidate = async () => {
      try {
        const result = await validateCoupon(
          appliedCoupon.code,
          Number(itemTotal || 0)
        );

        if (!active) return;

        const updated = {
          code: result?.code || appliedCoupon.code,
          discount: Math.max(
            0,
            Number(result?.discount || 0)
          ),
        };

        setAppliedCoupon(updated);

        await AsyncStorage.setItem(
          COUPON_STORAGE_KEY,
          JSON.stringify(updated)
        );
      } catch (error) {
        if (!active) return;

        setAppliedCoupon(null);
        setCouponError(
          error?.message ||
            "Coupon is no longer valid for this cart."
        );

        await AsyncStorage.removeItem(
          COUPON_STORAGE_KEY
        ).catch(() => {});
      }
    };

    revalidate();

    return () => {
      active = false;
    };
  }, [itemTotal]);

  /* =========================================
     CONTINUE TO PAYMENT
  ========================================= */

  const continueToPayment = async () => {
    if (loading) return;

    if (!selectedLocationId) {
      Alert.alert(
        "Delivery Location Required",
        "Please select an available delivery location before checkout."
      );
      return;
    }

    if (!address) {
      Alert.alert(
        "Address Required",
        "Please select an available address for your delivery location."
      );
      return;
    }

    if (
      !locationMatchesAddress ||
      !isAddressServiceable(
        address,
        selectedLocationId
      )
    ) {
      Alert.alert(
        "Delivery Location Unavailable",
        "This address is not available for the selected delivery location."
      );
      return;
    }

    if (!isMinimumOrderMet) {
      Alert.alert(
        "Minimum Order Required",
        `Please add ₹${minimumOrderRemaining.toFixed(2)} more.`
      );
      return;
    }

    try {
      await saveCheckoutAddress(address);

      setSelectedAddressId(address.id);
      setHasSavedSelection(true);

      router.push("/checkout/payment");
    } catch (error) {
      Alert.alert(
        "Address Error",
        error?.message || "Unable to save address."
      );
    }
  };

  /* =========================================
     PREMIUM HEADER
  ========================================= */

  const renderHeader = () => (
    <View
      style={[
        styles.header,
        { paddingTop: topInset + 10 },
      ]}
    >
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={C.navy}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSubtitle}>
            Review your order details
          </Text>
        </View>

        <View style={styles.headerTrailing}>
          <Ionicons
            name="bag-check-outline"
            size={21}
            color={C.primary}
          />
        </View>
      </View>
    </View>
  );

  /* =========================================
     EMPTY CART
  ========================================= */

  if (!hasItems) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={C.white}
        />

        {renderHeader()}

        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cart-outline"
              size={40}
              color={C.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Your cart is empty
          </Text>

          <Text style={styles.emptySubtitle}>
            Add some products before continuing
            to checkout.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Ionicons
              name="bag-outline"
              size={19}
              color={C.white}
            />
            <Text style={styles.emptyButtonText}>
              Continue Shopping
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={C.white}
            />
          </Pressable>
        </View>
      </View>
    );
  }

  /* =========================================
     CHECKOUT UI
  ========================================= */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.white}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

      {renderHeader()}

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 150 + insets.bottom,
        }}
      >
        {/* DELIVERY INFORMATION */}

        <View style={styles.deliveryCard}>
          <View style={styles.deliveryIcon}>
            <Ionicons
              name="flash"
              size={22}
              color={C.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.inlineRow}>
              <Text style={styles.deliveryTitle}>
                {deliveryTimeText
                  ? `Delivery in ${deliveryTimeText}`
                  : "Delivery time unavailable"}
              </Text>

              {!!deliveryTimeText && (
                <View style={styles.fastBadge}>
                  <Text style={styles.fastText}>ESTIMATE</Text>
                </View>
              )}
            </View>

            <Text style={styles.deliverySubtitle}>
              {homeLocation?.name || location?.name
                ? `Estimated time for ${homeLocation?.name || location?.name}`
                : "Based on your selected delivery location"}
            </Text>
          </View>
        </View>

        {/* FREE DELIVERY */}
<FreeDeliveryBanner
  itemCount={itemCount}
  freeDelivery={freeDelivery}
  freeDeliveryEnabled={freeDeliveryEnabled}
  freeDeliveryMaxItems={freeDeliveryMaxItems}
/>

        {/* DELIVERY ADDRESS */}

        <SectionHeading
          title="Delivery Address"
          subtitle="Where should we deliver your order?"
          icon="location-outline"
        />

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={C.primary} />
            <Text style={styles.mutedText}>
              Loading address...
            </Text>
          </View>
        ) : address ? (
          <AddressCard
            address={address}
            selected={true}
            onChange={openAddressSelection}
          />
        ) : (
          <Pressable
            style={styles.actionCard}
            onPress={
              selectedLocationId
                ? openAddressSelection
                : openAddAddress
            }
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="location-outline"
                size={22}
                color={C.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>
                {selectedLocationId
                  ? "Select delivery address"
                  : "Select delivery location first"}
              </Text>

              <Text style={styles.actionSubtitle}>
                {selectedLocationId
                  ? "Choose a saved address or add a new one"
                  : "Choose an available delivery area"}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={C.primary}
            />
          </Pressable>
        )}

        {!loading && !selectedLocationId && (
          <View style={styles.warning}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color="#B45309"
            />

            <Text style={styles.warningText}>
              Select a delivery location to view
              matching saved addresses.
            </Text>
          </View>
        )}

        {address && Number(minimumOrder) > 0 && (
          <View style={styles.minimumCard}>
            <Ionicons
              name={
                isMinimumOrderMet
                  ? "checkmark-circle"
                  : "information-circle-outline"
              }
              size={23}
              color={
                isMinimumOrderMet
                  ? C.green
                  : C.primary
              }
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.minimumTitle}>
                Minimum Order: {money(minimumOrder)}
              </Text>

              <Text style={styles.minimumSubtitle}>
                {isMinimumOrderMet
                  ? "Minimum order amount reached."
                  : `Add ${money(minimumOrderRemaining)} more to continue.`}
              </Text>
            </View>
          </View>
        )}

        {/* PAYMENT */}

        <SectionHeading
          title="Payment"
          subtitle="Select payment method on next step"
          icon="card-outline"
        />

        <Pressable
          style={styles.actionCard}
          onPress={continueToPayment}
        >
          <View style={styles.actionIcon}>
            <Ionicons
              name="wallet-outline"
              size={22}
              color={C.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>
              Choose payment method
            </Text>
            <Text style={styles.actionSubtitle}>
              Cash on Delivery available now
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={C.primary}
          />
        </Pressable>

        {/* TIP */}

        <View style={{ marginTop: 5 }}>
          <TipSelector
            tip={tip}
            setTip={setTip}
          />
        </View>

        {/* COUPON */}

        <View style={styles.couponCard}>
          <View style={styles.couponHeading}>
            <View style={styles.couponIcon}>
              <Ionicons
                name="pricetag-outline"
                size={22}
                color={C.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.couponTitle}>
                Apply Coupon
              </Text>
              <Text style={styles.couponSubtitle}>
                Have a promo code? Save on your order.
              </Text>
            </View>
          </View>

          <View style={styles.couponInputRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              placeholderTextColor={C.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              value={couponCode}
              editable={
                !couponLoading && !appliedCoupon
              }
              onChangeText={(value) => {
                setCouponCode(value.toUpperCase());
                setCouponError("");
              }}
            />

            <Pressable
              style={[
                styles.couponButton,
                (couponLoading ||
                  (!appliedCoupon &&
                    !couponCode.trim())) &&
                  styles.disabled,
              ]}
              disabled={
                couponLoading ||
                (!appliedCoupon &&
                  !couponCode.trim())
              }
              onPress={
                appliedCoupon
                  ? removeCoupon
                  : applyCoupon
              }
            >
              {couponLoading ? (
                <ActivityIndicator
                  size="small"
                  color={C.white}
                />
              ) : (
                <Text style={styles.couponButtonText}>
                  {appliedCoupon ? "Remove" : "Apply"}
                </Text>
              )}
            </Pressable>
          </View>

          {!!couponError && (
            <View style={styles.errorRow}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color="#C93652"
              />
              <Text style={styles.errorText}>
                {couponError}
              </Text>
            </View>
          )}

          {!!appliedCoupon && (
            <View style={styles.successRow}>
              <Ionicons
                name="checkmark-circle"
                size={19}
                color={C.green}
              />

              <Text style={styles.successText}>
                {appliedCoupon.code} applied — you
                save {money(discount)}
              </Text>
            </View>
          )}
        </View>

        {/* BILL DETAILS */}

        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.billTitle}>
                Bill Details
              </Text>

              <Text style={styles.billSubtitle}>
                Estimated amount for your order
              </Text>
            </View>

            <View style={styles.billIcon}>
              <Ionicons
                name="receipt-outline"
                size={20}
                color={C.primary}
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

          {!!appliedCoupon && (
            <>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>
                  Coupon ({appliedCoupon.code})
                </Text>

                <Text style={styles.discountText}>
                  −{money(discount)}
                </Text>
              </View>

              <View style={styles.billDivider} />

              <View style={styles.billRow}>
                <Text style={styles.finalLabel}>
                  Estimated total after coupon
                </Text>

                <Text style={styles.finalValue}>
                  {money(estimatedTotal)}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}

      <View
        style={[
          styles.bottom,
          {
            paddingBottom: Math.max(
              insets.bottom,
              12
            ),
          },
        ]}
      >
        <View style={styles.bottomTotal}>
          <Text style={styles.totalLabel}>
            {appliedCoupon
              ? "Estimated Total"
              : "Total to Pay"}
          </Text>

          <Text style={styles.totalValue}>
            {money(estimatedTotal)}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.pressed,
          ]}
          onPress={continueToPayment}
        >
          <Text style={styles.continueText}>
            Continue
          </Text>

          <View style={styles.arrowCircle}>
            <Ionicons
              name="arrow-forward"
              size={19}
              color={C.primary}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================================
   PREMIUM STYLES
========================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  header: {
    backgroundColor: C.white,
    paddingHorizontal: 15,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-start",
    paddingHorizontal: 12,
  },

  headerTitle: {
    color: C.navy,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 3,
  },

  headerTrailing: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  deliveryCard: {
    marginHorizontal: 16,
    marginTop: 17,
    minHeight: 78,
    padding: 14,
    borderRadius: 21,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 1,
  },

  deliveryIcon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryTitle: {
    color: C.navy,
    fontSize: 13,
    fontWeight: "800",
  },

  deliverySubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 5,
  },

  fastBadge: {
    marginLeft: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: C.soft,
  },

  fastText: {
    color: C.primary,
    fontSize: 8,
    fontWeight: "900",
  },

  sectionHeading: {
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
    backgroundColor: C.primary,
    marginRight: 11,
  },

  sectionTitle: {
    color: C.navy,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  sectionIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingCard: {
    marginHorizontal: 16,
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  mutedText: {
    color: C.muted,
    fontSize: 11,
  },

  actionCard: {
    marginHorizontal: 16,
    minHeight: 76,
    padding: 14,
    borderRadius: 21,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 1,
  },

  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  actionTitle: {
    color: C.navy,
    fontSize: 13,
    fontWeight: "800",
  },

  actionSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  warning: {
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

  warningText: {
    flex: 1,
    color: "#92400E",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },

  minimumCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 13,
    borderRadius: 19,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  minimumTitle: {
    color: C.navy,
    fontSize: 12,
    fontWeight: "800",
  },

  minimumSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 5,
  },

  couponCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 15,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },

  couponHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },

  couponIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  couponTitle: {
    color: C.navy,
    fontSize: 15,
    fontWeight: "900",
  },

  couponSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  couponInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  couponInput: {
    flex: 1,
    minWidth: 0,
    height: 48,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.background,
    color: C.navy,
    fontWeight: "700",
  },

  couponButton: {
    minWidth: 83,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  couponButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "900",
  },

  disabled: {
    opacity: 0.5,
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 11,
  },

  errorText: {
    flex: 1,
    color: "#C93652",
    fontSize: 11,
    fontWeight: "600",
  },

  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
    padding: 10,
    borderRadius: 11,
    backgroundColor: "#F0FDF4",
  },

  successText: {
    color: C.green,
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },

  billCard: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 15,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 1,
  },

  billHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  billTitle: {
    color: C.navy,
    fontSize: 16,
    fontWeight: "900",
  },

  billSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  billRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },

  billLabel: {
    color: "#59606D",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },

  discountText: {
    color: C.green,
    fontSize: 13,
    fontWeight: "900",
  },

  billDivider: {
    height: 1,
    backgroundColor: C.border,
    marginTop: 14,
  },

  finalLabel: {
    color: C.navy,
    fontSize: 12,
    fontWeight: "800",
    flex: 1,
  },

  finalValue: {
    color: C.primary,
    fontSize: 16,
    fontWeight: "900",
  },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10,
  },

  bottomTotal: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  totalLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  totalValue: {
    color: C.navy,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 4,
  },

  continueButton: {
    minWidth: 150,
    height: 52,
    paddingLeft: 20,
    paddingRight: 7,
    borderRadius: 27,
    backgroundColor: C.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  continueText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "900",
    marginRight: 12,
  },

  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  empty: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    color: C.navy,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },

  emptySubtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },

  emptyButton: {
    marginTop: 23,
    minWidth: 205,
    height: 52,
    paddingHorizontal: 19,
    borderRadius: 27,
    backgroundColor: C.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  emptyButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "900",
  },
});
