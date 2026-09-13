import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { COLORS } from "../../constants";

import { getOrders } from "../../services/orderService";

export default function OrdersScreen() {
  const router = useRouter();

  const insets = useSafeAreaInsets();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  function renderOrder({ item }) {
    const statusColor = getStatusColor(
      item.status
    );

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
        {/* TOP */}

        <View style={styles.topRow}>
          <View style={styles.orderHeading}>
            <View style={styles.orderIcon}>
              <Ionicons
                name="receipt-outline"
                size={17}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.orderHeadingText}>
              <Text style={styles.orderId}>
                Order #{item.id}
              </Text>

              <Text style={styles.date}>
                {item.date}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusBackground,
              },
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status)}
              size={14}
              color={statusColor}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: statusColor,
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* DIVIDER */}

        <View style={styles.divider} />

        {/* PRODUCTS */}

        <View style={styles.itemsRow}>
          <View style={styles.itemsIcon}>
            <Ionicons
              name="bag-handle-outline"
              size={21}
              color={COLORS.primary}
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
                ?.map(
                  (product) =>
                    product.productName
                )
                .join(", ") ||
                "Order details"}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.totalLabel}>
              TOTAL
            </Text>

            <Text style={styles.total}>
              ₹{item.total}
            </Text>
          </View>
        </View>

        {/* BOTTOM */}

        <View style={styles.bottomRow}>
          <View style={styles.deliveryInfo}>
            <Ionicons
              name="location-outline"
              size={13}
              color={COLORS.muted}
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
                color={COLORS.primary}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /* LOADING */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loading}
        edges={[
          "top",
          "bottom",
          "left",
          "right",
        ]}
      >
        <View style={styles.loadingIcon}>
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.loadingText}>
          Loading your orders...
        </Text>
      </SafeAreaView>
    );
  }

  /* EMPTY */

  if (orders.length === 0) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right"]}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="receipt-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              My Orders
            </Text>

            <Text style={styles.headerSubtitle}>
              Your grocery order history
            </Text>
          </View>
        </View>

        <View style={styles.empty}>
          <View style={styles.emptyIconOuter}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={38}
                color={COLORS.primary}
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
      </SafeAreaView>
    );
  }

  /* ORDERS */

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      {/* PREMIUM TOP HEADER */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="receipt-outline"
            size={21}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            My Orders
          </Text>

          <Text style={styles.headerSubtitle}>
            Your grocery order history
          </Text>
        </View>

        <View style={styles.orderCountBadge}>
          <Text style={styles.orderCountText}>
            {orders.length}
          </Text>
        </View>
      </View>

      {/* LIST */}

      <FlatList
        data={orders}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              90 + insets.bottom,
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* PAGE */

  container: {
    flex: 1,

    backgroundColor: COLORS.background,
  },

  /* HEADER */

  header: {
    height: 76,

    paddingHorizontal: 16,

    backgroundColor: COLORS.white,

    borderBottomWidth: 1,
    borderBottomColor: "#EEDFE5",

    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,

    marginLeft: 11,
  },

  headerTitle: {
    color: COLORS.text,

    fontSize: 19,
    fontWeight: "900",

    letterSpacing: -0.4,
  },

  headerSubtitle: {
    color: COLORS.muted,

    fontSize: 9.5,
    fontWeight: "600",

    marginTop: 3,
  },

  orderCountBadge: {
    minWidth: 32,
    height: 32,

    paddingHorizontal: 8,

    borderRadius: 11,

    backgroundColor: COLORS.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  orderCountText: {
    color: COLORS.white,

    fontSize: 10,
    fontWeight: "900",
  },

  /* LIST */

  list: {
    paddingHorizontal: 16,

    paddingTop: 14,
  },

  /* ORDER CARD */

  orderCard: {
    backgroundColor: COLORS.white,

    borderRadius: 19,

    padding: 14,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#EEDFE5",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.035,
    shadowRadius: 9,

    elevation: 2,
  },

  /* TOP ROW */

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
  },

  orderIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  orderHeadingText: {
    flex: 1,

    marginLeft: 9,
  },

  orderId: {
    color: COLORS.text,

    fontSize: 13.5,
    fontWeight: "900",

    letterSpacing: -0.1,
  },

  date: {
    color: COLORS.muted,

    fontSize: 9.5,

    marginTop: 4,
  },

  /* STATUS */

  statusBadge: {
    maxWidth: 145,

    paddingHorizontal: 8,
    paddingVertical: 6,

    borderRadius: 9,

    flexDirection: "row",
    alignItems: "center",

    alignSelf: "flex-start",
  },

  statusText: {
    marginLeft: 5,

    fontSize: 8.5,
    fontWeight: "900",

    textAlign: "right",
  },

  /* DIVIDER */

  divider: {
    height: 1,

    backgroundColor: "#F0E5EA",

    marginVertical: 13,
  },

  /* ITEMS */

  itemsRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  itemsIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  itemsInfo: {
    flex: 1,

    marginLeft: 10,

    marginRight: 8,
  },

  productsTitleRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  itemsTitle: {
    color: COLORS.text,

    fontSize: 11.5,
    fontWeight: "900",
  },

  itemsCount: {
    minWidth: 20,
    height: 20,

    paddingHorizontal: 5,

    borderRadius: 7,

    backgroundColor: "#FFF0F6",

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 6,
  },

  itemsCountText: {
    color: COLORS.primary,

    fontSize: 7.5,
    fontWeight: "900",
  },

  itemsSubtitle: {
    color: COLORS.muted,

    fontSize: 9,

    marginTop: 4,
  },

  /* PRICE */

  priceContainer: {
    minWidth: 57,

    alignItems: "flex-end",
  },

  totalLabel: {
    color: COLORS.muted,

    fontSize: 6.5,
    fontWeight: "900",

    letterSpacing: 0.7,
  },

  total: {
    color: COLORS.text,

    fontSize: 15,
    fontWeight: "900",

    marginTop: 3,
  },

  /* BOTTOM ROW */

  bottomRow: {
    marginTop: 13,

    paddingTop: 11,

    borderTopWidth: 1,
    borderTopColor: "#F0E5EA",

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
    color: COLORS.muted,

    fontSize: 8.5,

    marginLeft: 5,
  },

  viewOrder: {
    flexDirection: "row",

    alignItems: "center",
  },

  viewText: {
    color: COLORS.primary,

    fontSize: 9.5,
    fontWeight: "900",
  },

  arrowBox: {
    width: 25,
    height: 25,

    borderRadius: 8,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 6,
  },

  /* LOADING */

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

  /* EMPTY */

  empty: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 30,

    paddingBottom: 80,
  },

  emptyIconOuter: {
    width: 102,
    height: 102,

    borderRadius: 34,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 76,
    height: 76,

    borderRadius: 25,

    backgroundColor: COLORS.white,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 2,
  },

  emptyTitle: {
    color: COLORS.text,

    fontSize: 21,
    fontWeight: "900",

    marginTop: 19,
  },

  emptyText: {
    maxWidth: 290,

    color: COLORS.muted,

    fontSize: 11.5,

    lineHeight: 18,

    textAlign: "center",

    marginTop: 7,
  },

  shopButton: {
    minWidth: 190,
    height: 50,

    paddingHorizontal: 17,

    borderRadius: 15,

    backgroundColor: COLORS.primary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop: 22,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.18,
    shadowRadius: 9,

    elevation: 4,
  },

  shopButtonText: {
    color: COLORS.white,

    fontSize: 12.5,
    fontWeight: "900",

    marginHorizontal: 10,
  },
});