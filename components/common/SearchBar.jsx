import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants";

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search products",
}) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={21}
        color={COLORS.muted}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        style={styles.input}
      />

      <Ionicons
        name="options-outline"
        size={21}
        color={COLORS.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginHorizontal: 20,
  },

  input: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    color: COLORS.text,
  },
});