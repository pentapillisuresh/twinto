import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants";

export default function DeliveryBanner({
  location,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons
          name="flash"
          size={22}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.small}>
          QUICK DELIVERY
        </Text>

        <Text style={styles.title}>
          Groceries in {location?.deliveryTime || "17 mins"}
        </Text>

        <Text style={styles.subtitle}>
          Fresh products delivered to your door
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 15,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 13,
  },

  small: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
});