import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { COLORS } from "../../constants";

import { useCart } from "../../context";

export default function Cart() {
  const router = useRouter();

  const {
    cart = [],
    itemCount = 0,
    itemTotal = 0,
    platformFee = 0,
    deliveryFee = 0,
    freeDelivery = false,
    tip = 0,
    setTip,
    total = 0,
    increase,
    decrease,
    clear,
  } = useCart();

  /*
   * =====================================================
   * NORMALIZE CART
   * =====================================================
   */

  const normalizedCart = cart
    .map((item) => {
      if (!item) {
        return null;
      }

      /*
       * OLD STRUCTURE
       */

      if (item.product) {
        return {
          ...item.product,
          quantity:
            Number(item.quantity) || 1,
        };
      }

      /*
       * NEW STRUCTURE
       */

      return item;
    })
    .filter(
      (item) =>
        item &&
        item.id !== undefined &&
        item.id !== null
    );

  /*
   * =====================================================
   * IMAGE SOURCE
   * =====================================================
   */

  function getImageSource(image) {
    if (!image) {
      return null;
    }

    if (typeof image === "string") {
      return {
        uri: image,
      };
    }

    return image;
  }

  /*
   * =====================================================
   * CHECKOUT
   * =====================================================
   */

  function goToCheckout() {
    if (
      normalizedCart.length === 0
    ) {
      return;
    }

    router.push("/checkout");
  }

  /*
   * =====================================================
   * EMPTY CART
   * =====================================================
   */

  if (
    normalizedCart.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top"]}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View
            style={styles.headerSide}
          />

          <Text
            style={styles.headerTitle}
          >
            My Cart
          </Text>

          <View
            style={styles.headerSide}
          />
        </View>

        {/* EMPTY */}

        <View
          style={styles.emptyContainer}
        >
          <View
            style={styles.emptyIcon}
          >
            <Ionicons
              name="cart-outline"
              size={52}
              color={COLORS.primary}
            />
          </View>

          <Text
            style={styles.emptyTitle}
          >
            Your cart is empty
          </Text>

          <Text
            style={styles.emptySubtitle}
          >
            Add some fresh groceries
            and daily essentials to
            your cart.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() =>
              router.push(
                "/(tabs)"
              )
            }
          >
            <Text
              style={styles.shopButtonText}
            >
              START SHOPPING
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

  /*
   * =====================================================
   * CART
   * =====================================================
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Text
          style={styles.headerTitle}
        >
          My Cart
        </Text>

        <Pressable
          onPress={clear}
          hitSlop={10}
        >
          <Text
            style={styles.clearText}
          >
            Clear
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ITEM COUNT */}

        <View
          style={styles.itemCountRow}
        >
          <View>
            <Text
              style={
                styles.itemCountTitle
              }
            >
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}{" "}
              in your cart
            </Text>

            <Text
              style={
                styles.itemCountSubtitle
              }
            >
              Fresh groceries
              delivered to your
              doorstep
            </Text>
          </View>

          <Ionicons
            name="checkmark-circle"
            size={24}
            color={COLORS.primary}
          />
        </View>

        {/* FREE DELIVERY */}

        {freeDelivery && (
          <View
            style={
              styles.freeDeliveryCard
            }
          >
            <View
              style={styles.freeIcon}
            >
              <Ionicons
                name="bicycle-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View
              style={styles.freeContent}
            >
              <Text
                style={styles.freeTitle}
              >
                FREE DELIVERY
              </Text>

              <Text
                style={
                  styles.freeSubtitle
                }
              >
                ORDER UPTO 3 ITEMS
                FOR FREE DELIVERY
              </Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={21}
              color={COLORS.primary}
            />
          </View>
        )}

        {/* CART ITEMS */}

        <View style={styles.section}>
          {normalizedCart.map(
            (item, index) => {
              const quantity =
                Number(
                  item.quantity
                ) || 1;

              const imageSource =
                getImageSource(
                  item.image
                );

              return (
                <View
                  key={String(
                    item.id
                  )}
                  style={[
                    styles.productRow,
                    index !==
                      normalizedCart.length -
                        1 &&
                      styles.productBorder,
                  ]}
                >
                  {/* IMAGE */}

                  <Pressable
                    style={
                      styles.imageBox
                    }
                    onPress={() =>
                      router.push(
                        `/product/${item.id}`
                      )
                    }
                  >
                    {imageSource ? (
                      <Image
                        source={
                          imageSource
                        }
                        style={
                          styles.productImage
                        }
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons
                        name="image-outline"
                        size={30}
                        color={
                          COLORS.muted
                        }
                      />
                    )}
                  </Pressable>

                  {/* INFO */}

                  <View
                    style={
                      styles.productInfo
                    }
                  >
                    <Text
                      style={
                        styles.productName
                      }
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={
                        styles.weight
                      }
                    >
                      {item.weight}
                    </Text>

                    {/* PRICE */}

                    <View
                      style={
                        styles.priceRow
                      }
                    >
                      <Text
                        style={
                          styles.price
                        }
                      >
                        ₹
                        {Number(
                          item.price || 0
                        ).toFixed(0)}
                      </Text>

                      {item.mrp &&
                        item.mrp >
                          item.price && (
                          <Text
                            style={
                              styles.mrp
                            }
                          >
                            ₹
                            {Number(
                              item.mrp
                            ).toFixed(0)}
                          </Text>
                        )}
                    </View>

                    {/* QUANTITY */}

                    <View
                      style={
                        styles.quantityContainer
                      }
                    >
                      <Pressable
                        style={
                          styles.quantityButton
                        }
                        onPress={() =>
                          decrease(
                            item.id
                          )
                        }
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={
                            COLORS.primary
                          }
                        />
                      </Pressable>

                      <Text
                        style={
                          styles.quantityText
                        }
                      >
                        {quantity}
                      </Text>

                      <Pressable
                        style={
                          styles.quantityButton
                        }
                        onPress={() =>
                          increase(
                            item.id
                          )
                        }
                      >
                        <Ionicons
                          name="add"
                          size={16}
                          color={
                            COLORS.primary
                          }
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* TOTAL */}

                  <Text
                    style={
                      styles.itemTotal
                    }
                  >
                    ₹
                    {Number(
                      item.price || 0
                    ) * quantity}
                  </Text>
                </View>
              );
            }
          )}
        </View>

        {/* TIP */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Add a tip for your
            delivery partner
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            100% of your tip goes to
            the delivery partner.
          </Text>

          <View style={styles.tipRow}>
            {[0, 10, 20, 30].map(
              (amount) => {
                const selected =
                  tip === amount;

                return (
                  <Pressable
                    key={amount}
                    style={[
                      styles.tipButton,
                      selected &&
                        styles.tipButtonSelected,
                    ]}
                    onPress={() =>
                      setTip(amount)
                    }
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
              }
            )}
          </View>
        </View>

        {/* BILL */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Bill Details
          </Text>

          <View style={styles.billRow}>
            <Text
              style={styles.billLabel}
            >
              Item Total
            </Text>

            <Text
              style={styles.billValue}
            >
              ₹{itemTotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text
              style={styles.billLabel}
            >
              Platform Fee
            </Text>

            <Text
              style={styles.billValue}
            >
              ₹{platformFee.toFixed(2)}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text
              style={styles.billLabel}
            >
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
                : `₹${deliveryFee.toFixed(
                    2
                  )}`}
            </Text>
          </View>

          {tip > 0 && (
            <View
              style={styles.billRow}
            >
              <Text
                style={styles.billLabel}
              >
                Delivery Partner Tip
              </Text>

              <Text
                style={styles.billValue}
              >
                ₹{tip.toFixed(2)}
              </Text>
            </View>
          )}

          <View
            style={styles.totalDivider}
          />

          <View
            style={styles.totalRow}
          >
            <Text
              style={styles.totalLabel}
            >
              Total
            </Text>

            <Text
              style={styles.totalValue}
            >
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
          <View
            style={styles.savingsCard}
          >
            <Ionicons
              name="pricetag-outline"
              size={19}
              color={COLORS.primary}
            />

            <Text
              style={styles.savingsText}
            >
              You are getting great
              prices on your groceries!
            </Text>
          </View>
        )}

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>

      {/* CHECKOUT BAR */}

      <View
        style={styles.bottomBar}
      >
        <View>
          <Text
            style={styles.bottomLabel}
          >
            Total
          </Text>

          <Text
            style={styles.bottomTotal}
          >
            ₹{total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          style={
            styles.checkoutButton
          }
          onPress={goToCheckout}
        >
          <Text
            style={styles.checkoutText}
          >
            PROCEED TO CHECKOUT
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
  danger: "#C9004F",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  header: {
    height: 64,
    backgroundColor: PREMIUM.white,
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM.border,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerSide: {
    width: 45,
  },

  headerTitle: {
    color: PREMIUM.navy,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  clearText: {
    color: PREMIUM.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  content: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 120,
  },

  itemCountRow: {
    backgroundColor: PREMIUM.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0E6EA",
  },

  itemCountTitle: {
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "900",
  },

  itemCountSubtitle: {
    color: PREMIUM.muted,
    fontSize: 11,
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
    borderRadius: 21,
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
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  freeSubtitle: {
    color: PREMIUM.navy,
    fontSize: 10,
    marginTop: 3,
    fontWeight: "700",
  },

  section: {
    backgroundColor: PREMIUM.white,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0E6EA",
  },

  productRow: {
    flexDirection: "row",
    paddingVertical: 4,
    minHeight: 125,
  },

  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM.border,
    paddingBottom: 14,
    marginBottom: 10,
  },

  imageBox: {
    width: 94,
    height: 105,
    borderRadius: 15,
    backgroundColor: PREMIUM.imageBg,
    borderWidth: 1,
    borderColor: "#F0E8E2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImage: {
    width: 84,
    height: 84,
  },

  productInfo: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 5,
  },

  productName: {
    color: PREMIUM.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },

  weight: {
    color: PREMIUM.muted,
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  price: {
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "900",
  },

  mrp: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginLeft: 6,
    textDecorationLine: "line-through",
  },

  quantityContainer: {
    width: 94,
    height: 34,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.primary,
    borderRadius: 10,
    marginTop: 8,
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

  quantityText: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "900",
  },

  itemTotal: {
    color: PREMIUM.primary,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.1,
  },

  sectionSubtitle: {
    color: PREMIUM.muted,
    fontSize: 11,
    marginTop: 4,
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

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13,
  },

  billLabel: {
    color: PREMIUM.gray,
    fontSize: 12,
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
    marginTop: 15,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  totalLabel: {
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "900",
  },

  totalValue: {
    color: PREMIUM.primary,
    fontSize: 20,
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
    marginLeft: 8,
    flex: 1,
  },

  bottomSpace: {
    height: 20,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  emptyTitle: {
    color: PREMIUM.navy,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  emptySubtitle: {
    color: PREMIUM.gray,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  shopButton: {
    height: 51,
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
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PREMIUM.white,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.border,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bottomLabel: {
    color: PREMIUM.muted,
    fontSize: 10,
    fontWeight: "600",
  },

  bottomTotal: {
    color: PREMIUM.navy,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },

  checkoutButton: {
    height: 51,
    backgroundColor: PREMIUM.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  checkoutText: {
    color: PREMIUM.white,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.1,
  },
});