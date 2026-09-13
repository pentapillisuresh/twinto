import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants";

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
}) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrease}
        style={styles.button}
      >
        <Ionicons
          name="remove"
          size={18}
          color={COLORS.primary}
        />
      </Pressable>

      <Text style={styles.quantity}>
        {quantity}
      </Text>

      <Pressable
        onPress={onIncrease}
        style={styles.button}
      >
        <Ionicons
          name="add"
          size={18}
          color={COLORS.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },

  button: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  quantity: {
    minWidth: 25,
    textAlign: "center",
    fontWeight: "800",
    color: COLORS.text,
  },
});