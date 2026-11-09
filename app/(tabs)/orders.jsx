import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants";
import { getOrders } from "../../services/orderService";

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
};

// Payment and fulfilment are different statuses. Never infer payment
// success from "Delivered", "Preparing", or other delivery statuses.
function paymentState(order) {
  const raw = order.paymentStatus ?? order.payment?.status ?? order.payment_status;
  const status = String(raw ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["paid", "success", "successful", "succeeded", "completed", "captured"].includes(status)) return "paid";
  // Cash on delivery is not the same as a failed online payment.
  const method = String(order.paymentMethod ?? order.payment?.method ?? order.payment_method ?? "").toLowerCase();
  if (["cod", "cash_on_delivery", "cash on delivery"].includes(method)) return "cod";
  return "pending";
}

function getStatusIcon(status) {
  if (status === "Delivered") return "checkmark-circle";
  if (status === "Out for delivery") return "bicycle";
  if (status === "Preparing") return "cube";
  return "time";
}
function getStatusColor(status) {
  if (status === "Delivered" || status === "Out for delivery") return COLORS.primary;
  return COLORS.primaryDark;
}
function getStatusBackground(status) {
  if (status === "Delivered") return "#FFE3EF";
  if (status === "Out for delivery") return "#FFF0F6";
  return "#F8E8EF";
}

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("paid");

  // Original API call, unchanged.
  useEffect(() => { loadOrders(); }, []);
  async function loadOrders() {
    try {
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Orders error:", error);
    } finally {
      setLoading(false);
    }
  }

  const paidOrders = useMemo(() => orders.filter(o => paymentState(o) === "paid"), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => paymentState(o) !== "paid"), [orders]);
  const visibleOrders = tab === "paid" ? paidOrders : pendingOrders;
  const topInset = Platform.OS === "ios" || (Platform.OS === "android" && Platform.Version >= 35) ? insets.top : 0;

  const renderOrder = useCallback(({ item }) => {
    const statusColor = getStatusColor(item.status);
    const statusBackground = getStatusBackground(item.status);
    const payState = paymentState(item);
    const isPaid = payState === "paid";
    const isCod = payState === "cod";
    return (
      <TouchableOpacity activeOpacity={0.9} style={styles.orderCard} onPress={() => router.push(`/order/${item.id}`)}>
        <View style={styles.topRow}>
          <View style={styles.orderHeading}>
            <View style={styles.orderIcon}><Ionicons name="receipt-outline" size={19} color={PREMIUM.primary} /></View>
            <View style={styles.orderHeadingText}>
              <Text style={styles.orderId} numberOfLines={1}>Order #{item.orderNumber || item.id}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
          <View style={[styles.paymentBadge, isPaid ? styles.paidBadge : styles.pendingBadge]}>
            <Ionicons name={isPaid ? "checkmark-circle" : isCod ? "cash-outline" : "time-outline"} size={13} color={isPaid ? "#168052" : "#B16A15"} />
            <Text style={[styles.paymentText, { color: isPaid ? "#168052" : "#B16A15" }]}>{isPaid ? "Paid" : isCod ? "Cash on delivery" : "Payment pending"}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusBackground }]}>
            <Ionicons name={getStatusIcon(item.status)} size={13} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]} numberOfLines={2}>{item.status || "Order placed"}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.itemsRow}>
          <View style={styles.itemsIcon}><Ionicons name="bag-handle-outline" size={21} color={PREMIUM.primary} /></View>
          <View style={styles.itemsInfo}>
            <View style={styles.productsTitleRow}>
              <Text style={styles.itemsTitle}>{item.items?.length || 0} products</Text>
              <View style={styles.itemsCount}><Text style={styles.itemsCountText}>{item.items?.length || 0}</Text></View>
            </View>
            <Text style={styles.itemsSubtitle} numberOfLines={1}>
              {item.items?.map(product => product.productName).join(", ") || "Order details"}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.total}>₹{item.total}</Text>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.deliveryInfo}>
            <Ionicons name="location-outline" size={14} color={PREMIUM.muted} />
            <Text style={styles.deliveryText} numberOfLines={1}>Deliver to {item.address?.type || "Home"}</Text>
          </View>
          <View style={styles.viewOrder}>
            <Text style={styles.viewText}>View Order</Text>
            <View style={styles.arrowBox}><Ionicons name="arrow-forward" size={13} color={PREMIUM.primary} /></View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={PREMIUM.white} translucent={Platform.OS === "android" && Platform.Version >= 35} />
      <View style={[styles.header, { paddingTop: topInset + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={PREMIUM.navy} />
        </Pressable>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>Your grocery order history</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="receipt-outline" size={21} color={PREMIUM.primary} />
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryIcon}><Ionicons name="bag-check-outline" size={21} color={PREMIUM.primary} /></View>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>{loading ? "Loading your orders" : `${orders.length} ${orders.length === 1 ? "order" : "orders"} in your history`}</Text>
          <Text style={styles.summarySubtitle}>Track payments and deliveries</Text>
        </View>
        <Text style={styles.summaryCount}>{loading ? "..." : orders.length}</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab("paid")} style={[styles.tab, tab === "paid" && styles.activeTab]} accessibilityRole="tab" accessibilityState={{ selected: tab === "paid" }}>
          <Ionicons name="checkmark-circle-outline" size={17} color={tab === "paid" ? PREMIUM.primary : PREMIUM.gray} />
          <Text style={[styles.tabText, tab === "paid" && styles.activeTabText]}>Paid Orders</Text>
          <View style={[styles.tabCount, tab === "paid" && styles.activeTabCount]}><Text style={[styles.tabCountText, tab === "paid" && styles.activeTabCountText]}>{paidOrders.length}</Text></View>
        </Pressable>
        <Pressable onPress={() => setTab("pending")} style={[styles.tab, tab === "pending" && styles.activeTab]} accessibilityRole="tab" accessibilityState={{ selected: tab === "pending" }}>
          <Ionicons name="time-outline" size={17} color={tab === "pending" ? PREMIUM.primary : PREMIUM.gray} />
          <Text style={[styles.tabText, tab === "pending" && styles.activeTabText]}>Pending</Text>
          <View style={[styles.tabCount, tab === "pending" && styles.activeTabCount]}><Text style={[styles.tabCountText, tab === "pending" && styles.activeTabCountText]}>{pendingOrders.length}</Text></View>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <View style={styles.loadingIcon}><ActivityIndicator size="small" color={PREMIUM.primary} /></View>
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconOuter}><View style={styles.emptyIcon}><Ionicons name="receipt-outline" size={39} color={PREMIUM.primary} /></View></View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your grocery orders will appear here once you place your first order.</Text>
          <TouchableOpacity activeOpacity={0.88} style={styles.shopButton} onPress={() => router.push("/")}>
            <Ionicons name="bag-outline" size={18} color={COLORS.white} />
            <Text style={styles.shopButtonText}>Start Shopping</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visibleOrders}
          keyExtractor={item => String(item.id)}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: 90 + insets.bottom, flexGrow: 1 }]}
          ListEmptyComponent={
            <View style={styles.tabEmpty}>
              <View style={styles.tabEmptyIcon}><Ionicons name={tab === "paid" ? "checkmark-circle-outline" : "time-outline"} size={30} color={PREMIUM.primary} /></View>
              <Text style={styles.emptyTitle}>{tab === "paid" ? "No paid orders" : "No pending payments"}</Text>
              <Text style={styles.emptyText}>{tab === "paid" ? "Your paid orders will appear here." : "Orders awaiting payment, including cash on delivery, will appear here."}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PREMIUM.background },
  header: { backgroundColor: PREMIUM.white, paddingHorizontal: 15, paddingBottom: 13, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: PREMIUM.border },
  backButton: { width: 43, height: 43, borderRadius: 14, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center" },
  headerTitleBox: { flex: 1, minWidth: 0, paddingHorizontal: 12 },
  headerTitle: { color: PREMIUM.navy, fontSize: 18, fontWeight: "900", letterSpacing: -0.4 },
  headerSubtitle: { color: PREMIUM.muted, fontSize: 10, fontWeight: "600", marginTop: 3 },
  headerRight: { width: 43, height: 43, borderRadius: 14, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center" },
  summary: { marginHorizontal: 14, marginTop: 14, marginBottom: 12, backgroundColor: PREMIUM.white, borderWidth: 1, borderColor: PREMIUM.border, borderRadius: 15, padding: 12, flexDirection: "row", alignItems: "center" },
  summaryIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center" },
  summaryContent: { flex: 1, minWidth: 0, marginLeft: 10 },
  summaryTitle: { color: PREMIUM.navy, fontSize: 12, fontWeight: "800" },
  summarySubtitle: { color: PREMIUM.muted, fontSize: 10, marginTop: 3 },
  summaryCount: { color: PREMIUM.primary, fontSize: 16, fontWeight: "900", marginLeft: 8 },
  tabs: { marginHorizontal: 14, flexDirection: "row", backgroundColor: "#F6EDF1", borderRadius: 14, padding: 4, marginBottom: 5, gap: 5 },
  tab: { flex: 1, minWidth: 0, height: 43, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 11 },
  activeTab: { backgroundColor: PREMIUM.white, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tabText: { color: PREMIUM.gray, fontSize: 11, fontWeight: "700" },
  activeTabText: { color: PREMIUM.primary, fontWeight: "900" },
  tabCount: { minWidth: 19, height: 19, borderRadius: 10, backgroundColor: "#EAE0E5", alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  activeTabCount: { backgroundColor: PREMIUM.pinkSoft },
  tabCountText: { color: PREMIUM.gray, fontSize: 10, fontWeight: "800" },
  activeTabCountText: { color: PREMIUM.primary },
  list: { paddingHorizontal: 14, paddingTop: 12 },
  orderCard: { backgroundColor: PREMIUM.white, borderRadius: 17, padding: 13, marginBottom: 12, borderWidth: 1, borderColor: PREMIUM.border, shadowColor: "#7A2949", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 7, elevation: 1 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderHeading: { flex: 1, flexDirection: "row", alignItems: "center", marginRight: 6, minWidth: 0 },
  orderIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center" },
  orderHeadingText: { flex: 1, marginLeft: 9 },
  orderId: { color: PREMIUM.navy, fontSize: 12, fontWeight: "800" },
  date: { color: PREMIUM.muted, fontSize: 10, marginTop: 4 },
  paymentBadge: { maxWidth: 138, paddingHorizontal: 8, paddingVertical: 7, borderRadius: 9, flexDirection: "row", alignItems: "center", gap: 4 },
  paidBadge: { backgroundColor: "#E9F8EF" },
  pendingBadge: { backgroundColor: "#FFF4E5" },
  paymentText: { fontSize: 9, fontWeight: "800", flexShrink: 1 },
  statusRow: { flexDirection: "row", marginTop: 10 },
  statusBadge: { maxWidth: 150, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 5 },
  statusText: { fontSize: 9, fontWeight: "800", flexShrink: 1 },
  divider: { height: 1, backgroundColor: PREMIUM.border, marginVertical: 12 },
  itemsRow: { flexDirection: "row", alignItems: "center" },
  itemsIcon: { width: 43, height: 43, borderRadius: 13, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center" },
  itemsInfo: { flex: 1, marginLeft: 10, marginRight: 8, minWidth: 0 },
  productsTitleRow: { flexDirection: "row", alignItems: "center" },
  itemsTitle: { color: PREMIUM.navy, fontSize: 12, fontWeight: "800" },
  itemsCount: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 7, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center", marginLeft: 6 },
  itemsCountText: { color: PREMIUM.primary, fontSize: 9, fontWeight: "800" },
  itemsSubtitle: { color: PREMIUM.muted, fontSize: 10, marginTop: 4 },
  priceContainer: { minWidth: 57, alignItems: "flex-end" },
  totalLabel: { color: PREMIUM.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  total: { color: PREMIUM.navy, fontSize: 15, fontWeight: "900", marginTop: 4 },
  bottomRow: { marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: PREMIUM.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  deliveryInfo: { flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 },
  deliveryText: { color: PREMIUM.muted, fontSize: 10, marginLeft: 5, flexShrink: 1 },
  viewOrder: { flexDirection: "row", alignItems: "center" },
  viewText: { color: PREMIUM.primary, fontSize: 10, fontWeight: "800" },
  arrowBox: { width: 26, height: 26, borderRadius: 9, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center", marginLeft: 6 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingIcon: { width: 54, height: 54, borderRadius: 17, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, color: PREMIUM.muted, fontSize: 11, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, paddingBottom: 70 },
  tabEmpty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, paddingVertical: 80 },
  emptyIconOuter: { width: 112, height: 112, borderRadius: 36, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center" },
  emptyIcon: { width: 80, height: 80, borderRadius: 26, backgroundColor: PREMIUM.white, alignItems: "center", justifyContent: "center", shadowColor: PREMIUM.primary, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  tabEmptyIcon: { width: 65, height: 65, borderRadius: 20, backgroundColor: PREMIUM.pinkSoft, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { color: PREMIUM.navy, fontSize: 19, fontWeight: "900", marginTop: 16 },
  emptyText: { maxWidth: 290, color: PREMIUM.muted, fontSize: 12, lineHeight: 19, textAlign: "center", marginTop: 8 },
  shopButton: { minWidth: 190, height: 50, paddingHorizontal: 17, borderRadius: 15, backgroundColor: PREMIUM.primary, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 23 },
  shopButtonText: { color: PREMIUM.white, fontSize: 12, fontWeight: "900", marginHorizontal: 10 },
});
