import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants";

export default function BillDetails({
  itemTotal,
  platformFee,
  deliveryFee,
  tip,
  total,
}) {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Bill Details
          </Text>

          <Text style={styles.subtitle}>
            Complete breakdown of your order
          </Text>
        </View>

        <View style={styles.iconBox}>
          <Ionicons
            name="receipt-outline"
            size={18}
            color={COLORS.primary}
          />
        </View>
      </View>

      {/* ITEM TOTAL */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <View style={styles.smallIcon}>
            <Ionicons
              name="basket-outline"
              size={13}
              color={COLORS.muted}
            />
          </View>

          <Text style={styles.label}>
            Item Total
          </Text>
        </View>

        <Text style={styles.value}>
          ₹{itemTotal.toFixed(2)}
        </Text>
      </View>

      {/* PLATFORM FEE */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <View style={styles.smallIcon}>
            <Ionicons
              name="grid-outline"
              size={13}
              color={COLORS.muted}
            />
          </View>

          <Text style={styles.label}>
            Platform Fee
          </Text>
        </View>

        <Text style={styles.value}>
          ₹{platformFee.toFixed(2)}
        </Text>
      </View>

      {/* DELIVERY FEE */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <View style={styles.smallIcon}>
            <Ionicons
              name="bicycle-outline"
              size={13}
              color={COLORS.muted}
            />
          </View>

          <Text style={styles.label}>
            Delivery Partner Fee
          </Text>
        </View>

        <Text
          style={[
            styles.value,
            deliveryFee === 0 && styles.freeText,
          ]}
        >
          {deliveryFee === 0
            ? "FREE"
            : `₹${deliveryFee.toFixed(2)}`}
        </Text>
      </View>

      {/* TIP */}
      {tip > 0 && (
        <View style={styles.row}>
          <View style={styles.labelRow}>
            <View style={styles.smallIcon}>
              <Ionicons
                name="heart-outline"
                size={13}
                color={COLORS.muted}
              />
            </View>

            <Text style={styles.label}>
              Tip
            </Text>
          </View>

          <Text style={styles.value}>
            ₹{tip.toFixed(2)}
          </Text>
        </View>
      )}

      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* TOTAL */}
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>
            Total Amount
          </Text>

          <Text style={styles.totalSubtext}>
            Inclusive of all applicable charges
          </Text>
        </View>

        <Text style={styles.total}>
          ₹{total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    marginHorizontal: 0,

    padding: 15,

    borderRadius: 18,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EEDFE5",
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 15,
  },

  title: {
    color: COLORS.text,

    fontSize: 15,
    fontWeight: "900",

    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 3,

    color: COLORS.muted,

    fontSize: 9.5,
  },

  iconBox: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  /* ROW */

  row: {
    minHeight: 38,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",

    flex: 1,
  },

  smallIcon: {
    width: 27,
    height: 27,

    borderRadius: 9,

    backgroundColor: "#F8F5F7",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  label: {
    color: COLORS.muted,

    fontSize: 11,
    fontWeight: "600",
  },

  value: {
    color: COLORS.text,

    fontSize: 11.5,
    fontWeight: "800",
  },

  freeText: {
    color: COLORS.primary,

    fontWeight: "900",
  },

  /* DIVIDER */

  divider: {
    height: 1,

    backgroundColor: "#F0E5EA",

    marginTop: 8,
    marginBottom: 13,
  },

  /* TOTAL */

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

  totalSubtext: {
    marginTop: 3,

    color: COLORS.muted,

    fontSize: 8.5,
  },

  total: {
    color: COLORS.primary,

    fontSize: 20,
    fontWeight: "900",

    letterSpacing: -0.4,
  },
});