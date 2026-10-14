import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Linking,
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

import {
  useLocalSearchParams,
  router,
} from "expo-router";

import { COLORS } from "../../constants";

import { getOrder } from "../../services/orderService";

/* ---------- Timeline steps ---------- */
const steps = [
  {
    id: 1,
    key: "PLACED",
    title: "Order placed",
    description: "We have received your order.",
    icon: "checkmark",
  },
  {
    id: 2,
    key: "PACKING",
    title: "Preparing your order",
    description: "Your groceries are being packed.",
    icon: "cube",
  },
  {
    id: 3,
    key: "OUT_FOR_DELIVERY",
    title: "Out for delivery",
    description: "Your delivery partner is on the way.",
    icon: "bicycle",
  },
  {
    id: 4,
    key: "DELIVERED",
    title: "Delivered",
    description: "Enjoy your fresh groceries.",
    icon: "home",
  },
];

/* Map raw backend status → timeline index (0..3) */
function getStepIndex(rawStatus) {
  switch (rawStatus) {
    case "PLACED":
      return 0;
    case "CONFIRMED":
      return 0;
    case "PACKING":
      return 1;
    case "OUT_FOR_DELIVERY":
      return 2;
    case "DELIVERED":
      return 3;
    case "CANCELLED":
      return 0;
    default:
      return 0;
  }
}

function getImageSource(image) {
  if (!image) return null;
  return { uri: image };
}

function getProductDetails(item) {
  if (!item) return null;
  return {
    ...item,
    id: item.productId ?? item.id,
    name: item.productName || item.name || "Product",
    image: item.productImage || item.image,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    weight: item.weight || "Standard",
  };
}

/* Build a readable address string from backend snapshot */
function formatAddress(addr) {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (addr.address) return addr.address;

  const parts = [
    addr.addressLine1,
    addr.addressLine2,
    addr.landmark,
    addr.city,
    addr.state,
    addr.pincode,
  ].filter(Boolean);

  return parts.join(", ");
}

