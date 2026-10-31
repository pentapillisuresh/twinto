
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { COLORS } from "../../constants";
import { getOrder } from "../../services/orderService";

import {
  verifyPayment,
  getPaymentStatus,
} from "../../services/paymentService";

const PENDING_ORDER_KEY =
  "twinto_cashfree_pending_order_v1";

const STEPS = [
  {
    key: "PLACED",
    title: "Order Placed",
    description: "We have received your order",
    icon: "checkmark",
  },
  {
    key: "PACKING",
    title: "Preparing Your Order",
    description: "Your groceries are being packed",
    icon: "cube-outline",
  },
  {
    key: "OUT_FOR_DELIVERY",
    title: "Out for Delivery",
    description: "Your delivery partner is on the way",
    icon: "bicycle-outline",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    description: "Enjoy your fresh groceries",
    icon: "home-outline",
  },
];

const money = (value) =>
  `₹${(Number(value) || 0).toFixed(2)}`;

const upper = (value) =>
  String(value || "").toUpperCase();

function getStepIndex(status) {
  switch (upper(status)) {
    case "DELIVERED":
      return 3;
    case "OUT_FOR_DELIVERY":
      return 2;
    case "PACKING":
      return 1;
    case "CONFIRMED":
    case "PLACED":
    default:
      return 0;
  }
}

function formatAddress(address) {
  if (!address) return "";

  if (typeof address === "string") {
    return address;
  }

  if (typeof address.address === "string") {
    return address.address;
  }

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

  if (typeof image === "string") {
    return { uri: image };
  }

  return image;
}

function getPaymentState(data) {
  const value = upper(
    data?.paymentStatus ||
      data?.order?.paymentStatus ||
      data?.status
  );

  if (
    value === "PAID" ||
    value === "SUCCESS" ||
    value === "SUCCESSFUL"
  ) {
    return "PAID";
  }

  if (
    value === "FAILED" ||
    value === "FAILURE"
  ) {
    return "FAILED";
  }

  if (value === "CANCELLED") {
    return "CANCELLED";
  }

  return "PENDING";
}

