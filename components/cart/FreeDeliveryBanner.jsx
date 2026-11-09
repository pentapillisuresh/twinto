
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants";

export default function FreeDeliveryBanner({
  itemCount = 0,
  freeDelivery = false,
  freeDeliveryEnabled = true,
  freeDeliveryMaxItems = 3,
}) {
  const count = Math.max(0, Number(itemCount) || 0);

  const limit = Math.max(
    0,
    Number(freeDeliveryMaxItems) || 0
  );

  // Do not show for empty cart, disabled offer,
  // or invalid admin item limit.
  if (
    count === 0 ||
    !freeDeliveryEnabled ||
    limit <= 0
  ) {
    return null;
  }

  // The backend and cart context determine
  // whether delivery is actually free.
  const unlocked = Boolean(freeDelivery);

  const remainingItems = Math.max(
    0,
    limit - count
  );

  const progress = Math.min(
    (count / limit) * 100,
    100
  );

  return (
    <View style={styles.container}>
      {/* Delivery Icon */}
      <View style={styles.iconWrap}>
        <View style={styles.icon}>
          <Ionicons
            name="bicycle"
            size={20}
            color={COLORS.primary}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {unlocked ? (
          <>
            <View style={styles.titleRow}>
              <Text style={styles.title}>
                FREE DELIVERY
              </Text>

              <View style={styles.unlockedBadge}>
                <Ionicons
                  name="checkmark"
                  size={10}
                  color={COLORS.primary}
                />

                <Text style={styles.unlockedText}>
                  UNLOCKED
                </Text>
              </View>
            </View>

            <Text style={styles.subtitle}>
              Your order qualifies for free delivery.
            </Text>

            <Text style={styles.qualifiedText}>
              Free delivery on {limit} or more items.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              UNLOCK FREE DELIVERY
            </Text>

            <Text style={styles.subtitle}>
              Add {remainingItems} more{" "}
              {remainingItems === 1 ? "item" : "items"}{" "}
              to get FREE delivery.
            </Text>

            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.count}>
                {count}/{limit}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Arrow / Status */}
      <View style={styles.arrow}>
        <Ionicons
          name={
            unlocked
              ? "checkmark"
              : "chevron-forward"
          }
          size={15}
          color={COLORS.muted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,

    paddingVertical: 14,
    paddingHorizontal: 14,

    borderRadius: 18,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#F0D5E1",

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  iconWrap: {
    width: 45,
    height: 45,

    borderRadius: 15,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    width: 36,
    height: 36,

    borderRadius: 12,

    backgroundColor: COLORS.white,

    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,

    marginLeft: 12,
    marginRight: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  title: {
    color: COLORS.primary,

    fontSize: 11,
    fontWeight: "900",

    letterSpacing: 0.4,
  },

  unlockedBadge: {
    marginLeft: 7,

    paddingHorizontal: 7,
    paddingVertical: 3,

    borderRadius: 8,

    backgroundColor: "#FFE3EF",

    flexDirection: "row",
    alignItems: "center",
  },

  unlockedText: {
    marginLeft: 3,

    color: COLORS.primary,

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 0.3,
  },

  subtitle: {
    color: COLORS.muted,

    fontSize: 10,
    lineHeight: 15,

    marginTop: 4,
  },

  qualifiedText: {
    color: COLORS.primary,

    fontSize: 10,
    fontWeight: "700",

    marginTop: 5,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 9,
  },

  progressTrack: {
    flex: 1,

    height: 5,

    borderRadius: 5,

    backgroundColor: "#FFE3EF",

    overflow: "hidden",
  },

  progressFill: {
    height: "100%",

    borderRadius: 5,

    backgroundColor: COLORS.primary,
  },

  count: {
    marginLeft: 8,

    color: COLORS.primary,

    fontSize: 9,
    fontWeight: "900",
  },

  arrow: {
    width: 25,
    height: 25,

    borderRadius: 9,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },
});
