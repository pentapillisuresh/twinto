
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
import { getImageUrl } from "../../utils/imageUrl";

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
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const list = await getCategories();

        if (mounted) {
          setCategories(
            Array.isArray(list) ? list.slice(0, 8) : []
          );

          console.log(
            "[CATEGORY ROW] Loaded:",
            list?.length || 0
          );
        }
      } catch (error) {
        console.log(
          "[CATEGORY ROW] Error:",
          error?.message || error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator
          size="small"
          color={PREMIUM.primary}
        />
      </View>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.gridContainer}>
        {categories.map((category) => {
          const imageUrl = getImageUrl(
            category.image ||
              category.imageUrl ||
              category.image_url
          );

          const imageFailed =
            failedImages[String(category.id)];

          return (
            <Pressable
              key={String(category.id)}
              onPress={() => {
                router.push(
                  `/category/${category.slug}`
                );
              }}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
            >
              <View style={styles.imageBox}>
                {imageUrl && !imageFailed ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                    onError={(event) => {
                      console.log(
                        "[CATEGORY IMAGE FAILED]",
                        category.name,
                        imageUrl,
                        event.nativeEvent?.error
                      );

                      setFailedImages((previous) => ({
                        ...previous,
                        [String(category.id)]: true,
                      }));
                    }}
                    onLoad={() => {
                      console.log(
                        "[CATEGORY IMAGE LOADED]",
                        category.name
                      );
                    }}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons
                      name="grid-outline"
                      size={26}
                      color={PREMIUM.primary}
                    />
                  </View>
                )}
              </View>

              <Text
                numberOfLines={1}
                style={styles.name}
              >
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
  section: {
    marginTop: 24,
    paddingHorizontal: 12,
  },

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

  item: {
    width: "24%",
    alignItems: "center",
  },

  itemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  imageBox: {
    width: 85,
    height: 85,
    borderRadius: 18,
    backgroundColor: PREMIUM.pinkSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    color: PREMIUM.navy,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
});
