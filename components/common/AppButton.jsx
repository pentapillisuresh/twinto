import {
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import { COLORS } from "../../constants";

export default function AppButton({
  title,
  onPress,
  disabled = false,
  outline = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,

        outline && styles.outline,

        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.text,
          outline && styles.outlineText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  outline: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },

  outlineText: {
    color: COLORS.primary,
  },
});