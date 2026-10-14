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

import { useLocation } from "../../context";
import { getProducts } from "../../services/productService";
import CategoryRow from "../../components/home/CategoryRow";
import ProductCard from "../../components/product/ProductCard";

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

export default function Home() {
  const { location } = useLocation();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await getProducts();
        setProducts(list);
        setFilteredProducts(list);
      } catch (e) {
        console.log("Home products error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const v = search.toLowerCase().trim();
    if (!v) {
      setFilteredProducts(products);
      return;
    }
    setFilteredProducts(
      products.filter((p) => {
        const n = String(p.name || "").toLowerCase();
        const c = String(p.category || "").toLowerCase();
        const d = String(p.description || "").toLowerCase();
        return n.includes(v) || c.includes(v) || d.includes(v);
      })
    );
  }, [search, products]);

  const deliveryTime = location?.deliveryTime || "15 mins";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push("/location")}
            style={styles.locationSection}
          >
            <View style={styles.locationIcon}>
              <Ionicons
                name="location"
                size={20}
                color={PREMIUM.primary}
              />
            </View>
            <View style={styles.locationContent}>
              <Text style={styles.deliverTo}>DELIVER TO</Text>
              <View style={styles.locationRow}>
                <Text style={styles.location} numberOfLines={1}>
                  {location?.name || "Select location"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={15}
                  color={PREMIUM.navy}
                />
              </View>
            </View>
          </Pressable>

          <View style={styles.deliveryPill}>
            <View style={styles.deliveryIcon}>
              <Ionicons
                name="time-outline"
                size={18}
                color={PREMIUM.primary}
              />
            </View>
            <Text style={styles.deliveryTime}>{deliveryTime}</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={22}
            color={PREMIUM.primary}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for products..."
            placeholderTextColor="#969DAA"
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>

        {/* BANNER */}
        <Pressable
          onPress={() => router.push("/categories")}
          style={styles.bannerContainer}
        >
          <Image
            source={require("../../assets/images/homebanner.png")}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </Pressable>

        {/* CATEGORIES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Pressable
            onPress={() => router.push("/categories")}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAll}>See All</Text>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={PREMIUM.primary}
            />
          </Pressable>
        </View>
        <View style={styles.categoryContainer}>
          <CategoryRow />
        </View>

        {/* BESTSELLERS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {search ? "Search results" : "Bestsellers"}
            </Text>
            {!search && (
              <Text style={styles.sectionSubtitle}>
                Popular choices from TWINTO
              </Text>
            )}
          </View>
        </View>

        {/* PRODUCTS */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={PREMIUM.primary} />
          </View>
        ) : filteredProducts.length > 0 ? (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard key={String(product.id)} product={product} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="search-outline"
                size={30}
                color={PREMIUM.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>
              Try searching for something else.
            </Text>
          </View>
        )}

        <View style={{ height: 25 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PREMIUM.background },
  scroll: { paddingTop: 8, paddingBottom: 20 },
  header: {
    paddingHorizontal: 18,
    paddingTop: 25,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  locationSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
  },
  locationContent: { flex: 1 },
  deliverTo: {
    color: PREMIUM.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  location: {
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "900",
    maxWidth: 175,
    marginRight: 3,
  },
  deliveryPill: {
    height: 43,
    minWidth: 94,
    paddingHorizontal: 10,
    borderRadius: 22,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  deliveryIcon: { marginRight: 5 },
  deliveryTime: { color: PREMIUM.primary, fontSize: 13, fontWeight: "900" },
  searchBox: {
    height: 50,
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 17,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    height: 50,
    marginHorizontal: 9,
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "500",
  },
  bannerContainer: {
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerImage: {
    width: "100%",
    aspectRatio: 2048 / 768,
    height: undefined,
  },
  sectionHeader: {
    marginTop: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  sectionSubtitle: { color: PREMIUM.muted, fontSize: 10, marginTop: 4 },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  seeAll: { color: PREMIUM.primary, fontSize: 12, fontWeight: "900" },
  categoryContainer: { marginTop: 8 },
  grid: {
    paddingHorizontal: 18,
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  loadingBox: { paddingVertical: 60, alignItems: "center" },
  empty: { alignItems: "center", paddingHorizontal: 30, paddingVertical: 45 },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "900",
    color: PREMIUM.navy,
  },
  emptyText: { marginTop: 5, fontSize: 12, color: PREMIUM.muted },
});