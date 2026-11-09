
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLocation } from "../../context";
import { getProducts } from "../../services/productService";
import { getImageUrl } from "../../utils/imageUrl";

import CategoryRow from "../../components/home/CategoryRow";
import ProductCard from "../../components/product/ProductCard";

const PREMIUM = {
  primary: "#C9004F",
  primaryDark: "#A90042",
  navy: "#172033",
  white: "#FFFFFF",
  background: "#FFFAFC",
  pinkSoft: "#FFF0F5",
  pinkLight: "#FDE3EC",
  border: "#F0E3E8",
  muted: "#858B95",
};

const GRID_COLUMNS = 3;
const GRID_PADDING = 14;
const GRID_GAP = 8;

const BANNER_IMAGE = require(
  "../../assets/images/homebanner.png"
);

const bannerAsset = Image.resolveAssetSource(
  BANNER_IMAGE
);

const BANNER_RATIO =
  bannerAsset?.width && bannerAsset?.height
    ? bannerAsset.width / bannerAsset.height
    : 2048 / 768;

export default function Home() {
  const { location } = useLocation();
  const insets = useSafeAreaInsets();

  const { width: screenWidth } =
    useWindowDimensions();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] =
    useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] =
    useState(false);

  // ORIGINAL PRODUCT API
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const list = await getProducts();

        if (!active) return;

        const safeList = Array.isArray(list)
          ? list
          : [];

        setProducts(safeList);
        setFilteredProducts(safeList);
      } catch (error) {
        console.log(
          "Home products error:",
          error
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const deliveryTime =
    location?.deliveryTime || "15 mins";

  const formattedDeliveryTime =
    typeof deliveryTime === "number"
      ? `${deliveryTime} mins`
      : String(deliveryTime);

  // EXACT THREE COLUMNS
  const productWidth = Math.max(
    0,
    (
      screenWidth -
      GRID_PADDING * 2 -
      GRID_GAP * (GRID_COLUMNS - 1)
    ) / GRID_COLUMNS
  );

  // FILTER EXISTING API PRODUCTS
  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return filteredProducts;

    return filteredProducts.filter((product) => {
      const categoryName =
        typeof product?.category === "object"
          ? product.category?.name
          : product?.category;

      return [
        product?.name,
        categoryName,
        product?.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [filteredProducts, search]);

  const searchSuggestions = useMemo(() => {
    if (!search.trim()) return [];

    return visibleProducts.slice(0, 5);
  }, [visibleProducts, search]);

  const openProduct = (product) => {
    if (!product?.id) return;

    Keyboard.dismiss();
    setSearchFocused(false);
    setSearch("");

    router.push(`/product/${product.id}`);
  };

  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, 8) + 8,
        },
      ]}
    >
      <Pressable
        style={styles.locationSection}
        onPress={() => router.push("/location")}
      >
        <View style={styles.locationIcon}>
          <Ionicons
            name="location"
            size={19}
            color={PREMIUM.primary}
          />
        </View>

        <View style={styles.locationContent}>
          <Text style={styles.deliverTo}>
            DELIVER TO
          </Text>

          <View style={styles.locationRow}>
            <Text
              style={styles.locationName}
              numberOfLines={1}
            >
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

      <View style={styles.timePill}>
        <Ionicons
          name="time-outline"
          size={15}
          color={PREMIUM.primary}
        />

        <Text style={styles.timeText}>
          {formattedDeliveryTime}
        </Text>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={20}
          color={PREMIUM.primary}
        />

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search products or categories"
          placeholderTextColor={PREMIUM.muted}
          returnKeyType="search"
          autoCorrect={false}
          onSubmitEditing={() => {
            Keyboard.dismiss();
            setSearchFocused(false);
          }}
        />

        {search.length > 0 ? (
          <Pressable
            onPress={() => {
              setSearch("");
              setSearchFocused(false);
              Keyboard.dismiss();
            }}
            hitSlop={10}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={PREMIUM.muted}
            />
          </Pressable>
        ) : (
          <Ionicons
            name="options-outline"
            size={18}
            color={PREMIUM.muted}
          />
        )}
      </View>

      {searchFocused && search.trim().length > 0 && (
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionLabel}>
            {searchSuggestions.length > 0
              ? "PRODUCT SUGGESTIONS"
              : "NO MATCHING PRODUCTS"}
          </Text>

          {searchSuggestions.map((item) => {
            const suggestionImage = getImageUrl(
              item.image ||
                item.imageUrl ||
                item.image_url
            );

            return (
              <Pressable
                key={String(item.id)}
                style={styles.suggestionItem}
                onPress={() => openProduct(item)}
              >
                <View style={styles.suggestionImageBox}>
                  {suggestionImage ? (
                    <Image
                      source={{ uri: suggestionImage }}
                      style={styles.suggestionImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons
                      name="cube-outline"
                      size={18}
                      color={PREMIUM.muted}
                    />
                  )}
                </View>

                <View style={styles.suggestionInfo}>
                  <Text
                    style={styles.suggestionText}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <Text style={styles.suggestionPrice}>
                    ₹{item.price}
                  </Text>
                </View>

                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={20}
                  color={PREMIUM.primary}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderBanner = () => (
    <Pressable
      onPress={() => router.push("/categories")}
      style={styles.bannerContainer}
    >
      <Image
        source={BANNER_IMAGE}
        style={styles.bannerImage}
        resizeMode="contain"
      />
    </Pressable>
  );

  const renderCategories = () => (
    <>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            Categories
          </Text>

          <Text style={styles.sectionSubtitle}>
            Find your everyday essentials
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/categories")}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAll}>
            See All
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={PREMIUM.primary}
          />
        </Pressable>
      </View>

      <View style={styles.categoryContainer}>
        <CategoryRow />
      </View>
    </>
  );

  const renderBestsellers = () => (
    <>
      <View style={styles.bestsellerSectionHeader}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            Bestsellers
          </Text>

          <Text style={styles.sectionSubtitle}>
            Popular choices from TWINTO
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/categories")}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAll}>
            See All
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={PREMIUM.primary}
          />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator
            size="large"
            color={PREMIUM.primary}
          />
        </View>
      ) : visibleProducts.length > 0 ? (
        <View style={styles.grid}>
      {visibleProducts.slice(0, 12).map((product) => (
  <View
    key={String(product.id)}
    style={[
      styles.productColumn,
      { width: productWidth },
    ]}
  >
    <ProductCard product={product} />
  </View>
))}
        </View>
      ) : (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cube-outline"
              size={28}
              color={PREMIUM.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            {search
              ? "No matching products"
              : "No products found"}
          </Text>

          <Text style={styles.emptyText}>
            {search
              ? "Try searching for another product."
              : "Products are currently unavailable."}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={PREMIUM.white}
      />

      {renderHeader()}

      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        contentContainerStyle={styles.scroll}
      >
        {renderSearchBar()}

        {renderBanner()}

        {renderCategories()}

        {renderBestsellers()}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  contentScroll: {
    flex: 1,
  },

  scroll: {
    paddingBottom: 30,
  },

  // HEADER

  header: {
    backgroundColor: PREMIUM.white,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F5EAF0",
  },

  locationSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  locationContent: {
    flex: 1,
    minWidth: 0,
  },

  deliverTo: {
    color: PREMIUM.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  locationName: {
    flexShrink: 1,
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "900",
    marginRight: 4,
  },

  timePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: PREMIUM.pinkSoft,
    borderRadius: 22,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginLeft: 8,
  },

  timeText: {
    color: PREMIUM.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  // SEARCH

  searchContainer: {
    marginTop: 14,
    paddingHorizontal: 18,
    zIndex: 10,
  },

  searchBar: {
    height: 47,
    backgroundColor: PREMIUM.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    color: PREMIUM.navy,
    fontSize: 12,
    paddingVertical: 0,
  },

  // SEARCH SUGGESTIONS

  suggestionBox: {
    backgroundColor: PREMIUM.white,
    borderRadius: 14,
    marginTop: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  suggestionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: PREMIUM.muted,
    marginBottom: 7,
    letterSpacing: 0.5,
  },

  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PREMIUM.border,
    gap: 10,
  },

  suggestionImageBox: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  suggestionImage: {
    width: "100%",
    height: "100%",
  },

  suggestionInfo: {
    flex: 1,
    minWidth: 0,
  },

  suggestionText: {
    fontSize: 12,
    color: PREMIUM.navy,
    fontWeight: "700",
  },

  suggestionPrice: {
    fontSize: 11,
    color: PREMIUM.primary,
    fontWeight: "800",
    marginTop: 3,
  },

  // BANNER

  bannerContainer: {
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 21,
    overflow: "hidden",
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
  },

  bannerImage: {
    width: "100%",
    aspectRatio: BANNER_RATIO,
    height: undefined,
  },

  // SECTION HEADERS

  sectionHeader: {
    marginTop: 25,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bestsellerSectionHeader: {
    marginTop: 27,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionHeading: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },

  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 8,
    paddingLeft: 10,
  },

  seeAll: {
    color: PREMIUM.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  // CATEGORIES

  categoryContainer: {
    marginTop: 17,
    paddingHorizontal: 10,
  },

  // THREE-COLUMN BESTSELLERS

  grid: {
    marginTop: 16,
    paddingHorizontal: GRID_PADDING,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    columnGap: GRID_GAP,
    rowGap: 12,
  },

  productColumn: {
    minWidth: 0,
    alignSelf: "flex-start",
  },

  // LOADING

  loadingBox: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  // EMPTY STATE

  empty: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 45,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "800",
    color: PREMIUM.navy,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 11,
    color: PREMIUM.muted,
    textAlign: "center",
  },

  bottomSpace: {
    height: 30,
  },
});