export default function OrderTracking() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);
      const data = await getOrder(id);
      setOrder(data);
    } catch (error) {
      console.log("Order loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  const orderItems =
    order?.items?.map(getProductDetails).filter(Boolean) || [];

  const orderTotal = Number(order?.total || 0);

  /* Raw enum from backend (orderService keeps it in `rawStatus`) */
  const rawStatus = order?.rawStatus || "PLACED";

  /* Friendly display status */
  const orderStatus = order?.status || "Order Placed";

  const currentStep = getStepIndex(rawStatus);

  const isCancelled = rawStatus === "CANCELLED";
  const isDelivered = rawStatus === "DELIVERED";

  /* Order number for display (fallback to id) */
  const orderNumber = order?.orderNumber || order?.id || id;

  /* Delivery partner – only real values from backend */
  const partnerName = order?.deliveryPartner?.name || null;
  const partnerPhone = order?.deliveryPartner?.phone || null;

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loading}
        edges={["top", "bottom", "left", "right"]}
      >
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
        <Text style={styles.loadingText}>
          Loading your order...
        </Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <Text style={styles.headerSubtitle}>Not found</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>

        <View style={styles.emptyOrder}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={COLORS.primary}
          />
          <Text style={styles.emptyOrderTitle}>
            Order not found
          </Text>
          <Text style={styles.emptyOrderText}>
            This order may have been removed or the link is
            incorrect.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.text}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSubtitle}>
            Order #{orderNumber}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.headerLiveDot} />
          <Text style={styles.headerLiveText}>
            {isDelivered
              ? "DONE"
              : isCancelled
              ? "CLOSED"
              : "LIVE"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 35 + insets.bottom },
        ]}
      >
        {/* SUCCESS / CANCELED HEADER */}
        <View style={styles.success}>
          <View
            style={[
              styles.successOuter,
              isCancelled && {
                backgroundColor: "#FBE9EC",
              },
            ]}
          >
            <View
              style={[
                styles.successIcon,
                isCancelled && {
                  backgroundColor: "#C93652",
                },
              ]}
            >
              <Ionicons
                name={isCancelled ? "close" : "checkmark"}
                size={34}
                color={COLORS.white}
              />
            </View>
          </View>

          <Text style={styles.successTitle}>
            {isCancelled
              ? "Order cancelled"
              : isDelivered
              ? "Order delivered"
              : "Order placed successfully!"}
          </Text>

          <Text style={styles.successOrder}>
            Order #{orderNumber}
          </Text>

          <View style={styles.confirmedBadge}>
            <View
              style={[
                styles.confirmedDot,
                isCancelled && {
                  backgroundColor: "#C93652",
                },
              ]}
            />
            <Text
              style={[
                styles.confirmedText,
                isCancelled && { color: "#C93652" },
              ]}
            >
              {String(orderStatus).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ETA */}
        <View style={styles.etaCard}>
          <View style={styles.etaIcon}>
            <Ionicons
              name={
                isCancelled
                  ? "close-circle"
                  : isDelivered
                  ? "checkmark-circle"
                  : "flash"
              }
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.etaContent}>
            <Text style={styles.etaLabel}>
              {isCancelled
                ? "STATUS"
                : isDelivered
                ? "COMPLETED"
                : "ESTIMATED DELIVERY"}
            </Text>

            <Text style={styles.eta}>
              {isCancelled
                ? "Cancelled"
                : isDelivered
                ? "Delivered"
                : "17–20 mins"}
            </Text>

            <Text style={styles.etaDescription}>
              {isCancelled
                ? "This order was cancelled."
                : isDelivered
                ? "Your order has been delivered."
                : "Your order is on the way."}
            </Text>
          </View>

          {!isDelivered && !isCancelled && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* ORDER STATUS TIMELINE */}
        {!isCancelled && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons
                    name="navigate-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>
                    Order Status
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Follow your order progress
                  </Text>
                </View>
              </View>

              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {currentStep + 1} / 4
                </Text>
              </View>
            </View>

            <View style={styles.timeline}>
              {steps.map((step, index) => {
                const active = index <= currentStep;
                const current = index === currentStep;
                const last = index === steps.length - 1;

                return (
                  <View key={step.id} style={styles.step}>
                    <View style={styles.stepLeft}>
                      <View
                        style={[
                          styles.stepIcon,
                          active && styles.activeStepIcon,
                          current && styles.currentStepIcon,
                        ]}
                      >
                        <Ionicons
                          name={step.icon}
                          size={14}
                          color={
                            active
                              ? COLORS.white
                              : COLORS.muted
                          }
                        />
                      </View>

                      {!last && (
                        <View
                          style={[
                            styles.timelineLine,
                            index < currentStep &&
                              styles.activeTimelineLine,
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.stepContent}>
                      <View style={styles.stepTitleRow}>
                        <Text
                          style={[
                            styles.stepTitle,
                            active && styles.activeStepTitle,
                          ]}
                        >
                          {step.title}
                        </Text>

                        {current && (
                          <View style={styles.currentBadge}>
                            <View style={styles.currentDot} />
                            <Text
                              style={styles.currentBadgeText}
                            >
                              CURRENT
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.stepDescription}>
                        {step.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* YOUR ITEMS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons
                  name="bag-handle-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Your Items</Text>
                <Text style={styles.cardSubtitle}>
                  {orderItems.length}{" "}
                  {orderItems.length === 1
                    ? "product"
                    : "products"}{" "}
                  in this order
                </Text>
              </View>
            </View>

            <View style={styles.itemsCountBadge}>
              <Text style={styles.itemsCountText}>
                {orderItems.length}
              </Text>
            </View>
          </View>

          {orderItems.length === 0 ? (
            <View style={styles.noItems}>
              <Ionicons
                name="bag-outline"
                size={22}
                color={COLORS.muted}
              />
              <Text style={styles.noItemsText}>
                Order details unavailable
              </Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {orderItems.map((item, index) => {
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                const itemTotal = price * quantity;
                const imageSource = getImageSource(item.image);

                return (
                  <View
                    key={`${item.id}-${index}`}
                    style={[
                      styles.productItem,
                      index !== orderItems.length - 1 &&
                        styles.productBorder,
                    ]}
                  >
                    <View style={styles.productImageBox}>
                      {imageSource ? (
                        <Image
                          source={imageSource}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="bag-outline"
                          size={24}
                          color={COLORS.muted}
                        />
                      )}
                    </View>

                    <View style={styles.productDetails}>
                      <Text
                        style={styles.productName}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.productWeight}>
                        {item.weight}
                      </Text>
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>
                          Qty {quantity}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.productPriceArea}>
                      <Text style={styles.productPrice}>
                        ₹{itemTotal.toFixed(0)}
                      </Text>
                      {quantity > 1 && (
                        <Text style={styles.eachPrice}>
                          ₹{price.toFixed(0)} each
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {orderItems.length > 0 && (
            <View style={styles.itemsTotalRow}>
              <Text style={styles.itemsTotalLabel}>
                Items Total
              </Text>
              <Text style={styles.itemsTotal}>
                ₹
                {orderItems
                  .reduce(
                    (sum, item) =>
                      sum +
                      (Number(item.price) || 0) *
                        (Number(item.quantity) || 1),
                    0
                  )
                  .toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* DELIVERY PARTNER */}
        {partnerName || partnerPhone ? (
          <View style={styles.partnerCard}>
            <View style={styles.partnerAvatar}>
              <Ionicons
                name="person"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.partnerInfo}>
              <Text style={styles.partnerLabel}>
                DELIVERY PARTNER
              </Text>
              <Text style={styles.partnerName}>
                {partnerName || "Assigned"}
              </Text>
              <View style={styles.partnerStatusRow}>
                <View style={styles.partnerOnlineDot} />
                <Text
                  style={styles.partnerStatus}
                  numberOfLines={1}
                >
                  {isDelivered
                    ? "Order delivered successfully"
                    : isCancelled
                    ? "Delivery cancelled"
                    : "Your delivery partner is on the way"}
                </Text>
              </View>
            </View>

            {partnerPhone ? (
              <Pressable
                onPress={() =>
                  Linking.openURL(`tel:${partnerPhone}`)
                }
                style={({ pressed }) => [
                  styles.callButton,
                  pressed && styles.callButtonPressed,
                ]}
              >
                <Ionicons
                  name="call"
                  size={18}
                  color={COLORS.white}
                />
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.partnerCard}>
            <View style={styles.partnerAvatar}>
              <Ionicons
                name="person-outline"
                size={21}
                color={COLORS.muted}
              />
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerLabel}>
                DELIVERY PARTNER
              </Text>
              <Text style={styles.partnerName}>
                Not assigned yet
              </Text>
              <View style={styles.partnerStatusRow}>
                <Text style={styles.partnerStatus}>
                  We'll assign a partner once your order is
                  confirmed.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ORDER INFO */}
        <View style={styles.orderInfo}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="receipt-outline"
                size={15}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>ORDER ID</Text>
              <Text style={styles.infoValue}>
                #{orderNumber}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={[styles.infoItem, styles.infoRight]}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="wallet-outline"
                size={15}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>TOTAL</Text>
              <Text style={styles.infoTotal}>
                ₹{orderTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* DELIVERY ADDRESS */}
        {order?.address && (
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons
                name="location-outline"
                size={19}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>
                DELIVERING TO
              </Text>
              <Text style={styles.addressType}>
                {order.address.type || "HOME"}
              </Text>
              <Text
                style={styles.addressText}
                numberOfLines={3}
              >
                {formatAddress(order.address) ||
                  "Delivery address"}
              </Text>
            </View>
          </View>
        )}

        {/* ACTIONS */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.replace("/(tabs)/orders")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryPressed,
            ]}
          >
            <Ionicons
              name="receipt-outline"
              size={18}
              color={COLORS.white}
            />
            <Text style={styles.primaryText}>
              View My Orders
            </Text>
            <Ionicons
              name="arrow-forward"
              size={17}
              color={COLORS.white}
            />
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryPressed,
            ]}
          >
            <Ionicons
              name="bag-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.secondaryText}>
              Continue Shopping
            </Text>
          </Pressable>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={14}
            color={COLORS.muted}
          />
          <Text style={styles.footerText}>
            Your order is securely processed by TWINTO
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* PAGE */
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 11,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  /* HEADER */
  header: {
    height: 66,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#EEDFE5",
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
  backButtonPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
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
  headerRight: {
    minWidth: 42,
    height: 29,
    paddingHorizontal: 7,
    borderRadius: 9,
    backgroundColor: "#FFF0F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 4,
  },
  headerLiveText: {
    color: COLORS.primary,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  /* SCROLL */
  scroll: { paddingHorizontal: 16, paddingTop: 14 },

  /* EMPTY ORDER */
  emptyOrder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyOrderTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyOrderText: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },

  /* SUCCESS */
  success: { alignItems: "center", paddingTop: 7, paddingBottom: 3 },
  successOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 13,
    letterSpacing: -0.4,
  },
  successOrder: {
    color: COLORS.muted,
    fontSize: 10.5,
    marginTop: 4,
  },
  confirmedBadge: {
    marginTop: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#FFF0F6",
    flexDirection: "row",
    alignItems: "center",
  },
  confirmedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 5,
  },
  confirmedText: {
    color: COLORS.primary,
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  /* ETA */
  etaCard: {
    minHeight: 78,
    marginTop: 15,
    padding: 13,
    borderRadius: 19,
    backgroundColor: "#FFF0F6",
    borderWidth: 1,
    borderColor: "#F1D2DE",
    flexDirection: "row",
    alignItems: "center",
  },
  etaIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  etaContent: { flex: 1, marginLeft: 11, marginRight: 7 },
  etaLabel: {
    color: COLORS.primary,
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  eta: { color: COLORS.text, fontSize: 19, fontWeight: "900", marginTop: 1 },
  etaDescription: { color: COLORS.muted, fontSize: 9.5, marginTop: 2 },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 4,
  },
  liveText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  /* CARD */
  card: {
    marginTop: 12,
    padding: 15,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEDFE5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 9,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  cardHeaderLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  cardHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderText: { flex: 1, marginLeft: 10 },
  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  cardSubtitle: { color: COLORS.muted, fontSize: 8.5, marginTop: 3 },
  progressBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#FFF0F6",
  },
  progressText: {
    color: COLORS.primary,
    fontSize: 7.5,
    fontWeight: "900",
  },

  /* TIMELINE */
  timeline: { paddingLeft: 1 },
  step: { flexDirection: "row", minHeight: 68 },
  stepLeft: { width: 34, alignItems: "center" },
  stepIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#F0ECEF",
    borderWidth: 1,
    borderColor: "#E4DDE1",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activeStepIcon: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  currentStepIcon: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E7E1E4",
    marginTop: -1,
  },
  activeTimelineLine: { backgroundColor: COLORS.primary },
  stepContent: { flex: 1, marginLeft: 10, paddingBottom: 8 },
  stepTitleRow: {
    minHeight: 29,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  stepTitle: { color: COLORS.muted, fontSize: 12, fontWeight: "800" },
  activeStepTitle: { color: COLORS.text, fontWeight: "900" },
  currentBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#FFF0F6",
    flexDirection: "row",
    alignItems: "center",
  },
  currentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: 4,
  },
  currentBadgeText: {
    color: COLORS.primary,
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  stepDescription: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 1,
  },

  /* ITEMS */
  itemsCountBadge: {
    minWidth: 29,
    height: 29,
    paddingHorizontal: 7,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  itemsCountText: { color: COLORS.white, fontSize: 9, fontWeight: "900" },
  itemsList: { marginTop: 1 },
  productItem: {
    minHeight: 84,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5EA",
    marginBottom: 4,
    paddingBottom: 12,
  },
  productImageBox: {
    width: 67,
    height: 67,
    borderRadius: 14,
    backgroundColor: "#F8F5F1",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImage: { width: "100%", height: "100%" },
  productDetails: { flex: 1, marginLeft: 10, marginRight: 8 },
  productName: {
    color: COLORS.text,
    fontSize: 11.5,
    fontWeight: "900",
    lineHeight: 16,
  },
  productWeight: { color: COLORS.muted, fontSize: 8.5, marginTop: 3 },
  quantityBadge: {
    alignSelf: "flex-start",
    marginTop: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#FFF0F6",
  },
  quantityText: { color: COLORS.primary, fontSize: 7.5, fontWeight: "900" },
  productPriceArea: { minWidth: 55, alignItems: "flex-end" },
  productPrice: { color: COLORS.text, fontSize: 13, fontWeight: "900" },
  eachPrice: { color: COLORS.muted, fontSize: 7.5, marginTop: 3 },
  itemsTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0E5EA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemsTotalLabel: { color: COLORS.muted, fontSize: 10.5, fontWeight: "700" },
  itemsTotal: { color: COLORS.primary, fontSize: 14, fontWeight: "900" },
  noItems: {
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FAF7F8",
  },
  noItemsText: { color: COLORS.muted, fontSize: 9, marginTop: 5 },

  /* PARTNER */
  partnerCard: {
    minHeight: 73,
    marginTop: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEDFE5",
    flexDirection: "row",
    alignItems: "center",
  },
  partnerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerInfo: { flex: 1, marginLeft: 10, marginRight: 8 },
  partnerLabel: {
    color: COLORS.muted,
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  partnerName: {
    color: COLORS.text,
    fontSize: 13.5,
    fontWeight: "900",
    marginTop: 2,
  },
  partnerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  partnerOnlineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 5,
  },
  partnerStatus: { flex: 1, color: COLORS.muted, fontSize: 8.5 },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 3,
  },
  callButtonPressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },

  /* ORDER INFO */
  orderInfo: {
    minHeight: 73,
    marginTop: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEDFE5",
    flexDirection: "row",
    alignItems: "center",
  },
  infoItem: { flex: 1, flexDirection: "row", alignItems: "center" },
  infoRight: { justifyContent: "flex-end" },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FFF0F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  infoText: { flexShrink: 1 },
  infoDivider: { width: 1, height: 35, backgroundColor: "#EEE6E9" },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 11.5,
    fontWeight: "900",
    marginTop: 3,
  },
  infoTotal: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },

  /* ADDRESS */
  addressCard: {
    minHeight: 75,
    marginTop: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEDFE5",
    flexDirection: "row",
    alignItems: "center",
  },
  addressIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  addressInfo: { flex: 1, marginLeft: 10 },
  addressLabel: {
    color: COLORS.muted,
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  addressType: {
    color: COLORS.text,
    fontSize: 11.5,
    fontWeight: "900",
    marginTop: 2,
  },
  addressText: {
    color: COLORS.muted,
    fontSize: 8.5,
    lineHeight: 13,
    marginTop: 3,
  },

  /* ACTIONS */
  actions: { marginTop: 15 },
  primaryButton: {
    height: 52,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 5,
  },
  primaryPressed: { opacity: 0.87, transform: [{ scale: 0.985 }] },
  primaryText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: "900",
    marginLeft: 9,
  },
  secondaryButton: {
    height: 50,
    marginTop: 9,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryPressed: { opacity: 0.7, backgroundColor: "#FFF0F6" },
  secondaryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 8,
  },

  /* FOOTER */
  footer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: { color: COLORS.muted, fontSize: 8, marginLeft: 5 },
});