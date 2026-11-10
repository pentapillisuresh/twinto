
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { getOrder } from "../../services/orderService";
import {
  verifyPayment,
  getPaymentStatus,
} from "../../services/paymentService";

const C = {
  primary: "#C9004F",
  dark: "#A90042",
  navy: "#172033",
  white: "#FFFFFF",
  bg: "#FFF9FB",
  soft: "#FFF0F5",
  light: "#FDE3EC",
  border: "#E9DDE2",
  muted: "#858B95",
  green: "#16844A",
  greenBg: "#EAF8F0",
  orange: "#B96B10",
  orangeBg: "#FFF5E8",
  red: "#C53948",
  redBg: "#FFF0F1",
};

const PENDING_ORDER_KEY = "twinto_cashfree_pending_order_v1";

const STEPS = [
  {
    key: "PLACED",
    title: "Order Placed",
    description: "Your order has been received successfully.",
    icon: "receipt-outline",
  },
  {
    key: "PREPARING",
    title: "Preparing Your Order",
    description: "Your groceries are being prepared for delivery.",
    icon: "basket-outline",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    description: "Your order has been delivered successfully.",
    icon: "checkmark-done-outline",
  },
];

const money = (value) =>
  `₹${(Number(value) || 0).toFixed(2)}`;

const upper = (value) => String(value || "").toUpperCase();

function normalizeOrderStatus(value) {
  const status = upper(value).trim().replace(/[\s-]+/g, "_");
  if (["DELIVERED", "COMPLETED"].includes(status)) return "DELIVERED";
  if (["CANCELLED", "CANCELED"].includes(status)) return "CANCELLED";
  if ([
    "PREPARING", "CONFIRMED", "ACCEPTED", "PACKING", "PACKED",
    "PROCESSING", "BEING_PREPARED", "OUT_FOR_DELIVERY",
    "OUT_FOR_DELIVERY_PARTNER", "SHIPPED", "DISPATCHED", "ON_THE_WAY",
  ].includes(status)) return "PREPARING";
  return "PLACED";
}

function getStepIndex(status) {
  switch (normalizeOrderStatus(status)) {
    case "DELIVERED": return 2;
    case "PREPARING": return 1;
    default: return 0;
  }
}

function orderStatusLabel(status) {
  switch (normalizeOrderStatus(status)) {
    case "DELIVERED": return "Order Delivered";
    case "PREPARING": return "Preparing Your Order";
    case "CANCELLED": return "Order Cancelled";
    default: return "Order Placed";
  }
}

function formatOrderedQuantity(item) {
  const quantity = Number(item?.quantity) || 0;
  const unit = String(
    item?.productUnit || item?.unit || item?.weight || item?.product?.unit || ""
  ).trim();
  if (!unit) return `${quantity} ${quantity === 1 ? "item" : "items"}`;

  const match = unit.match(
    /^(\d+(?:\.\d+)?)\s*(kg|g|gm|ml|l|ltr|litre|liter|pcs|pc|piece|pieces|pack|packs)$/i
  );
  if (!match) return `${quantity} × ${unit}`;

  const amount = Number(match[1]) * quantity;
  const kind = match[2].toLowerCase();
  if (["g", "gm"].includes(kind)) {
    return amount >= 1000 ? `${amount / 1000} kg` : `${amount} g`;
  }
  if (kind === "ml") {
    return amount >= 1000 ? `${amount / 1000} L` : `${amount} ml`;
  }
  if (["l", "ltr", "litre", "liter"].includes(kind)) return `${amount} L`;
  if (["pc", "pcs", "piece", "pieces"].includes(kind)) {
    return `${amount} ${amount === 1 ? "piece" : "pieces"}`;
  }
  if (["pack", "packs"].includes(kind)) {
    return `${amount} ${amount === 1 ? "pack" : "packs"}`;
  }
  return `${amount} kg`;
}

