import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants";

export default function FreeDeliveryBanner({
  itemCount,
  freeDelivery,
}) {
  if (itemCount === 0) {
    return null;
  }

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
        {freeDelivery ? (
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
          </>
        ) : (
          <>
            <Text style={styles.title}>
              FREE DELIVERY AVAILABLE
            </Text>

            <Text style={styles.subtitle}>
              Order up to 3 items and enjoy free delivery.
            </Text>

            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        (itemCount / 3) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.count}>
                {itemCount}/3
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Arrow */}
      <View style={styles.arrow}>
        <Ionicons
          name="chevron-forward"
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