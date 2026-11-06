
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
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
  gold: "#FFE19A",
};

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ORIGINAL API LOGIC
  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.log("Orders error:", error);
    } finally {
      setLoading(false);
    }
  }

  // ORIGINAL STATUS LOGIC
  function getStatusIcon(status) {
    if (status === "Delivered") {
      return "checkmark-circle";
    }

    if (status === "Out for delivery") {
      return "bicycle";
    }

    if (status === "Preparing") {
      return "cube";
    }

    return "time";
  }

  function getStatusColor(status) {
    if (status === "Delivered") {
      return COLORS.primary;
    }

    if (status === "Out for delivery") {
      return COLORS.primary;
    }

    return COLORS.primaryDark;
  }

  function getStatusBackground(status) {
    if (status === "Delivered") {
      return "#FFE3EF";
    }

    if (status === "Out for delivery") {
      return "#FFF0F6";
    }

    return "#F8E8EF";
  }

  // SAME TOP INSET HANDLING AS CART
  const topInset =
    Platform.OS === "ios"
      ? insets.top
      : Platform.Version >= 35
      ? insets.top
      : 0;

  // FIXED PREMIUM HEADER
  function renderHeader() {
    return (
      <View
        style={[
          styles.headerBackground,
          { paddingTop: topInset + 18 },
        ]}
      >
        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />

        <View style={styles.headerRow}>
          <View style={styles.headerSide} />

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>
              My Orders
            </Text>

            <Text style={styles.headerSubtitle}>
              Your grocery order history
            </Text>
          </View>

          <View style={styles.headerSide} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerInfoIcon}>
            <Ionicons
              name="receipt-outline"
              size={20}
              color={PREMIUM.gold}
            />
          </View>

          <View style={styles.headerInfoContent}>
            <Text style={styles.headerInfoTitle}>
              {loading
                ? "Loading your orders"
                : orders.length === 0
                ? "Your orders will appear here"
                : `${orders.length} ${
                    orders.length === 1
                      ? "order"
                      : "orders"
                  } in your history`}
            </Text>

            <Text style={styles.headerInfoSubtitle}>
              Track and review your purchases
            </Text>
          </View>

          <View style={styles.headerInfoBadge}>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={PREMIUM.white}
              />
            ) : (
              <Text style={styles.headerCount}>
                {orders.length}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ORIGINAL ORDER CARD LOGIC WITH PREMIUM UI
  function renderOrder({ item }) {
    const statusColor = getStatusColor(item.status);
    const statusBackground =
      getStatusBackground(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.orderCard}
        onPress={() =>
          router.push(`/order/${item.id}`)
        }
      >
        {/* ORDER TOP ROW */}
        <View style={styles.topRow}>
          <View style={styles.orderHeading}>
            <View style={styles.orderIcon}>
              <Ionicons
                name="receipt-outline"
                size={18}
                color={PREMIUM.primary}
              />
            </View>

            <View style={styles.orderHeadingText}>
              <Text
                style={styles.orderId}
                numberOfLines={1}
              >
                Order #{item.orderNumber || item.id}
              </Text>

              <Text style={styles.date}>
                {item.date}
              </Text>
            </View>
          </View>

          {/* STATUS */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusBackground },
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status)}
              size={13}
              color={statusColor}
            />

            <Text
              style={[
                styles.statusText,
                { color: statusColor },
              ]}
              numberOfLines={2}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ORDER PRODUCTS */}
        <View style={styles.itemsRow}>
          <View style={styles.itemsIcon}>
            <Ionicons
              name="bag-handle-outline"
              size={21}
              color={PREMIUM.primary}
            />
          </View>

          <View style={styles.itemsInfo}>
            <View style={styles.productsTitleRow}>
              <Text style={styles.itemsTitle}>
                {item.items?.length || 0} products
              </Text>

              <View style={styles.itemsCount}>
                <Text style={styles.itemsCountText}>
                  {item.items?.length || 0}
                </Text>
              </View>
            </View>

            <Text
              style={styles.itemsSubtitle}
              numberOfLines={1}
            >
              {item.items
                ?.map((product) => product.productName)
                .join(", ") || "Order details"}
            </Text>
          </View>

          {/* ORDER TOTAL */}
          <View style={styles.priceContainer}>
            <Text style={styles.totalLabel}>
              TOTAL
            </Text>

            <Text style={styles.total}>
              ₹{item.total}
            </Text>
          </View>
        </View>

        {/* ORDER BOTTOM */}
        <View style={styles.bottomRow}>
          <View style={styles.deliveryInfo}>
            <Ionicons
              name="location-outline"
              size={14}
              color={PREMIUM.muted}
            />

            <Text
              style={styles.deliveryText}
              numberOfLines={1}
            >
              Delivered to{" "}
              {item.address?.type || "Home"}
            </Text>
          </View>

          <View style={styles.viewOrder}>
            <Text style={styles.viewText}>
              View Order
            </Text>

            <View style={styles.arrowBox}>
              <Ionicons
                name="arrow-forward"
                size={13}
                color={PREMIUM.primary}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
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

      {/* HEADER DOES NOT SCROLL */}
      {renderHeader()}

      {/* LOADING */}
      {loading ? (
        <View style={styles.loading}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="small"
              color={PREMIUM.primary}
            />
          </View>

          <Text style={styles.loadingText}>
            Loading your orders...
          </Text>
        </View>
      ) : orders.length === 0 ? (
        /* EMPTY ORDERS */
        <View style={styles.empty}>
          <View style={styles.emptyIconOuter}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={39}
                color={PREMIUM.primary}
              />
            </View>
          </View>

          <Text style={styles.emptyTitle}>
            No orders yet
          </Text>

          <Text style={styles.emptyText}>
            Your grocery orders will appear here
            once you place your first order.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shopButton}
            onPress={() => router.push("/")}
          >
            <Ionicons
              name="bag-outline"
              size={18}
              color={COLORS.white}
            />

            <Text style={styles.shopButtonText}>
              Start Shopping
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      ) : (
        /* ORIGINAL FLATLIST */
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom: 90 + insets.bottom,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // PAGE
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  // FIXED FULL-WIDTH HEADER
  headerBackground: {
    backgroundColor: PREMIUM.primary,
    paddingHorizontal: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
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

  headerSide: {
    width: 42,
  },

  headerTitleBox: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    color: PREMIUM.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 3,
  },

  headerInfo: {
    marginTop: 19,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
  },

  headerInfoIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.13)",
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
    minWidth: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },

  headerCount: {
    color: PREMIUM.white,
    fontSize: 12,
    fontWeight: "900",
  },

  // LIST
  list: {
    paddingHorizontal: 15,
    paddingTop: 17,
  },

  // ORDER CARD
  orderCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 19,
    padding: 14,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderHeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    minWidth: 0,
  },

  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  orderHeadingText: {
    flex: 1,
    marginLeft: 9,
  },

  orderId: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "800",
  },

  date: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  statusBadge: {
    maxWidth: 135,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  statusText: {
    marginLeft: 5,
    fontSize: 9,
    fontWeight: "800",
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: PREMIUM.border,
    marginVertical: 14,
  },

  itemsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemsIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  itemsInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    minWidth: 0,
  },

  productsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemsTitle: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "800",
  },

  itemsCount: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 7,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  itemsCountText: {
    color: PREMIUM.primary,
    fontSize: 9,
    fontWeight: "800",
  },

  itemsSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  priceContainer: {
    minWidth: 57,
    alignItems: "flex-end",
  },

  totalLabel: {
    color: PREMIUM.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  total: {
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
  },

  bottomRow: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  deliveryInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },

  deliveryText: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginLeft: 5,
    flexShrink: 1,
  },

  viewOrder: {
    flexDirection: "row",
    alignItems: "center",
  },

  viewText: {
    color: PREMIUM.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  arrowBox: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  // LOADING
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: PREMIUM.muted,
    fontSize: 11,
    fontWeight: "700",
  },

  // EMPTY STATE
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 70,
  },

  emptyIconOuter: {
    width: 112,
    height: 112,
    borderRadius: 36,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PREMIUM.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  emptyTitle: {
    color: PREMIUM.navy,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 19,
  },

  emptyText: {
    maxWidth: 290,
    color: PREMIUM.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },

  shopButton: {
    minWidth: 190,
    height: 50,
    paddingHorizontal: 17,
    borderRadius: 15,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 23,
    shadowColor: PREMIUM.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 4,
  },

  shopButtonText: {
    color: PREMIUM.white,
    fontSize: 12,
    fontWeight: "900",
    marginHorizontal: 10,
  },
});
