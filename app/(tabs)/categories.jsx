import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { getCategories } from "../../services/categoryService";
import { getProducts } from "../../services/productService";

const PREMIUM = {
  primary: "#C9004F",
  primaryDark: "#A90042",
  navy: "#172033",
  white: "#FFFFFF",
  background: "#FFF9FB",
  pinkSoft: "#FFF0F5",
  pinkLight: "#FDE3EC",
  border: "#E9DDE2",
  muted: "#858B95",
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        const c = {};
        prods.forEach((p) => {
          if (p.categoryId != null) {
            c[p.categoryId] = (c[p.categoryId] || 0) + 1;
          }
        });
        setCategories(cats);
        setCounts(c);
      } catch (e) {
        console.log("Categories error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visible = categories.filter((c) =>
    search
      ? c.name.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color={PREMIUM.navy}
            />
          </Pressable>
          <Text style={styles.title}>Categories</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={21}
            color={PREMIUM.primary}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search categories..."
            placeholderTextColor={PREMIUM.muted}
            style={styles.searchInput}
            autoCorrect={false}
          />
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={PREMIUM.primary} />
          </View>
        ) : visible.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No categories found.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {visible.map((category) => {
              const count = counts[category.id] || 0;
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
                    styles.card,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.imageBox}>
                    {imageSource ? (
                      <Image
                        source={imageSource}
                        style={styles.categoryImage}
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
                  <Text style={styles.name} numberOfLines={1}>
                    {category.name}
                  </Text>
                  <Text style={styles.count}>
                    {count} {count === 1 ? "product" : "products"}
                  </Text>
                  <View style={styles.arrow}>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={PREMIUM.primary}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PREMIUM.background },
  scroll: { paddingBottom: 30 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
  },
  title: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
    color: PREMIUM.navy,
    fontSize: 21,
    fontWeight: "900",
  },
  searchBox: {
    height: 48,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 15,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 9,
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "600",
  },
  loading: { paddingVertical: 80, alignItems: "center" },
  empty: { paddingVertical: 80, alignItems: "center" },
  emptyText: { color: PREMIUM.muted, fontSize: 13 },
  grid: {
    paddingHorizontal: 16,
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  card: {
    width: "31.8%",
    backgroundColor: PREMIUM.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    marginBottom: 13,
    paddingBottom: 11,
    overflow: "hidden",
  },
  cardPressed: { transform: [{ scale: 0.96 }] },
  imageBox: {
    width: "100%",
    height: 92,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM.pinkLight,
    overflow: "hidden",
  },
  categoryImage: { width: "100%", height: "100%" },
  name: {
    marginTop: 8,
    paddingHorizontal: 5,
    color: PREMIUM.navy,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  count: {
    marginTop: 3,
    color: PREMIUM.muted,
    fontSize: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  arrow: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});