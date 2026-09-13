import {
  Image,
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

import { useRouter } from "expo-router";

import { COLORS } from "../../constants";
import { useCart } from "../../context";

function getImageSource(image) {
  if (image === null || image === undefined) {
    return null;
  }

  // Remote image URL
  if (typeof image === "string") {
    if (!image.trim()) {
      return null;
    }

    return {
      uri: image,
    };
  }

  // Local require("../assets/images/...")
  if (typeof image === "number") {
    return image;
  }

  // Already formatted source
  if (typeof image === "object" && image.uri) {
    return image;
  }

  return null;
}

export default function ReviewOrder() {
  const router = useRouter();

  const insets = useSafeAreaInsets();

  const {
    cart = [],
    itemCount = 0,
    itemTotal = 0,
    platformFee = 0,
    deliveryFee = 0,
    tip = 0,
    total = 0,
    clear,
  } = useCart();

  /*
   * Normalize both possible cart structures:
   *
   * New:
   * {
   *   id,
   *   name,
   *   image,
   *   price,
   *   quantity
   * }
   *
   * Old:
   * {
   *   product: {
   *     id,
   *     name,
   *     image,
   *     price
   *   },
   *   quantity
   * }
   */

  const normalizedCart = cart
    .map((item) => {
      if (!item) {
        return null;
      }

      if (item.product) {
        return {
          ...item.product,
          quantity: item.quantity || 1,
        };
      }

      return {
        ...item,
        quantity: item.quantity || 1,
      };
    })
    .filter(
      (item) =>
        item &&
        item.id !== undefined &&
        item.id !== null
    );

  const address = {
    type: "HOME",
    name: "ANIL",
    address:
      "Anantapur Bus Stand Road, Anantapur, Andhra Pradesh",
    phone: "+91 98490 12345",
  };

  const paymentMethod = "UPI";

  function editAddress() {
    router.push("/checkout/address");
  }

  function editPayment() {
    router.push("/checkout/payment");
  }

  async function placeOrder() {
    if (!cart || cart.length === 0) {
      return;
    }

    try {
      // Dummy order creation simulation.
      // Replace this with your API order creation later.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const orderId = "TW100245";

      // Clear cart only after the order is successfully placed.
      clear();

      // Prevent returning to checkout after successful order.
      router.replace(`/order/${orderId}`);
    } catch (error) {
      console.log("Order placement failed:", error);
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.text}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Review Order
          </Text>

          <Text style={styles.headerSubtitle}>
            Check everything before placing your order
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: 145 + insets.bottom,
          },
        ]}
      >
        {/* ORDER STATUS */}

        <View style={styles.progressCard}>
          <View style={styles.progressStep}>
            <View style={styles.progressIconActive}>
              <Ionicons
                name="location"
                size={14}
                color={COLORS.white}
              />
            </View>

            <Text style={styles.progressTextActive}>
              Address
            </Text>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressStep}>
            <View style={styles.progressIconActive}>
              <Ionicons
                name="wallet"
                size={14}
                color={COLORS.white}
              />
            </View>

            <Text style={styles.progressTextActive}>
              Payment
            </Text>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressStep}>
            <View style={styles.progressIconCurrent}>
              <Ionicons
                name="checkmark"
                size={14}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.progressTextCurrent}>
              Review
            </Text>
          </View>
        </View>

        {/* DELIVERY ADDRESS */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.sectionTitleContent}>
                <Text style={styles.sectionTitle}>
                  Delivery Address
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Where your order will be delivered
                </Text>
              </View>
            </View>

            <Pressable
              onPress={editAddress}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
            >
              <Text style={styles.editText}>
                Edit
              </Text>
            </Pressable>
          </View>

          <View style={styles.addressCard}>
            <View style={styles.addressTop}>
              <View style={styles.addressHomeIcon}>
                <Ionicons
                  name="home"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.addressInfo}>
                <View style={styles.addressNameRow}>
                  <Text style={styles.addressType}>
                    {address.type}
                  </Text>

                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>
                      DEFAULT
                    </Text>
                  </View>
                </View>

                <Text style={styles.addressName}>
                  {address.name}
                </Text>
              </View>
            </View>

            <View style={styles.addressTextRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.muted}
              />

              <Text style={styles.addressText}>
                {address.address}
              </Text>
            </View>

            <View style={styles.phoneRow}>
              <Ionicons
                name="call-outline"
                size={14}
                color={COLORS.primary}
              />

              <Text style={styles.phoneText}>
                {address.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* PAYMENT METHOD */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.sectionTitleContent}>
                <Text style={styles.sectionTitle}>
                  Payment Method
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Selected payment option
                </Text>
              </View>
            </View>

            <Pressable
              onPress={editPayment}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
            >
              <Text style={styles.editText}>
                Change
              </Text>
            </Pressable>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.paymentIcon}>
              <Ionicons
                name="phone-portrait-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.paymentInfo}>
              <View style={styles.paymentTitleRow}>
                <Text style={styles.paymentTitle}>
                  {paymentMethod}
                </Text>

                <View style={styles.selectedBadge}>
                  <Ionicons
                    name="checkmark"
                    size={9}
                    color={COLORS.white}
                  />

                  <Text style={styles.selectedBadgeText}>
                    SELECTED
                  </Text>
                </View>
              </View>

              <Text style={styles.paymentSubtitle}>
                UPI payment
              </Text>
            </View>

            <View style={styles.checkCircle}>
              <Ionicons
                name="checkmark"
                size={14}
                color={COLORS.white}
              />
            </View>
          </View>
        </View>

        {/* ITEMS */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="basket-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.sectionTitleContent}>
                <Text style={styles.sectionTitle}>
                  Your Items
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {itemCount}{" "}
                  {itemCount === 1
                    ? "item"
                    : "items"}{" "}
                  in your order
                </Text>
              </View>
            </View>

            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>
                {itemCount}
              </Text>
            </View>
          </View>

          {normalizedCart.map((item, index) => {
            const quantity =
              Number(item.quantity) || 1;

            const itemPrice =
              Number(item.price) || 0;

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
                {/* IMAGE */}

                <View style={styles.imageBox}>
                  {imageSource ? (
                    <Image
                      source={imageSource}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={25}
                        color={COLORS.muted}
                      />
                    </View>
                  )}
                </View>

                {/* DETAILS */}

                <View style={styles.productInfo}>
                  <Text
                    style={styles.productName}
                    numberOfLines={2}
                  >
                    {item.name || "Product"}
                  </Text>

                  <Text style={styles.weight}>
                    {item.weight || "Standard"}
                  </Text>

                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>
                      Qty {quantity}
                    </Text>
                  </View>
                </View>

                {/* PRICE */}

                <View style={styles.productPriceArea}>
                  <Text style={styles.productPrice}>
                    ₹
                    {(
                      itemPrice * quantity
                    ).toFixed(0)}
                  </Text>

                  {quantity > 1 && (
                    <Text style={styles.priceEach}>
                      ₹{itemPrice.toFixed(0)} each
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* DELIVERY INFORMATION */}

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
                Fast Delivery
              </Text>

              <View style={styles.fastBadge}>
                <View style={styles.fastDot} />

                <Text style={styles.fastText}>
                  FAST
                </Text>
              </View>
            </View>

            <Text style={styles.deliveryText}>
              Your groceries will arrive in
              approximately 17 minutes.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.primary}
          />
        </View>

        {/* BILL DETAILS */}

        <View style={styles.section}>
          <View style={styles.billHeader}>
            <View style={styles.sectionTitleArea}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.sectionTitleContent}>
                <Text style={styles.sectionTitle}>
                  Bill Details
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Complete payment breakdown
                </Text>
              </View>
            </View>
          </View>

          {/* ITEM TOTAL */}

          <View style={styles.billRow}>
            <View style={styles.billLabelRow}>
              <View style={styles.billSmallIcon}>
                <Ionicons
                  name="basket-outline"
                  size={12}
                  color={COLORS.muted}
                />
              </View>

              <Text style={styles.billLabel}>
                Item Total
              </Text>
            </View>

            <Text style={styles.billValue}>
              ₹{itemTotal.toFixed(2)}
            </Text>
          </View>

          {/* PLATFORM FEE */}

          <View style={styles.billRow}>
            <View style={styles.billLabelRow}>
              <View style={styles.billSmallIcon}>
                <Ionicons
                  name="grid-outline"
                  size={12}
                  color={COLORS.muted}
                />
              </View>

              <Text style={styles.billLabel}>
                Platform Fee
              </Text>
            </View>

            <Text style={styles.billValue}>
              ₹{platformFee.toFixed(2)}
            </Text>
          </View>

          {/* DELIVERY FEE */}

          <View style={styles.billRow}>
            <View style={styles.billLabelRow}>
              <View style={styles.billSmallIcon}>
                <Ionicons
                  name="bicycle-outline"
                  size={12}
                  color={COLORS.muted}
                />
              </View>

              <Text style={styles.billLabel}>
                Delivery Partner Fee
              </Text>
            </View>

            <Text
              style={[
                styles.billValue,
                deliveryFee === 0 &&
                  styles.freeText,
              ]}
            >
              {deliveryFee === 0
                ? "FREE"
                : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          {/* TIP */}

          {tip > 0 && (
            <View style={styles.billRow}>
              <View style={styles.billLabelRow}>
                <View style={styles.billSmallIcon}>
                  <Ionicons
                    name="heart-outline"
                    size={12}
                    color={COLORS.muted}
                  />
                </View>

                <Text style={styles.billLabel}>
                  Delivery Partner Tip
                </Text>
              </View>

              <Text style={styles.billValue}>
                ₹{tip.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* TOTAL */}

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>
                Total Amount
              </Text>

              <Text style={styles.totalSubtitle}>
                Inclusive of all applicable charges
              </Text>
            </View>

            <Text style={styles.totalValue}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* CONFIRMATION */}

        <View style={styles.confirmCard}>
          <View style={styles.confirmIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.confirmContent}>
            <Text style={styles.confirmTitle}>
              Secure Order
            </Text>

            <Text style={styles.confirmText}>
              By placing this order, you agree to
              our terms and conditions.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* FIXED BOTTOM BAR */}

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(
              insets.bottom + 10,
              18
            ),
          },
        ]}
      >
        <View style={styles.bottomAmount}>
          <Text style={styles.bottomLabel}>
            Total to Pay
          </Text>

          <Text style={styles.bottomTotal}>
            ₹{total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.placeButton,
            pressed && styles.placeButtonPressed,
          ]}
          onPress={placeOrder}
        >
          <Text style={styles.placeButtonText}>
            PLACE ORDER
          </Text>

          <View style={styles.placeIcon}>
            <Ionicons
              name="checkmark"
              size={17}
              color={COLORS.primary}
            />
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* PAGE */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  /* HEADER */

  header: {
    height: 66,

    paddingHorizontal: 16,

    backgroundColor: COLORS.white,

    borderBottomWidth: 1,
    borderBottomColor: "#F0E5EA",

    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: "#FFF0F6",

    alignItems: "center",
    justifyContent: "center",
  },

  backButtonPressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  headerCenter: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.text,

    fontSize: 18,
    fontWeight: "900",

    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: COLORS.muted,

    fontSize: 8.5,
    fontWeight: "600",

    marginTop: 2,
  },

  headerSpacer: {
    width: 42,
  },

  /* ORDER PROGRESS */

  progressCard: {
    minHeight: 58,

    paddingHorizontal: 12,
    paddingVertical: 9,

    borderRadius: 16,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EEDFE5",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginBottom: 12,
  },

  progressStep: {
    alignItems: "center",
    justifyContent: "center",
  },

  progressIconActive: {
    width: 25,
    height: 25,

    borderRadius: 13,

    backgroundColor: COLORS.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  progressIconCurrent: {
    width: 25,
    height: 25,

    borderRadius: 13,

    backgroundColor: "#FFE3EF",

    borderWidth: 1,
    borderColor: COLORS.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  progressTextActive: {
    color: COLORS.primary,

    fontSize: 7.5,
    fontWeight: "800",

    marginTop: 4,
  },

  progressTextCurrent: {
    color: COLORS.text,

    fontSize: 7.5,
    fontWeight: "900",

    marginTop: 4,
  },

  progressLine: {
    flex: 1,

    height: 1,

    backgroundColor: COLORS.primary,

    marginHorizontal: 8,

    marginBottom: 14,
  },

  /* SECTION */

  section: {
    marginBottom: 12,

    padding: 15,

    borderRadius: 19,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EEDFE5",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 9,
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 13,
  },

  sectionTitleArea: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
  },

  sectionIcon: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitleContent: {
    flex: 1,

    marginLeft: 10,
  },

  sectionTitle: {
    color: COLORS.text,

    fontSize: 14,
    fontWeight: "900",

    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    color: COLORS.muted,

    fontSize: 9.5,
    lineHeight: 14,

    marginTop: 3,
  },

  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 7,

    borderRadius: 9,

    backgroundColor: "#FFF0F6",
  },

  editButtonPressed: {
    opacity: 0.7,
  },

  editText: {
    color: COLORS.primary,

    fontSize: 10.5,
    fontWeight: "900",
  },

  /* ADDRESS */

  addressCard: {
    padding: 13,

    borderRadius: 15,

    backgroundColor: "#FFF8FB",

    borderWidth: 1,
    borderColor: "#F2DCE6",
  },

  addressTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressHomeIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: COLORS.white,

    alignItems: "center",
    justifyContent: "center",
  },

  addressInfo: {
    flex: 1,

    marginLeft: 10,
  },

  addressNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressType: {
    color: COLORS.primary,

    fontSize: 10,
    fontWeight: "900",

    letterSpacing: 0.3,
  },

  defaultBadge: {
    marginLeft: 7,

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 7,

    backgroundColor: "#FFE3EF",
  },

  defaultText: {
    color: COLORS.primary,

    fontSize: 6.5,
    fontWeight: "900",

    letterSpacing: 0.3,
  },

  addressName: {
    color: COLORS.text,

    fontSize: 13,
    fontWeight: "800",

    marginTop: 3,
  },

  addressTextRow: {
    flexDirection: "row",
    alignItems: "flex-start",

    marginTop: 13,
  },

  addressText: {
    flex: 1,

    color: COLORS.textSecondary,

    fontSize: 10.5,
    lineHeight: 17,

    marginLeft: 7,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 9,
  },

  phoneText: {
    color: COLORS.muted,

    fontSize: 10,

    marginLeft: 7,
  },

  /* PAYMENT */

  paymentCard: {
    minHeight: 67,

    padding: 11,

    borderRadius: 15,

    backgroundColor: "#FFF0F6",

    borderWidth: 1,
    borderColor: "#F1C9DA",

    flexDirection: "row",
    alignItems: "center",
  },

  paymentIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    backgroundColor: COLORS.white,

    alignItems: "center",
    justifyContent: "center",
  },

  paymentInfo: {
    flex: 1,

    marginLeft: 10,
    marginRight: 8,
  },

  paymentTitleRow: {
    flexDirection: "row",
    alignItems: "center",

    flexWrap: "wrap",
  },

  paymentTitle: {
    color: COLORS.text,

    fontSize: 12.5,
    fontWeight: "900",
  },

  paymentSubtitle: {
    color: COLORS.muted,

    fontSize: 9.5,

    marginTop: 4,
  },

  selectedBadge: {
    marginLeft: 7,

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 7,

    backgroundColor: COLORS.primary,

    flexDirection: "row",
    alignItems: "center",
  },

  selectedBadgeText: {
    color: COLORS.white,

    fontSize: 6.5,
    fontWeight: "900",

    marginLeft: 3,

    letterSpacing: 0.3,
  },

  checkCircle: {
    width: 25,
    height: 25,

    borderRadius: 13,

    backgroundColor: COLORS.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  /* ITEMS */

  itemCountBadge: {
    minWidth: 29,
    height: 29,

    paddingHorizontal: 7,

    borderRadius: 10,

    backgroundColor: COLORS.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  itemCountText: {
    color: COLORS.white,

    fontSize: 10,
    fontWeight: "900",
  },

  productRow: {
    minHeight: 86,

    paddingVertical: 7,

    flexDirection: "row",
    alignItems: "center",
  },

  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5EA",

    marginBottom: 5,
    paddingBottom: 11,
  },

  imageBox: {
    width: 72,
    height: 72,

    borderRadius: 14,

    backgroundColor: "#F8F5F1",

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",
  },

  productImage: {
    width: 62,
    height: 62,
  },

  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  productInfo: {
    flex: 1,

    marginLeft: 11,
    marginRight: 8,
  },

  productName: {
    color: COLORS.text,

    fontSize: 12,
    lineHeight: 17,

    fontWeight: "800",
  },

  weight: {
    color: COLORS.muted,

    fontSize: 9.5,

    marginTop: 4,
  },

  quantityBadge: {
    alignSelf: "flex-start",

    marginTop: 5,

    paddingHorizontal: 7,
    paddingVertical: 3,

    borderRadius: 7,

    backgroundColor: "#FFF0F6",
  },

  quantityText: {
    color: COLORS.primary,

    fontSize: 8,
    fontWeight: "900",
  },

  productPriceArea: {
    alignItems: "flex-end",

    minWidth: 55,
  },

  productPrice: {
    color: COLORS.text,

    fontSize: 13,
    fontWeight: "900",
  },

  priceEach: {
    color: COLORS.muted,

    fontSize: 7.5,

    marginTop: 3,
  },

  /* DELIVERY */

  deliveryCard: {
    minHeight: 70,

    marginBottom: 12,

    padding: 13,

    borderRadius: 17,

    backgroundColor: "#FFF0F6",

    borderWidth: 1,
    borderColor: "#F2D5E1",

    flexDirection: "row",
    alignItems: "center",
  },

  deliveryIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    backgroundColor: COLORS.white,

    alignItems: "center",
    justifyContent: "center",
  },

  deliveryInfo: {
    flex: 1,

    marginLeft: 10,
    marginRight: 8,
  },

  deliveryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  deliveryTitle: {
    color: COLORS.text,

    fontSize: 12,
    fontWeight: "900",
  },

  fastBadge: {
    marginLeft: 7,

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 7,

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

    fontSize: 6.5,
    fontWeight: "900",

    letterSpacing: 0.3,
  },

  deliveryText: {
    color: COLORS.muted,

    fontSize: 9.5,
    lineHeight: 14,

    marginTop: 4,
  },

  /* BILL */

  billHeader: {
    marginBottom: 5,
  },

  billRow: {
    minHeight: 38,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  billLabelRow: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
  },

  billSmallIcon: {
    width: 27,
    height: 27,

    borderRadius: 9,

    backgroundColor: "#F8F5F7",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  billLabel: {
    color: COLORS.muted,

    fontSize: 10.5,
    fontWeight: "600",
  },

  billValue: {
    color: COLORS.text,

    fontSize: 11,
    fontWeight: "800",
  },

  freeText: {
    color: COLORS.primary,

    fontWeight: "900",
  },

  divider: {
    height: 1,

    backgroundColor: "#F0E5EA",

    marginTop: 8,
    marginBottom: 12,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: COLORS.text,

    fontSize: 14,
    fontWeight: "900",
  },

  totalSubtitle: {
    color: COLORS.muted,

    fontSize: 8.5,

    marginTop: 3,
  },

  totalValue: {
    color: COLORS.primary,

    fontSize: 20,
    fontWeight: "900",

    letterSpacing: -0.4,
  },

  /* CONFIRM */

  confirmCard: {
    minHeight: 62,

    padding: 12,

    borderRadius: 16,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EEDFE5",

    flexDirection: "row",
    alignItems: "center",
  },

  confirmIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  confirmContent: {
    flex: 1,

    marginLeft: 9,
  },

  confirmTitle: {
    color: COLORS.text,

    fontSize: 10.5,
    fontWeight: "900",
  },

  confirmText: {
    color: COLORS.muted,

    fontSize: 8.5,
    lineHeight: 13,

    marginTop: 3,
  },

  bottomSpace: {
    height: 10,
  },

  /* FIXED BOTTOM */

  bottomBar: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    minHeight: 76,

    paddingHorizontal: 16,
    paddingTop: 10,

    backgroundColor: COLORS.white,

    borderTopWidth: 1,
    borderTopColor: "#EEDFE5",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 12,
  },

  bottomAmount: {
    flex: 1,

    paddingLeft: 2,
  },

  bottomLabel: {
    color: COLORS.muted,

    fontSize: 9.5,
    fontWeight: "700",
  },

  bottomTotal: {
    color: COLORS.text,

    fontSize: 21,
    fontWeight: "900",

    letterSpacing: -0.5,

    marginTop: 2,
  },

  placeButton: {
    width: 157,
    height: 50,

    paddingLeft: 17,
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
    shadowOpacity: 0.2,
    shadowRadius: 9,

    elevation: 5,
  },

  placeButtonPressed: {
    opacity: 0.88,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  placeButtonText: {
    color: COLORS.white,

    fontSize: 11.5,
    fontWeight: "900",

    letterSpacing: 0.3,
  },

  placeIcon: {
    width: 36,
    height: 36,

    borderRadius: 12,

    backgroundColor: COLORS.white,

    alignItems: "center",
    justifyContent: "center",
  },
});