function InfoRow({ label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

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

function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={COLORS.primary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {!!subtitle && (
          <Text style={styles.sectionSubtitle}>
            {subtitle}
          </Text>
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

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [verifying, setVerifying] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const verifyingRef = useRef(false);
  const mountedRef = useRef(true);
  const orderRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

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
        console.log(
          "[ORDER] Load failed:",
          error?.message
        );

        if (mountedRef.current) {
          setErrorMessage(
            error?.message ||
              "Unable to load order details."
          );
        }

        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  const clearPendingIfPaid = useCallback(
    async (paymentStatus) => {
      if (paymentStatus !== "PAID") {
        return;
      }

      try {
        const saved =
          await AsyncStorage.getItem(
            PENDING_ORDER_KEY
          );

        if (String(saved) === String(id)) {
          await AsyncStorage.removeItem(
            PENDING_ORDER_KEY
          );
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

  const checkPayment = useCallback(
    async (showAlert = true) => {
      if (
        !id ||
        verifyingRef.current ||
        upper(orderRef.current?.paymentMethod) !==
          "CASHFREE"
      ) {
        return;
      }

      verifyingRef.current = true;

      if (mountedRef.current) {
        setVerifying(true);
      }

      try {
        // Request server-side Cashfree verification.
        const verification =
          await verifyPayment(id);

        // Read current payment status from backend.
        const status =
          await getPaymentStatus(id);

        // Refresh the order shown in the app.
        const updated = await loadOrder(false);

        const paid =
          getPaymentState(verification) ===
            "PAID" ||
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

        if (mountedRef.current) {
          setVerifying(false);
        }
      }
    },
    [id, loadOrder, clearPendingIfPaid]
  );

  // Load order when opening this screen.
  useEffect(() => {
    orderRef.current = null;
    setOrder(null);
    loadOrder(true);
  }, [loadOrder]);

  // Refresh whenever this screen receives focus.
  useFocusEffect(
    useCallback(() => {
      loadOrder(false);
    }, [loadOrder])
  );

  // When the customer returns from Cashfree browser.
  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        "change",
        (nextState) => {
          if (nextState !== "active") {
            return;
          }

          const current = orderRef.current;

          if (
            upper(current?.paymentMethod) ===
              "CASHFREE" &&
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

  // Clear stale pending marker once a paid order loads.
  useEffect(() => {
    if (
      upper(order?.paymentMethod) ===
        "CASHFREE" &&
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
        upper(orderRef.current?.paymentMethod) ===
          "CASHFREE" &&
        getPaymentState(orderRef.current) !==
          "PAID"
      ) {
        await checkPayment(false);
      } else {
        await loadOrder(false);
      }
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  };

  const paymentMethod = upper(
    order?.paymentMethod
  );

  const isCashfree =
    paymentMethod === "CASHFREE";

  const isCOD =
    paymentMethod === "COD";

  const paymentStatus =
    getPaymentState(order);

  const isPaid =
    paymentStatus === "PAID";

  const rawStatus = upper(
    order?.rawStatus || "PLACED"
  );

  const isCancelled =
    rawStatus === "CANCELLED";

  const isDelivered =
    rawStatus === "DELIVERED";

  const currentStep =
    getStepIndex(rawStatus);

  const orderNumber =
    order?.orderNumber ||
    order?.id ||
    id;

  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  const partnerName =
    order?.deliveryPartner?.name || null;

  const partnerPhone =
    order?.deliveryPartner?.phone || null;

  const openPhone = async () => {
    if (!partnerPhone) return;

    try {
      const url = `tel:${String(
        partnerPhone
      ).replace(/[^\d+]/g, "")}`;

      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to Call",
        "Phone dialer is not available."
      );
    }
  };

  if (loading && !order) {
    return (
      <SafeAreaView
        style={styles.centered}
        edges={["top", "bottom"]}
      >
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading your order...
        </Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top"]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Order Details
            </Text>
          </View>

          <View style={{ width: 42 }} />
        </View>

        <View style={styles.centered}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.primary}
          />

          <Text style={styles.emptyTitle}>
            Order Unavailable
          </Text>

          <Text style={styles.emptyDescription}>
            {errorMessage ||
              "We couldn't find this order."}
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => loadOrder(true)}
          >
            <Text style={styles.primaryButtonText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.text}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Order Details
          </Text>

          <Text style={styles.headerSubtitle}>
            #{orderNumber}
          </Text>
        </View>

        <Pressable
          style={styles.refreshIcon}
          onPress={onRefresh}
          disabled={refreshing || verifying}
        >
          {refreshing ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
            />
          ) : (
            <Ionicons
              name="refresh"
              size={19}
              color={COLORS.primary}
            />
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
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
        {/* ORDER STATUS */}
        <View style={styles.heroCard}>
          <View
            style={[
              styles.heroIcon,
              isCancelled &&
                styles.heroIconCancelled,
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
              size={30}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.heroTitle}>
            {isCancelled
              ? "Order Cancelled"
              : isDelivered
                ? "Order Delivered"
                : order.status ||
                  "Order Placed"}
          </Text>

          <Text style={styles.heroDescription}>
            {isCancelled
              ? "This order has been cancelled."
              : isDelivered
                ? "Thank you for shopping with TWINTO."
                : "You can track your order progress below."}
          </Text>

          <View style={styles.orderNumberBadge}>
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

        {/* CASHFREE PAYMENT STATUS */}
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
                  : styles.pendingCard,
              ]}
            >
              <View
                style={[
                  styles.paymentStatusIcon,
                  isPaid &&
                    styles.paidIcon,
                ]}
              >
                <Ionicons
                  name={
                    isPaid
                      ? "checkmark-circle"
                      : paymentStatus === "FAILED"
                        ? "close-circle"
                        : "time-outline"
                  }
                  size={25}
                  color={
                    isPaid
                      ? "#16844A"
                      : COLORS.primary
                  }
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={styles.paymentStatusTitle}
                >
                  {isPaid
                    ? "Payment Successful"
                    : paymentStatus === "FAILED"
                      ? "Payment Failed"
                      : paymentStatus === "CANCELLED"
                        ? "Payment Cancelled"
                        : "Payment Pending"}
                </Text>

                <Text
                  style={styles.paymentStatusText}
                >
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
            />

            {!isPaid && (
              <Pressable
                onPress={() => checkPayment(true)}
                disabled={verifying}
                style={[
                  styles.verifyButton,
                  verifying &&
                    styles.disabledButton,
                ]}
              >
                {verifying ? (
                  <ActivityIndicator
                    color={COLORS.white}
                    size="small"
                  />
                ) : (
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={COLORS.white}
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

        {/* COD PAYMENT STATUS */}
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
                  size={23}
                  color={COLORS.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.codTitle}>
                  Cash on Delivery
                </Text>

                <Text style={styles.codDescription}>
                  {isPaid
                    ? "Payment received."
                    : "Pay the delivery partner when your order arrives."}
                </Text>
              </View>
            </View>

            <InfoRow
              label="Amount"
              value={money(order.total)}
              highlight
            />

            <InfoRow
              label="Payment Status"
              value={upper(
                order.paymentStatus ||
                  "PENDING"
              )}
            />
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
                size={20}
                color={COLORS.primary}
              />

              <Text style={styles.cancelledText}>
                This order has been cancelled.
              </Text>
            </View>
          ) : (
            STEPS.map((step, index) => {
              const completed =
                index <= currentStep;

              const current =
                index === currentStep;

              const last =
                index === STEPS.length - 1;

              return (
                <View
                  key={step.key}
                  style={styles.timelineRow}
                >
                  <View
                    style={styles.timelineIndicator}
                  >
                    <View
                      style={[
                        styles.stepCircle,
                        completed &&
                          styles.stepCircleActive,
                        current &&
                          styles.stepCircleCurrent,
                      ]}
                    >
                      <Ionicons
                        name={step.icon}
                        size={17}
                        color={
                          completed
                            ? COLORS.white
                            : COLORS.muted
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

                  <View
                    style={styles.timelineContent}
                  >
                    <Text
                      style={[
                        styles.stepTitle,
                        completed &&
                          styles.stepTitleActive,
                      ]}
                    >
                      {step.title}
                    </Text>

                    <Text
                      style={styles.stepDescription}
                    >
                      {step.description}
                    </Text>

                    {current && !isDelivered && (
                      <View
                        style={styles.currentBadge}
                      >
                        <Text
                          style={styles.currentBadgeText}
                        >
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
                item.productName ||
                item.name ||
                "Product";

              const image =
                getImageSource(
                  item.productImage ||
                    item.image
                );

              const quantity =
                Number(item.quantity) || 1;

              const price =
                Number(item.price) || 0;

              const subtotal =
                Number(item.subtotal) ||
                price * quantity;

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
                        color={COLORS.muted}
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
                      {item.weight ||
                        "Standard"}
                    </Text>

                    <View
                      style={styles.quantityBadge}
                    >
                      <Text
                        style={styles.quantityText}
                      >
                        Qty {quantity}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productPriceArea}>
                    <Text
                      style={styles.productPrice}
                    >
                      {money(subtotal)}
                    </Text>

                    {quantity > 1 && (
                      <Text
                        style={styles.eachPrice}
                      >
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
                color={COLORS.primary}
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
                  size={23}
                  color={COLORS.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.partnerName}>
                  {partnerName ||
                    "Delivery Partner"}
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
                    color={COLORS.white}
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
              value={`-${money(
                order.discount
              )}`}
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
            <View>
              <Text style={styles.totalLabel}>
                Total Amount
              </Text>

              <Text
                style={styles.totalSubtitle}
              >
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
          <Ionicons
            name="shield-checkmark-outline"
            size={23}
            color={COLORS.primary}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>
              Thank you for shopping with TWINTO
            </Text>

            <Text style={styles.supportText}>
              Your order details and payment
              status are securely maintained by
              our server.
            </Text>
          </View>
        </View>

        {/* BACK TO HOME */}
        <Pressable
          style={styles.homeButton}
          onPress={() =>
            router.replace("/(tabs)")
          }
        >
          <Ionicons
            name="home-outline"
            size={19}
            color={COLORS.white}
          />

          <Text style={styles.homeButtonText}>
            Continue Shopping
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: 24,
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 15,
    fontWeight: "700",
  },

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

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 3,
  },

  refreshIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF0F6",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 21,
    padding: 22,
    borderWidth: 1,
    borderColor: "#F1DDE6",
    alignItems: "center",
    marginBottom: 13,
  },

  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 23,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },

  heroIconCancelled: {
    backgroundColor: "#FFF0F0",
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
  },

  heroDescription: {
    color: COLORS.muted,
    fontSize: 10.5,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },

  orderNumberBadge: {
    backgroundColor: "#FFF0F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 15,
  },

  orderNumberText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },

  orderDate: {
    color: COLORS.muted,
    fontSize: 9.5,
    marginTop: 10,
  },

  section: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEDFE5",
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 9.5,
    marginTop: 3,
  },

  paymentStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
  },

  pendingCard: {
    backgroundColor: "#FFF0F6",
    borderColor: "#F2D5E1",
  },

  paidCard: {
    backgroundColor: "#F0FFF5",
    borderColor: "#C7EED4",
  },

  paymentStatusIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  paidIcon: {
    backgroundColor: "#E1F8E9",
  },

  paymentStatusTitle: {
    color: COLORS.text,
    fontSize: 12.5,
    fontWeight: "900",
  },

  paymentStatusText: {
    color: COLORS.muted,
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 5,
  },

  verifyButton: {
    height: 46,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },

  verifyText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.65,
  },

  paymentWarning: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 10,
  },

  codCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#FFF0F6",
    marginBottom: 12,
  },

  codIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  codTitle: {
    color: COLORS.text,
    fontSize: 12.5,
    fontWeight: "900",
  },

  codDescription: {
    color: COLORS.muted,
    fontSize: 9.5,
    marginTop: 5,
    lineHeight: 15,
  },

  infoRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  infoLabel: {
    color: COLORS.muted,
    fontSize: 10.5,
  },

  infoValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },

  highlightText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  timelineRow: {
    flexDirection: "row",
    minHeight: 83,
  },

  timelineIndicator: {
    width: 40,
    alignItems: "center",
  },

  stepCircle: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: "#F3EDF0",
    alignItems: "center",
    justifyContent: "center",
  },

  stepCircleActive: {
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 4,
  },

  stepTitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },

  stepTitleActive: {
    color: COLORS.text,
    fontWeight: "900",
  },

  stepDescription: {
    color: COLORS.muted,
    fontSize: 9.5,
    marginTop: 5,
  },

  currentBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#FFF0F6",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  currentBadgeText: {
    color: COLORS.primary,
    fontSize: 7.5,
    fontWeight: "900",
  },

  cancelledNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FFF0F6",
    padding: 13,
    borderRadius: 13,
  },

  cancelledText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
  },

  countBadge: {
    minWidth: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },

  countText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5EA",
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
    width: "100%",
    height: "100%",
  },

  productInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  productName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },

  productWeight: {
    color: COLORS.muted,
    fontSize: 9.5,
    marginTop: 4,
  },

  quantityBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
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
  },

  productPrice: {
    color: COLORS.text,
    fontSize: 12.5,
    fontWeight: "900",
  },

  eachPrice: {
    color: COLORS.muted,
    fontSize: 8,
    marginTop: 4,
  },

  emptyItems: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 18,
  },

  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8FB",
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: "#F2DCE6",
  },

  addressIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  addressTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  addressText: {
    color: COLORS.muted,
    fontSize: 10.5,
    lineHeight: 17,
    marginTop: 6,
  },

  partnerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#FFF8FB",
  },

  partnerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  partnerName: {
    color: COLORS.text,
    fontSize: 12.5,
    fontWeight: "900",
  },

  partnerPhone: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },

  callButton: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0E5EA",
    marginVertical: 12,
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
    marginTop: 4,
  },

  totalValue: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },

  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#FFF0F6",
    borderRadius: 16,
    padding: 14,
    marginBottom: 13,
  },

  supportTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
  },

  supportText: {
    color: COLORS.muted,
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 5,
  },

  homeButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 12,
  },

  homeButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 13,
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 23,
    paddingVertical: 13,
    borderRadius: 13,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },
});
