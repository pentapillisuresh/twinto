import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCategories } from "../../services/categoryService";

const PREMIUM = {
  primary: "#C9004F",
  navy: "#172033",
  white: "#FFFFFF",
  pinkSoft: "#FFF0F5",
  pinkLight: "#FDE3EC",
  border: "#E9DDE2",
  muted: "#858B95",
};

export default function CategoryRow() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getCategories();
        setCategories(list.slice(0, 8));
      } catch (e) {
        console.log("CategoryRow error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={PREMIUM.primary} />
      </View>
    );
  }

  if (categories.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.gridContainer}>
        {categories.map((category) => {
          const imageSource = category.image
            ? { uri: category.image }
            : null;

          return (
            <Pressable
              key={category.id}
              onPress={() =>
                router.push(`/category/${category.slug}`)
              }
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
            >
              <View style={styles.imageBox}>
                {imageSource ? (
                  <Image
                    source={imageSource}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="grid-outline"
                    size={26}
                    color={PREMIUM.primary}
                  />
                )}
              </View>

              <Text numberOfLines={1} style={styles.name}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingHorizontal: 12 },
  loadingBox: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },
  item: { width: "24%", alignItems: "center" },
  itemPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  imageBox: {
    width: 85,
    height: 85,
    borderRadius: 18,
    backgroundColor: PREMIUM.pinkSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  name: {
    color: PREMIUM.navy,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
});