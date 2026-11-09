
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import ProductCard from "../../components/product/ProductCard";
import { useCart } from "../../context";
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
};

const COLUMNS = 3;
const SIDE_PADDING = 12;
const COLUMN_GAP = 9;

export default function CategoryProducts() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const { itemCount = 0 } = useCart();

  // ORIGINAL STATE
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ORIGINAL API LOGIC
  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);

      try {
        const cat = await getCategoryBySlug(slug);

        if (!active) return;

        setCategory(cat);

        if (cat?.id != null) {
          const list = await getProductsByCategory(cat.id);

          if (!active) return;

          setProducts(
            Array.isArray(list) ? list : []
          );
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.log(
          "Category products error:",
          error
        );

        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  // ORIGINAL SEARCH FILTER
  const filtered = useMemo(() => {
    return products.filter((p) =>
      String(p.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" &&
      Platform.Version >= 35)
      ? insets.top
      : 0;

  const categoryName =
    category?.name || "Products";

  // EXACTLY THREE PRODUCTS PER ROW
  const productWidth = Math.max(
    0,
    (
      screenWidth -
      SIDE_PADDING * 2 -
      COLUMN_GAP * (COLUMNS - 1)
    ) / COLUMNS
  );

  const goToCart = () => {
    Keyboard.dismiss();

    router.push("/(tabs)/cart");
  };

  const renderProduct = ({ item }) => (
    <View
      style={[
        styles.productColumn,
        {
          width: productWidth,
        },
      ]}
    >
      <ProductCard product={item} />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="search-outline"
          size={31}
          color={PREMIUM.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        No products found
      </Text>

      <Text style={styles.emptyText}>
        {search
          ? "Try another search."
          : "No products are available in this category."}
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
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={PREMIUM.white}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

      {/* PREMIUM FIXED HEADER */}

      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 10,
          },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={PREMIUM.navy}
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
            Fresh picks, delivered fast
          </Text>
        </View>

        {/* CART WITH LIVE BADGE */}

        <Pressable
          style={styles.cartButton}
          onPress={goToCart}
          accessibilityRole="button"
          accessibilityLabel={`Open cart, ${itemCount} items`}
        >
          <Ionicons
            name="cart-outline"
            size={23}
            color={PREMIUM.primary}
          />

          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {itemCount > 99
                  ? "99+"
                  : itemCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* SEARCH */}

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={PREMIUM.primary}
          />

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
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={PREMIUM.muted}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* RESULTS HEADER */}

      <View style={styles.resultHeader}>
        <View style={styles.resultTitleContent}>
          <Text style={styles.sectionTitle}>
            {categoryName}
          </Text>

          <Text style={styles.resultCount}>
            {loading
              ? "Finding fresh products..."
              : `${filtered.length} ${
                  filtered.length === 1
                    ? "product"
                    : "products"
                } available`}
          </Text>
        </View>

        <View style={styles.resultsPill}>
          <Ionicons
            name="grid-outline"
            size={14}
            color={PREMIUM.primary}
          />

          <Text style={styles.resultsPillText}>
            {filtered.length}
          </Text>
        </View>
      </View>

      {/* PRODUCTS */}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={PREMIUM.primary}
          />

          <Text style={styles.loadingText}>
            Loading products...
          </Text>
        </View>
      ) : (
        <FlatList
          key="three-column-products"
          data={filtered}
          keyExtractor={(item) =>
            String(item.id)
          }
          numColumns={3}
          renderItem={renderProduct}
          columnWrapperStyle={
            styles.columnWrapper
          }
          contentContainerStyle={
            styles.productList
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={renderEmpty}
          extraData={productWidth}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // SCREEN

  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  // PREMIUM HEADER

  header: {
    backgroundColor: PREMIUM.white,
    paddingHorizontal: 15,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM.border,
  },

  backButton: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleBox: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
  },

  headerTitle: {
    color: PREMIUM.navy,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  headerSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },

  // CART BUTTON

  cartButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: PREMIUM.primary,
    borderWidth: 2,
    borderColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },

  cartBadgeText: {
    color: PREMIUM.white,
    fontSize: 9,
    fontWeight: "900",
  },

  // SEARCH

  searchSection: {
    backgroundColor: PREMIUM.background,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 8,
  },

  searchBox: {
    height: 46,
    borderRadius: 14,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 12,
    fontWeight: "500",
    color: PREMIUM.navy,
    paddingVertical: 0,
  },

  clearSearch: {
    padding: 5,
  },

  // RESULTS

  resultHeader: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultTitleContent: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  resultCount: {
    color: PREMIUM.muted,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
  },

  resultsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: PREMIUM.pinkSoft,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  resultsPillText: {
    color: PREMIUM.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  // THREE-COLUMN PRODUCT GRID

  productList: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 4,
    paddingBottom: 40,
    flexGrow: 1,
  },

  columnWrapper: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    columnGap: COLUMN_GAP,
    marginBottom: 17,
  },

  productColumn: {
    minWidth: 0,
    alignSelf: "flex-start",
  },

  // LOADING

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: PREMIUM.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
  },

  // EMPTY STATE

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 65,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    color: PREMIUM.navy,
    fontSize: 17,
    fontWeight: "900",
  },

  emptyText: {
    color: PREMIUM.muted,
    fontSize: 12,
    marginTop: 7,
    textAlign: "center",
  },

  resetButton: {
    marginTop: 19,
    height: 42,
    paddingHorizontal: 19,
    borderRadius: 12,
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