function formatAddress(address) {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (typeof address.address === "string") return address.address;

  return [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

function getImageSource(image) {
  if (!image) return null;
  if (typeof image === "string") return { uri: image };
  return image;
}

function getPaymentState(data) {
  const value = upper(
    data?.paymentStatus ||
      data?.order?.paymentStatus ||
      data?.payment?.status ||
      data?.status
  );

  if (["PAID", "SUCCESS", "SUCCESSFUL"].includes(value)) {
    return "PAID";
  }
  if (["FAILED", "FAILURE"].includes(value)) {
    return "FAILED";
  }
  if (value === "CANCELLED") return "CANCELLED";
  return "PENDING";
}

function InfoRow({ label, value, highlight, last }) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          highlight && styles.highlightText,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={19} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!!subtitle && (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        )}
      </View>
      {action || null}
    </View>
  );
}

export default function OrderTracking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const verifyingRef = useRef(false);
  const mountedRef = useRef(true);
  const orderRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ========================================
  // ORIGINAL ORDER LOADING LOGIC
  // ========================================

  const loadOrder = useCallback(
    async (showLoader = false) => {
      if (!id) return null;

      try {
        if (showLoader && mountedRef.current) {
          setLoading(true);
        }

        const data = await getOrder(id);
        orderRef.current = data;

        if (mountedRef.current) {
          setOrder(data);
          setErrorMessage("");
        }

        return data;
      } catch (error) {
        console.log("[ORDER] Load failed:", error?.message);

        if (mountedRef.current) {
          setErrorMessage(
            error?.message || "Unable to load order details."
          );
        }
        return null;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [id]
  );

  const clearPendingIfPaid = useCallback(
    async (paymentStatus) => {
      if (paymentStatus !== "PAID") return;

      try {
        const saved = await AsyncStorage.getItem(PENDING_ORDER_KEY);

        if (String(saved) === String(id)) {
          await AsyncStorage.removeItem(PENDING_ORDER_KEY);
        }
      } catch (error) {
        console.log(
          "[PAYMENT] Pending cleanup:",
          error?.message
        );
      }
    },
    [id]
  );

  // ========================================
  // ORIGINAL CASHFREE VERIFICATION LOGIC
  // ========================================

  const checkPayment = useCallback(
    async (showAlert = true) => {
      if (
        !id ||
        verifyingRef.current ||
        upper(orderRef.current?.paymentMethod) !== "CASHFREE"
      ) {
        return;
      }

      verifyingRef.current = true;
      if (mountedRef.current) setVerifying(true);

      try {
        const verification = await verifyPayment(id);
        const status = await getPaymentStatus(id);
        const updated = await loadOrder(false);

        const paid =
          getPaymentState(verification) === "PAID" ||
          getPaymentState(status) === "PAID" ||
          getPaymentState(updated) === "PAID";

        if (paid) {
          await clearPendingIfPaid("PAID");

          if (showAlert) {
            Alert.alert(
              "Payment Successful",
              "Your Cashfree payment has been confirmed."
            );
          }
          return;
        }

        const currentStatus =
          getPaymentState(updated) !== "PENDING"
            ? getPaymentState(updated)
            : getPaymentState(status);

        if (showAlert) {
          if (
            currentStatus === "FAILED" ||
            currentStatus === "CANCELLED"
          ) {
            Alert.alert(
              "Payment Not Completed",
              "Your payment has not been confirmed. Please check the order before making another payment."
            );
          } else {
            Alert.alert(
              "Payment Pending",
              "Your payment is still awaiting confirmation. Please check again shortly. Do not create another order."
            );
          }
        }
      } catch (error) {
        console.log(
          "[PAYMENT] Verification failed:",
          error?.message
        );

        await loadOrder(false);

        if (showAlert) {
          Alert.alert(
            "Unable to Verify Payment",
            error?.message ||
              "Please try checking your payment again."
          );
        }
      } finally {
        verifyingRef.current = false;
        if (mountedRef.current) setVerifying(false);
      }
    },
    [id, loadOrder, clearPendingIfPaid]
  );

  useEffect(() => {
    orderRef.current = null;
    setOrder(null);
    loadOrder(true);
  }, [loadOrder]);

  useFocusEffect(
    useCallback(() => {
      loadOrder(false);
    }, [loadOrder])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState !== "active") return;

        const current = orderRef.current;

        if (
          upper(current?.paymentMethod) === "CASHFREE" &&
          getPaymentState(current) !== "PAID"
        ) {
          checkPayment(false);
        } else {
          loadOrder(false);
        }
      }
    );

    return () => subscription.remove();
  }, [checkPayment, loadOrder]);

  useEffect(() => {
    if (
      upper(order?.paymentMethod) === "CASHFREE" &&
      getPaymentState(order) === "PAID"
    ) {
      clearPendingIfPaid("PAID");
    }
  }, [order, clearPendingIfPaid]);

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);

    try {
      if (
        upper(orderRef.current?.paymentMethod) === "CASHFREE" &&
        getPaymentState(orderRef.current) !== "PAID"
      ) {
        await checkPayment(false);
      } else {
        await loadOrder(false);
      }
    } finally {
      if (mountedRef.current) setRefreshing(false);
    }
  };

  // ========================================
  // ORIGINAL ORDER DATA
  // ========================================

  const paymentMethod = upper(order?.paymentMethod);
  const isCashfree = paymentMethod === "CASHFREE";
  const isCOD = paymentMethod === "COD";

  const paymentStatus = getPaymentState({
    paymentStatus: order?.paymentStatus || order?.payment?.status,
  });
  const isPaid = paymentStatus === "PAID";

  const rawStatus = normalizeOrderStatus(
    order?.rawStatus || order?.status || order?.orderStatus || "PLACED"
  );
  const isCancelled = rawStatus === "CANCELLED";
  const isDelivered = rawStatus === "DELIVERED";
  const currentStep = getStepIndex(rawStatus);

  const orderNumber = order?.orderNumber || order?.id || id;
  const items = Array.isArray(order?.items) ? order.items : [];

  const partnerName = order?.deliveryPartner?.name || null;
  const partnerPhone = order?.deliveryPartner?.phone || null;

  const openPhone = async () => {
    if (!partnerPhone) return;

    try {
      const url = `tel:${String(partnerPhone).replace(/[^\d+]/g, "")}`;
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to Call",
        "Phone dialer is not available."
      );
    }
  };

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" && Platform.Version >= 35)
      ? insets.top
      : 0;

  const header = (subtitle = "", showRefresh = true) => (
    <View style={[styles.header, { paddingTop: topInset + 10 }]}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={C.navy} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {subtitle || "Track your order"}
          </Text>
        </View>

        {showRefresh ? (
          <Pressable
            style={styles.headerButton}
            onPress={onRefresh}
            disabled={refreshing || verifying}
            accessibilityLabel="Refresh order status"
          >
            {refreshing ? (
              <ActivityIndicator color={C.primary} size="small" />
            ) : (
              <Ionicons name="refresh" size={20} color={C.primary} />
            )}
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>
    </View>
  );

  // ========================================
  // LOADING
  // ========================================

  if (loading && !order) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={C.white}
        />
        {header("", false)}
        <View style={styles.centered}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator
              size="large"
              color={C.primary}
            />
          </View>
          <Text style={styles.loadingTitle}>
            Preparing your order details
          </Text>
          <Text style={styles.loadingText}>
            Loading your order...
          </Text>
        </View>
      </View>
    );
  }

  // ========================================
  // ORDER NOT FOUND
  // ========================================

  if (!order) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={C.white}
        />
        {header("", false)}
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={45}
              color={C.primary}
            />
          </View>
          <Text style={styles.emptyTitle}>
            Order Unavailable
          </Text>
          <Text style={styles.emptyDescription}>
            {errorMessage || "We couldn't find this order."}
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => loadOrder(true)}
          >
            <Ionicons
              name="refresh"
              size={18}
              color={C.white}
            />
            <Text style={styles.primaryButtonText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ========================================
  // PREMIUM ORDER DETAILS
  // ========================================

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.white}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

      {header(`#${orderNumber}`)}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Math.max(insets.bottom, 16) + 30,
          },
        ]}
      >
        {/* ORDER STATUS HERO */}
        <View style={styles.heroCard}>
          <View
            style={[
              styles.heroIcon,
              isCancelled && styles.heroIconCancelled,
              isDelivered && styles.heroIconDelivered,
            ]}
          >
            <Ionicons
              name={
                isCancelled
                  ? "close-circle-outline"
                  : isDelivered
                  ? "checkmark-done"
                  : "bag-check-outline"
              }
              size={32}
              color={
                isCancelled
                  ? C.red
                  : isDelivered
                  ? C.green
                  : C.primary
              }
            />
          </View>

          <Text style={styles.heroTitle}>
            {isCancelled
              ? "Order Cancelled"
              : isDelivered
              ? "Order Delivered"
              : orderStatusLabel(rawStatus)}
          </Text>

          <Text style={styles.heroDescription}>
            {isCancelled
              ? "This order has been cancelled."
              : isDelivered
              ? "Thank you for shopping with TWINTO."
              : "You can track your order progress below."}
          </Text>

          <View style={styles.orderNumberBadge}>
            <Ionicons
              name="receipt-outline"
              size={14}
              color={C.primary}
            />
            <Text style={styles.orderNumberText}>
              ORDER #{orderNumber}
            </Text>
          </View>

          {!!order.date && (
            <Text style={styles.orderDate}>
              Placed on {order.date}
            </Text>
          )}
        </View>

        {/* CASHFREE PAYMENT */}
        {isCashfree && (
          <View style={styles.section}>
            <SectionHeader
              icon="card-outline"
              title="Cashfree Payment"
              subtitle="Secure online payment status"
            />

            <View
              style={[
                styles.paymentStatusCard,
                isPaid
                  ? styles.paidCard
                  : paymentStatus === "FAILED" ||
                    paymentStatus === "CANCELLED"
                  ? styles.failedCard
                  : styles.pendingCard,
              ]}
            >
              <View style={styles.paymentStatusIcon}>
                <Ionicons
                  name={
                    isPaid
                      ? "checkmark-circle"
                      : paymentStatus === "FAILED" ||
                        paymentStatus === "CANCELLED"
                      ? "close-circle"
                      : "time-outline"
                  }
                  size={27}
                  color={
                    isPaid
                      ? C.green
                      : paymentStatus === "FAILED" ||
                        paymentStatus === "CANCELLED"
                      ? C.red
                      : C.orange
                  }
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.paymentStatusTitle}>
                  {isPaid
                    ? "Payment Successful"
                    : paymentStatus === "FAILED"
                    ? "Payment Failed"
                    : paymentStatus === "CANCELLED"
                    ? "Payment Cancelled"
                    : "Payment Pending"}
                </Text>

                <Text style={styles.paymentStatusText}>
                  {isPaid
                    ? "Your payment has been confirmed by the server."
                    : "Your order is saved. Check the payment status before making another payment."}
                </Text>
              </View>
            </View>

            <InfoRow
              label="Payment Method"
              value="Cashfree"
            />
            <InfoRow
              label="Payment Status"
              value={paymentStatus}
              highlight={isPaid}
            />
            <InfoRow
              label="Order Amount"
              value={money(order.total)}
              highlight
              last
            />

            {!isPaid && (
              <Pressable
                onPress={() => checkPayment(true)}
                disabled={verifying}
                style={[
                  styles.verifyButton,
                  verifying && styles.disabledButton,
                ]}
              >
                {verifying ? (
                  <ActivityIndicator
                    color={C.white}
                    size="small"
                  />
                ) : (
                  <Ionicons
                    name="refresh-outline"
                    size={19}
                    color={C.white}
                  />
                )}
                <Text style={styles.verifyText}>
                  {verifying
                    ? "Checking Payment..."
                    : "Check Payment Status"}
                </Text>
              </Pressable>
            )}

            {!isPaid && (
              <Text style={styles.paymentWarning}>
                Do not place a duplicate order while
                payment confirmation is pending.
              </Text>
            )}
          </View>
        )}

        {/* CASH ON DELIVERY */}
        {isCOD && (
          <View style={styles.section}>
            <SectionHeader
              icon="cash-outline"
              title="Payment Details"
              subtitle="Cash on Delivery"
            />

            <View style={styles.codCard}>
              <View style={styles.codIcon}>
                <Ionicons
                  name="cash-outline"
                  size={26}
                  color={C.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.codTitle}>
                  {isPaid
                    ? "Payment Received"
                    : "Cash on Delivery"}
                </Text>

                <Text style={styles.codDescription}>
                  {isPaid
                    ? "Payment received."
                    : "Pay the delivery partner when your order arrives."}
                </Text>
              </View>
            </View>

            <InfoRow
              label="Payment Method"
              value="Cash on Delivery"
            />
            <InfoRow
              label="Amount"
              value={money(order.total)}
              highlight
            />
            <InfoRow
              label="Payment Status"
              value={upper(order.paymentStatus || "PENDING")}
              last
            />

            {!isPaid && (
              <View style={styles.codNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={C.primary}
                />
                <Text style={styles.codNoteText}>
                  Online payment is not required.
                  Pay when your groceries arrive.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* TRACKING TIMELINE */}
        <View style={styles.section}>
          <SectionHeader
            icon="navigate-outline"
            title="Track Your Order"
            subtitle="Live order progress"
          />

          {isCancelled ? (
            <View style={styles.cancelledNotice}>
              <Ionicons
                name="close-circle-outline"
                size={22}
                color={C.red}
              />
              <Text style={styles.cancelledText}>
                This order has been cancelled.
              </Text>
            </View>
          ) : (
            STEPS.map((step, index) => {
              const completed = index <= currentStep;
              const current = index === currentStep;
              const last = index === STEPS.length - 1;

              return (
                <View
                  key={step.key}
                  style={styles.timelineRow}
                >
                  <View style={styles.timelineIndicator}>
                    <View
                      style={[
                        styles.stepCircle,
                        completed && styles.stepCircleActive,
                        current && styles.stepCircleCurrent,
                      ]}
                    >
                      <Ionicons
                        name={step.icon}
                        size={18}
                        color={
                          completed ? C.white : C.muted
                        }
                      />
                    </View>

                    {!last && (
                      <View
                        style={[
                          styles.stepLine,
                          index < currentStep &&
                            styles.stepLineActive,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.stepTitle,
                        completed && styles.stepTitleActive,
                      ]}
                    >
                      {step.title}
                    </Text>

                    <Text style={styles.stepDescription}>
                      {step.description}
                    </Text>

                    {current && !isDelivered && (
                      <View style={styles.currentBadge}>
                        <View style={styles.currentDot} />
                        <Text style={styles.currentBadgeText}>
                          CURRENT STATUS
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ORDER ITEMS */}
        <View style={styles.section}>
          <SectionHeader
            icon="basket-outline"
            title="Your Items"
            subtitle={`${items.length} products in this order`}
            action={
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {items.length}
                </Text>
              </View>
            }
          />

          {items.length === 0 ? (
            <Text style={styles.emptyItems}>
              No item details available.
            </Text>
          ) : (
            items.map((item, index) => {
              const name =
                item.productName || item.name || "Product";

              const image = getImageSource(
                item.productImage || item.image
              );

              const quantity = Number(item.quantity) || 1;
              const price = Number(item.price) || 0;
              const subtotal =
                Number(item.subtotal) || price * quantity;

              return (
                <View
                  key={`${item.productId || item.id || index}-${index}`}
                  style={[
                    styles.productRow,
                    index !== items.length - 1 &&
                      styles.productBorder,
                  ]}
                >
                  <View style={styles.imageBox}>
                    {image ? (
                      <Image
                        source={image}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons
                        name="image-outline"
                        size={25}
                        color={C.muted}
                      />
                    )}
                  </View>

                  <View style={styles.productInfo}>
                    <Text
                      style={styles.productName}
                      numberOfLines={2}
                    >
                      {name}
                    </Text>

                    <Text style={styles.productWeight}>
                      {item.productUnit || item.unit || item.weight || "Standard"}
                    </Text>

                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>
                        {formatOrderedQuantity(item)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productPriceArea}>
                    <Text style={styles.productPrice}>
                      {money(subtotal)}
                    </Text>

                    {quantity > 1 && (
                      <Text style={styles.eachPrice}>
                        {money(price)} each
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <SectionHeader
            icon="location-outline"
            title="Delivery Address"
            subtitle="Delivery destination"
          />

          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons
                name="home-outline"
                size={22}
                color={C.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.addressTitle}>
                {order.address?.type ||
                  "Delivery Location"}
              </Text>

              <Text style={styles.addressText}>
                {formatAddress(order.address) ||
                  "Address not available"}
              </Text>
            </View>
          </View>
        </View>

        {/* DELIVERY PARTNER */}
        {(partnerName || partnerPhone) && (
          <View style={styles.section}>
            <SectionHeader
              icon="bicycle-outline"
              title="Delivery Partner"
              subtitle="Assigned delivery executive"
            />

            <View style={styles.partnerCard}>
              <View style={styles.partnerAvatar}>
                <Ionicons
                  name="person"
                  size={24}
                  color={C.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.partnerName}>
                  {partnerName || "Delivery Partner"}
                </Text>

                {!!partnerPhone && (
                  <Text style={styles.partnerPhone}>
                    {partnerPhone}
                  </Text>
                )}
              </View>

              {!!partnerPhone && (
                <Pressable
                  onPress={openPhone}
                  style={styles.callButton}
                >
                  <Ionicons
                    name="call"
                    size={19}
                    color={C.white}
                  />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* BILL DETAILS */}
        <View style={styles.section}>
          <SectionHeader
            icon="receipt-outline"
            title="Bill Details"
            subtitle="Complete order breakdown"
          />

          <InfoRow
            label="Item Total"
            value={money(order.itemTotal)}
          />

          <InfoRow
            label="Platform Fee"
            value={money(order.platformFee)}
          />

          <InfoRow
            label="Delivery Partner Fee"
            value={
              Number(order.deliveryFee) === 0
                ? "FREE"
                : money(order.deliveryFee)
            }
          />

          {Number(order.discount) > 0 && (
            <InfoRow
              label="Discount"
              value={`-${money(order.discount)}`}
            />
          )}

          {Number(order.tip) > 0 && (
            <InfoRow
              label="Delivery Tip"
              value={money(order.tip)}
            />
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalLabel}>
                Total Amount
              </Text>

              <Text style={styles.totalSubtitle}>
                Inclusive of applicable charges
              </Text>
            </View>

            <Text style={styles.totalValue}>
              {money(order.total)}
            </Text>
          </View>
        </View>

        {/* SUPPORT */}
        <View style={styles.supportCard}>
          <View style={styles.supportIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={C.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>
              Thank you for shopping with TWINTO
            </Text>

            <Text style={styles.supportText}>
              Your order details and payment status
              are securely maintained by our server.
            </Text>
          </View>
        </View>

        {/* CONTINUE SHOPPING */}
        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <View style={styles.homeButtonIcon}>
            <Ionicons
              name="home-outline"
              size={19}
              color={C.white}
            />
          </View>

          <Text style={styles.homeButtonText}>
            Continue Shopping
          </Text>

          <View style={styles.homeArrow}>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={C.primary}
            />
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: C.navy,
    marginTop: 20,
  },
  loadingText: {
    color: C.muted,
    fontSize: 12,
    marginTop: 8,
  },
  header: {
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "flex-start",
    paddingHorizontal: 13,
  },
  headerTitle: {
    color: C.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 3,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 17,
  },
  heroCard: {
    backgroundColor: C.white,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: C.border,
    padding: 23,
    alignItems: "center",
    marginBottom: 14,
    elevation: 2,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconCancelled: {
    backgroundColor: C.redBg,
  },
  heroIconDelivered: {
    backgroundColor: C.greenBg,
  },
  heroTitle: {
    color: C.navy,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 16,
  },
  heroDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },
  orderNumberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.soft,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 17,
  },
  orderNumberText: {
    color: C.primary,
    fontSize: 10,
    fontWeight: "900",
  },
  orderDate: {
    color: C.muted,
    fontSize: 10,
    marginTop: 12,
  },
  section: {
    backgroundColor: C.white,
    borderRadius: 23,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  sectionTitle: {
    color: C.navy,
    fontSize: 14,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },
  paymentStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 19,
    marginBottom: 12,
    borderWidth: 1,
  },
  pendingCard: {
    backgroundColor: C.orangeBg,
    borderColor: "#F4DDBB",
  },
  paidCard: {
    backgroundColor: C.greenBg,
    borderColor: "#C7EED4",
  },
  failedCard: {
    backgroundColor: C.redBg,
    borderColor: "#F3D0D5",
  },
  paymentStatusIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentStatusTitle: {
    color: C.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  paymentStatusText: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  verifyButton: {
    height: 49,
    backgroundColor: C.primary,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 15,
  },
  verifyText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.65,
  },
  paymentWarning: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 12,
  },
  codCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 19,
    backgroundColor: C.soft,
    borderWidth: 1,
    borderColor: C.light,
    marginBottom: 13,
  },
  codIcon: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  codTitle: {
    color: C.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  codDescription: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  codNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.soft,
    borderRadius: 15,
    padding: 12,
    marginTop: 12,
  },
  codNoteText: {
    flex: 1,
    color: C.primary,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "700",
  },
  infoRow: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5EEF1",
  },
  infoLabel: {
    color: C.muted,
    fontSize: 11,
    flex: 1,
  },
  infoValue: {
    color: C.navy,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },
  highlightText: {
    color: C.primary,
    fontWeight: "900",
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 88,
  },
  timelineIndicator: {
    width: 42,
    alignItems: "center",
  },
  stepCircle: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: "#F2EDF0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: C.primary,
  },
  stepCircleCurrent: {
    borderWidth: 3,
    borderColor: "#FFD3E5",
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#E9DFE3",
    marginVertical: 5,
  },
  stepLineActive: {
    backgroundColor: C.primary,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 13,
    paddingTop: 5,
    paddingBottom: 15,
  },
  stepTitle: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  stepTitleActive: {
    color: C.navy,
    fontWeight: "900",
  },
  stepDescription: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  currentBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 9,
    backgroundColor: C.soft,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
  },
  currentBadgeText: {
    color: C.primary,
    fontSize: 8,
    fontWeight: "900",
  },
  cancelledNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.redBg,
    padding: 14,
    borderRadius: 17,
  },
  cancelledText: {
    color: C.red,
    fontSize: 11,
    fontWeight: "800",
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countText: {
    color: C.white,
    fontSize: 11,
    fontWeight: "900",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
  },
  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2E8ED",
  },
  imageBox: {
    width: 72,
    height: 72,
    borderRadius: 19,
    backgroundColor: "#F8F5F1",
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
    marginLeft: 11,
    marginRight: 7,
  },
  productName: {
    color: C.navy,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 18,
  },
  productWeight: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },
  quantityBadge: {
    alignSelf: "flex-start",
    marginTop: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
    backgroundColor: C.soft,
  },
  quantityText: {
    color: C.primary,
    fontSize: 9,
    fontWeight: "900",
  },
  productPriceArea: {
    alignItems: "flex-end",
  },
  productPrice: {
    color: C.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  eachPrice: {
    color: C.muted,
    fontSize: 9,
    marginTop: 5,
  },
  emptyItems: {
    color: C.muted,
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 20,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: C.bg,
    borderRadius: 19,
    padding: 14,
    borderWidth: 1,
    borderColor: C.light,
  },
  addressIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addressTitle: {
    color: C.navy,
    fontSize: 12,
    fontWeight: "900",
  },
  addressText: {
    color: C.muted,
    fontSize: 10.5,
    lineHeight: 18,
    marginTop: 6,
  },
  partnerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 19,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  partnerAvatar: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  partnerName: {
    color: C.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  partnerPhone: {
    color: C.muted,
    fontSize: 10,
    marginTop: 5,
  },
  callButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: C.soft,
    borderRadius: 17,
    padding: 14,
  },
  totalLabel: {
    color: C.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  totalSubtitle: {
    color: C.muted,
    fontSize: 9,
    marginTop: 5,
  },
  totalValue: {
    color: C.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.soft,
    borderRadius: 21,
    padding: 15,
    marginBottom: 14,
  },
  supportIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  supportTitle: {
    color: C.navy,
    fontSize: 11,
    fontWeight: "900",
  },
  supportText: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  homeButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    marginBottom: 12,
  },
  homeButtonIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
  },
  homeButtonText: {
    flex: 1,
    color: C.white,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  homeArrow: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: C.navy,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 17,
  },
  emptyDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: C.primary,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  primaryButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "900",
  },
});
