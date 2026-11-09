
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";

import { COLORS } from "../../constants";
import { useCart } from "../../context";

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
  imageBg: "#F8F5F1",
  gold: "#FFE19A",
};

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    cart = [],
    itemCount = 0,
    itemTotal = 0,
    platformFee = 0,
    deliveryFee = 0,
    freeDelivery = false,
    freeDeliveryMaxItems = 0,
    freeDeliveryEnabled = false,
    refreshLocation,
    tip = 0,
    setTip,
    total = 0,
    increase,
    decrease,
    clear,
  } = useCart();

  // Fetch the latest admin settings each time the cart becomes visible.
  useFocusEffect(
    useCallback(() => {
      if (typeof refreshLocation === "function") {
        refreshLocation().catch((error) =>
          console.log("[CART] Location refresh:", error?.message)
        );
      }
    }, [refreshLocation])
  );

  // ORIGINAL CART NORMALIZATION
  const normalizedCart = cart
    .map((item) => {
      if (!item) {
        return null;
      }

      if (item.product) {
        return {
          ...item.product,
          quantity: Number(item.quantity) || 1,
        };
      }

      return item;
    })
    .filter(
      (item) =>
        item &&
        item.id !== undefined &&
        item.id !== null
    );

  // ORIGINAL IMAGE LOGIC
  function getImageSource(image) {
    if (!image) return null;

    return { uri: image };
  }

  // ORIGINAL CHECKOUT LOGIC
  function goToCheckout() {
    if (normalizedCart.length === 0) {
      return;
    }

    router.push("/checkout");
  }

  const isEmpty = normalizedCart.length === 0;

  /*
   * Android edge-to-edge:
   * The header extends behind the status bar.
   *
   * On non-edge-to-edge Android, the native
   * status bar already reserves its own space.
   */
  const topInset =
    Platform.OS === "ios"
      ? insets.top
      : Platform.Version >= 35
      ? insets.top
      : 0;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={PREMIUM.white}
        translucent={Platform.OS === "android" && Platform.Version >= 35}
      />

      {/* CLEAN WHITE FIXED HEADER */}
      <View style={[styles.headerBackground, { paddingTop: topInset + 10 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="cart-outline" size={23} color={PREMIUM.primary} />
          </View>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>My Cart</Text>
            <Text style={styles.headerSubtitle}>Your shopping basket</Text>
          </View>
          {!isEmpty ? (
            <Pressable onPress={clear} hitSlop={10} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={16} color={PREMIUM.primary} />
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          ) : (
            <View style={styles.headerSide} />
          )}
        </View>
      </View>

      {/* EMPTY CART */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyOuter}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="basket-outline"
                size={49}
                color={PREMIUM.primary}
              />
            </View>
          </View>

          <Text style={styles.emptyTitle}>
            Your cart is empty
          </Text>

          <Text style={styles.emptySubtitle}>
            Add some fresh groceries and daily
            essentials to your cart.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.shopButtonText}>
              START SHOPPING
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color={COLORS.white}
            />
          </Pressable>
        </View>
      ) : (
        <>
          {/* SCROLLABLE CONTENT */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* ITEM COUNT */}
            <View style={styles.itemCountRow}>
              <View style={styles.itemCountIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color={PREMIUM.primary}
                />
              </View>

              <View style={styles.itemCountContent}>
                <Text style={styles.itemCountTitle}>
                  {itemCount}{" "}
                  {itemCount === 1
                    ? "item"
                    : "items"}{" "}
                  in your cart
                </Text>

                <Text style={styles.itemCountSubtitle}>
                  Fresh groceries delivered to your doorstep
                </Text>
              </View>

              <Ionicons
                name="sparkles-outline"
                size={20}
                color={PREMIUM.primary}
              />
            </View>

            {/* FREE DELIVERY */}
          {/* FREE DELIVERY */}
{freeDeliveryEnabled && freeDeliveryMaxItems > 0 && (
  <View style={styles.freeDeliveryCard}>
    <View style={styles.freeIcon}>
      <Ionicons
        name="bicycle-outline"
        size={22}
        color={PREMIUM.primary}
      />
    </View>

    <View style={styles.freeContent}>
      <Text style={styles.freeTitle}>
        {freeDelivery
          ? "FREE DELIVERY UNLOCKED!"
          : "UNLOCK FREE DELIVERY"}
      </Text>

      <Text style={styles.freeSubtitle}>
        {freeDelivery
          ? `Your order qualifies for FREE delivery (${freeDeliveryMaxItems}+ items).`
          : `Add ${Math.max(
              0,
              freeDeliveryMaxItems - itemCount
            )} more ${
              freeDeliveryMaxItems - itemCount === 1
                ? "item"
                : "items"
            } for FREE delivery.`}
      </Text>
    </View>

    <Ionicons
      name="checkmark-circle"
      size={20}
      color={PREMIUM.primary}
    />
  </View>
)}

            {/* CART ITEMS */}
            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionAccent} />

                <Text style={styles.sectionTitle}>
                  Your Items
                </Text>

                <View style={styles.itemBadge}>
                  <Text style={styles.itemBadgeText}>
                    {itemCount}
                  </Text>
                </View>
              </View>

              {normalizedCart.map((item, index) => {
                const quantity =
                  Number(item.quantity) || 1;

                const imageSource =
                  getImageSource(item.image);

                return (
                  <View
                    key={String(item.id)}
                    style={[
                      styles.productRow,
                      index !==
                        normalizedCart.length - 1 &&
                        styles.productBorder,
                    ]}
                  >
                    {/* PRODUCT IMAGE */}
                    <Pressable
                      style={styles.imageBox}
                      onPress={() =>
                        router.push(`/product/${item.id}`)
                      }
                    >
                      {imageSource ? (
                        <Image
                          source={imageSource}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="image-outline"
                          size={28}
                          color={PREMIUM.muted}
                        />
                      )}
                    </Pressable>

                    {/* PRODUCT DETAILS */}
                    <View style={styles.productInfo}>
                      <Text
                        style={styles.productName}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>

                      <Text style={styles.weight}>
                        {item.weight}
                      </Text>

                      <View style={styles.priceRow}>
                        <Text style={styles.price}>
                          ₹{Number(item.price || 0).toFixed(0)}
                        </Text>

                        {item.mrp &&
                          item.mrp > item.price && (
                            <Text style={styles.mrp}>
                              ₹{Number(item.mrp).toFixed(0)}
                            </Text>
                          )}
                      </View>

                      {/* QUANTITY BUTTONS */}
                      <View style={styles.quantityContainer}>
                        <Pressable
                          style={styles.quantityButton}
                          onPress={() => decrease(item.id)}
                        >
                          <Ionicons
                            name="remove"
                            size={16}
                            color={PREMIUM.primary}
                          />
                        </Pressable>

                        <Text style={styles.quantityText}>
                          {quantity}
                        </Text>

                        <Pressable
                          style={styles.quantityButtonPlus}
                          onPress={() => increase(item.id)}
                        >
                          <Ionicons
                            name="add"
                            size={17}
                            color={PREMIUM.white}
                          />
                        </Pressable>
                      </View>
                    </View>

                    <Text style={styles.itemTotal}>
                      ₹{Number(item.price || 0) * quantity}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* TIP */}
            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionAccent} />

                <Text style={styles.sectionTitle}>
                  Tip Your Delivery Partner
                </Text>
              </View>

              <Text style={styles.sectionSubtitle}>
                100% of your tip goes to the delivery partner.
              </Text>

              <View style={styles.tipRow}>
                {[0, 10, 20, 30].map((amount) => {
                  const selected = tip === amount;

                  return (
                    <Pressable
                      key={amount}
                      style={[
                        styles.tipButton,
                        selected &&
                          styles.tipButtonSelected,
                      ]}
                      onPress={() => setTip(amount)}
                    >
                      <Text
                        style={[
                          styles.tipText,
                          selected &&
                            styles.tipTextSelected,
                        ]}
                      >
                        {amount === 0
                          ? "No Tip"
                          : `₹${amount}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* BILL DETAILS */}
            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionAccent} />

                <Text style={styles.sectionTitle}>
                  Bill Details
                </Text>

                <Ionicons
                  name="receipt-outline"
                  size={19}
                  color={PREMIUM.primary}
                  style={styles.billIcon}
                />
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>
                  Item Total
                </Text>

                <Text style={styles.billValue}>
                  ₹{itemTotal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>
                  Platform Fee
                </Text>

                <Text style={styles.billValue}>
                  ₹{platformFee.toFixed(2)}
                </Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>
                  Delivery Partner Fee
                </Text>

                <Text
                  style={[
                    styles.billValue,
                    deliveryFee === 0 &&
                      styles.freeValue,
                  ]}
                >
                  {deliveryFee === 0
                    ? "FREE"
                    : `₹${deliveryFee.toFixed(2)}`}
                </Text>
              </View>

              {tip > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>
                    Delivery Partner Tip
                  </Text>

                  <Text style={styles.billValue}>
                    ₹{tip.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.totalDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Total Amount
                </Text>

                <Text style={styles.totalValue}>
                  ₹{total.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* SAVINGS */}
            {normalizedCart.some(
              (item) =>
                item.mrp &&
                item.price &&
                item.mrp > item.price
            ) && (
              <View style={styles.savingsCard}>
                <Ionicons
                  name="pricetag-outline"
                  size={19}
                  color={PREMIUM.primary}
                />

                <Text style={styles.savingsText}>
                  You are getting great prices on your groceries!
                </Text>
              </View>
            )}

            <View style={styles.bottomSpace} />
          </ScrollView>

          {/* FIXED CHECKOUT BAR */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomAmountBox}>
              <Text style={styles.bottomLabel}>
                TOTAL PAYABLE
              </Text>

              <Text style={styles.bottomTotal}>
                ₹{total.toFixed(2)}
              </Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={goToCheckout}
            >
              <Text style={styles.checkoutText}>
                PROCEED TO CHECKOUT
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color={COLORS.white}
              />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  // CLEAN WHITE HEADER
  headerBackground: {
    backgroundColor: PREMIUM.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSide: { width: 65 },
  headerTitleBox: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    color: PREMIUM.navy,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: PREMIUM.muted,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 3,
  },
  clearButton: {
    minWidth: 65,
    height: 38,
    borderRadius: 12,
    backgroundColor: PREMIUM.pinkSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  clearText: {
    color: PREMIUM.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 15,
    paddingTop: 16,
    paddingBottom: 22,
  },

  itemCountRow: {
    backgroundColor: PREMIUM.white,
    borderRadius: 17,
    paddingHorizontal: 13,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PREMIUM.border,
  },

  itemCountIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  itemCountContent: {
    flex: 1,
    minWidth: 0,
  },

  itemCountTitle: {
    color: PREMIUM.navy,
    fontSize: 13,
    fontWeight: "800",
  },

  itemCountSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  freeDeliveryCard: {
    backgroundColor: PREMIUM.pinkSoft,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
  },

  freeIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  freeContent: {
    flex: 1,
    marginLeft: 11,
  },

  freeTitle: {
    color: PREMIUM.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  freeSubtitle: {
    color: PREMIUM.navy,
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
    lineHeight: 15,
  },

  section: {
    backgroundColor: PREMIUM.white,
    borderRadius: 19,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    shadowColor: "#7A2949",
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionAccent: {
    width: 3,
    height: 20,
    borderRadius: 2,
    backgroundColor: PREMIUM.primary,
    marginRight: 9,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 14,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: PREMIUM.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  itemBadge: {
    backgroundColor: PREMIUM.pinkSoft,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 9,
  },

  itemBadgeText: {
    color: PREMIUM.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  productRow: {
    flexDirection: "row",
    paddingVertical: 8,
    minHeight: 112,
    alignItems: "flex-start",
  },

  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM.border,
    paddingBottom: 15,
    marginBottom: 10,
  },

  imageBox: {
    width: 92,
    height: 100,
    borderRadius: 14,
    backgroundColor: PREMIUM.imageBg,
    borderWidth: 1,
    borderColor: "#F0E8E2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  productInfo: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 11,
    paddingRight: 4,
  },

  productName: {
    color: PREMIUM.navy,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },

  weight: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 6,
  },

  price: {
    color: PREMIUM.navy,
    fontSize: 14,
    fontWeight: "900",
  },

  mrp: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginLeft: 6,
    textDecorationLine: "line-through",
  },

  quantityContainer: {
    width: 96,
    height: 34,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.primary,
    borderRadius: 10,
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },

  quantityButton: {
    width: 31,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonPlus: {
    width: 32,
    height: 34,
    backgroundColor: PREMIUM.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "900",
  },

  itemTotal: {
    color: PREMIUM.primary,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
    maxWidth: 75,
    textAlign: "right",
  },

  tipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  tipButton: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  tipButtonSelected: {
    borderColor: PREMIUM.primary,
    backgroundColor: PREMIUM.pinkSoft,
  },

  tipText: {
    color: PREMIUM.gray,
    fontSize: 11,
    fontWeight: "700",
  },

  tipTextSelected: {
    color: PREMIUM.primary,
    fontWeight: "900",
  },

  billIcon: {
    marginLeft: "auto",
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13,
  },

  billLabel: {
    color: PREMIUM.gray,
    fontSize: 11,
  },

  billValue: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "700",
  },

  freeValue: {
    color: PREMIUM.primary,
    fontWeight: "900",
  },

  totalDivider: {
    height: 1,
    backgroundColor: PREMIUM.border,
    marginTop: 16,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  totalLabel: {
    color: PREMIUM.navy,
    fontSize: 14,
    fontWeight: "900",
  },

  totalValue: {
    color: PREMIUM.primary,
    fontSize: 19,
    fontWeight: "900",
  },

  savingsCard: {
    backgroundColor: PREMIUM.pinkSoft,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
  },

  savingsText: {
    color: PREMIUM.primaryDark,
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 9,
    flex: 1,
  },

  bottomSpace: {
    height: 20,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  emptyOuter: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: "#FFF1F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyIcon: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: PREMIUM.navy,
    fontSize: 20,
    fontWeight: "900",
  },

  emptySubtitle: {
    color: PREMIUM.gray,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 9,
  },

  shopButton: {
    height: 49,
    backgroundColor: PREMIUM.primary,
    borderRadius: 14,
    paddingHorizontal: 23,
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  shopButtonText: {
    color: PREMIUM.white,
    fontSize: 11,
    fontWeight: "900",
  },

  bottomBar: {
    backgroundColor: PREMIUM.white,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.border,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  bottomAmountBox: {
    flexShrink: 1,
  },

  bottomLabel: {
    color: PREMIUM.muted,
    fontSize: 9,
    fontWeight: "700",
  },

  bottomTotal: {
    color: PREMIUM.navy,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 3,
  },

  checkoutButton: {
    minHeight: 49,
    backgroundColor: PREMIUM.primary,
    borderRadius: 14,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexShrink: 1,
  },

  checkoutText: {
    color: PREMIUM.white,
    fontSize: 10,
    fontWeight: "900",
  },
});
