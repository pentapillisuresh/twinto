
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import ProductCard from "../../components/product/ProductCard";
import { COLORS } from "../../constants";
import { getCategoryBySlug } from "../../services/categoryService";
import { getProductsByCategory } from "../../services/productService";

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
  gray: "#68717F",
  gold: "#FFE19A",
};

export default function CategoryProducts() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ORIGINAL STATE LOGIC
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ORIGINAL API LOGIC - UNCHANGED
  useEffect(() => {
    (async () => {
      setLoading(true);

      try {
        const cat = await getCategoryBySlug(slug);
        setCategory(cat);

        if (cat?.id != null) {
          const list = await getProductsByCategory(cat.id);
          setProducts(list);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.log("Category products error:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // ORIGINAL SEARCH FILTER LOGIC - UNCHANGED
  const filtered = products.filter((p) =>
    String(p.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" && Platform.Version >= 35)
      ? insets.top
      : 0;

  const categoryName = category?.name || "Products";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PREMIUM.primary}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

      {/* FIXED FULL-WIDTH HEADER */}
      <View
        style={[
          styles.headerBackground,
          {
            paddingTop: topInset + 15,
          },
        ]}
      >
        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />

        {/* HEADER TOP */}
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color={PREMIUM.white}
            />
          </Pressable>

          <View style={styles.headerTitleBox}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              {categoryName}
            </Text>

            <Text style={styles.headerSubtitle}>
              Explore your everyday essentials
            </Text>
          </View>

          <View style={styles.headerSide} />
        </View>

        {/* CATEGORY INFORMATION */}
        <View style={styles.headerInfo}>
          <View style={styles.headerInfoIcon}>
            <Ionicons
              name="grid-outline"
              size={20}
              color={PREMIUM.gold}
            />
          </View>

          <View style={styles.headerInfoContent}>
            <Text
              style={styles.headerInfoTitle}
              numberOfLines={1}
            >
              {categoryName}
            </Text>

            <Text style={styles.headerInfoSubtitle}>
              {loading
                ? "Finding products for you..."
                : `${products.length} ${
                    products.length === 1
                      ? "product"
                      : "products"
                  } available`}
            </Text>
          </View>

          <View style={styles.headerInfoBadge}>
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={PREMIUM.white}
            />
          </View>
        </View>
      </View>

      {/* SEARCH SECTION - FIXED */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <View style={styles.searchIconBox}>
            <Ionicons
              name="search-outline"
              size={19}
              color={PREMIUM.primary}
            />
          </View>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${categoryName}`}
            placeholderTextColor={PREMIUM.muted}
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <Pressable
              style={styles.clearSearch}
              onPress={() => setSearch("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close"
                size={17}
                color={PREMIUM.gray}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* RESULTS HEADER */}
      <View style={styles.resultHeader}>
        <View style={styles.resultTitleRow}>
          <View style={styles.sectionAccent} />

          <View style={styles.resultTitleContent}>
            <Text
              style={styles.title}
              numberOfLines={1}
            >
              {categoryName}
            </Text>

            <Text style={styles.count}>
              {filtered.length}{" "}
              {filtered.length === 1
                ? "product"
                : "products"}{" "}
              found
            </Text>
          </View>
        </View>

        <View style={styles.resultBadge}>
          <Ionicons
            name="layers-outline"
            size={13}
            color={PREMIUM.primary}
          />

          <Text style={styles.resultBadgeText}>
            {filtered.length}
          </Text>
        </View>
      </View>

      {/* ORIGINAL LOADING LOGIC */}
      {loading ? (
        <View style={styles.loading}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color={PREMIUM.primary}
            />
          </View>

          <Text style={styles.loadingText}>
            Loading products...
          </Text>
        </View>
      ) : (
        /* ORIGINAL TWO-COLUMN FLATLIST */
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => (
            <ProductCard product={item} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={33}
                  color={PREMIUM.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No products found
              </Text>

              <Text style={styles.emptyText}>
                Try another search.
              </Text>

              {search.length > 0 && (
                <Pressable
                  style={styles.resetButton}
                  onPress={() => setSearch("")}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    color={PREMIUM.white}
                  />

                  <Text style={styles.resetButtonText}>
                    Clear Search
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // PAGE
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  // FIXED PINK HEADER
  headerBackground: {
    backgroundColor: PREMIUM.primary,
    paddingHorizontal: 18,
    paddingBottom: 21,
    borderBottomLeftRadius: 27,
    borderBottomRightRadius: 27,
    overflow: "hidden",
    zIndex: 10,
    elevation: 4,
  },

  headerCircleOne: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.055)",
    right: -95,
    top: -110,
  },

  headerCircleTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.045)",
    left: -65,
    bottom: -60,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.17)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  headerSide: {
    width: 43,
    height: 43,
  },

  headerTitleBox: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  headerTitle: {
    color: PREMIUM.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },

  // HEADER INFO CARD
  headerInfo: {
    marginTop: 19,
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
  },

  headerInfoIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  headerInfoContent: {
    flex: 1,
    minWidth: 0,
  },

  headerInfoTitle: {
    color: PREMIUM.white,
    fontSize: 13,
    fontWeight: "800",
  },

  headerInfoSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    marginTop: 4,
  },

  headerInfoBadge: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // SEARCH SECTION
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 5,
  },

  searchBox: {
    height: 53,
    backgroundColor: PREMIUM.white,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    shadowColor: "#7A2949",
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  searchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 0,
  },

  clearSearch: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
  },

  // RESULT HEADER
  resultHeader: {
    paddingHorizontal: 17,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  sectionAccent: {
    width: 4,
    height: 37,
    borderRadius: 3,
    backgroundColor: PREMIUM.primary,
    marginRight: 11,
  },

  resultTitleContent: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 19,
    fontWeight: "900",
    color: PREMIUM.navy,
    letterSpacing: -0.4,
  },

  count: {
    marginTop: 4,
    color: PREMIUM.muted,
    fontSize: 11,
    fontWeight: "500",
  },

  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    gap: 5,
    marginLeft: 8,
  },

  resultBadgeText: {
    color: PREMIUM.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  // PRODUCT GRID
  productList: {
    paddingHorizontal: 16,
    paddingTop: 3,
    paddingBottom: 35,
    flexGrow: 1,
  },

  columnWrapper: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 13,
  },

  // LOADING
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: PREMIUM.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 14,
  },

  // EMPTY STATE
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 65,
    paddingBottom: 65,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: PREMIUM.navy,
  },

  emptyText: {
    color: PREMIUM.muted,
    fontSize: 12,
    marginTop: 7,
    textAlign: "center",
  },

  resetButton: {
    marginTop: 19,
    height: 43,
    paddingHorizontal: 19,
    borderRadius: 22,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  resetButtonText: {
    color: PREMIUM.white,
    fontSize: 12,
    fontWeight: "800",
  },
});
