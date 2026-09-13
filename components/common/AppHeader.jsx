import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { COLORS } from "../../constants";

export default function AppHeader({
  title,
  showBack = true,
  right,
}) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </Pressable>
        )}

        <Text style={styles.title}>{title}</Text>
      </View>

      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
    marginRight: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
});