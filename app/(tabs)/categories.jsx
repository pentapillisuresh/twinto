
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
  Platform,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const GRID_PADDING = 12;
const GRID_GAP = 9;
const GRID_COLUMNS = 3;

export default function Categories() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ORIGINAL THREE-COLUMN GRID
  const cardWidth =
    (width -
      GRID_PADDING * 2 -
      GRID_GAP * (GRID_COLUMNS - 1)) /
    GRID_COLUMNS;

  // ORIGINAL API AND PRODUCT COUNT LOGIC
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
            c[p.categoryId] =
              (c[p.categoryId] || 0) + 1;
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

  // ORIGINAL SEARCH FILTER
  const visible = categories.filter((c) =>
    search
      ? c.name
          .toLowerCase()
          .includes(search.toLowerCase())
      : true
  );

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" &&
      Platform.Version >= 35)
      ? insets.top
      : 0;

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

      {/* WHITE HEADER - LIKE FRESH FRUITS */}
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

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>
            Categories
          </Text>

          <Text style={styles.headerSubtitle}>
            Explore TWINTO collections
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons
            name="grid-outline"
            size={22}
            color={PREMIUM.primary}
          />
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
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

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={PREMIUM.muted}
              />
            </Pressable>
          )}
        </View>

        {/* COMPACT SECTION HEADING */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>
              All Categories
            </Text>

            <Text style={styles.sectionSubtitle}>
              {visible.length}{" "}
              {visible.length === 1
                ? "category"
                : "categories"}{" "}
              available
            </Text>
          </View>

          <View style={styles.resultsBadge}>
            <Ionicons
              name="grid-outline"
              size={14}
              color={PREMIUM.primary}
            />

            <Text style={styles.resultsText}>
              {visible.length}
            </Text>
          </View>
        </View>

        {/* ORIGINAL LOADING / EMPTY / GRID */}
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={PREMIUM.primary}
            />

            <Text style={styles.loadingText}>
              Loading categories...
            </Text>
          </View>
        ) : visible.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="search-outline"
                size={28}
                color={PREMIUM.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No categories found
            </Text>

            <Text style={styles.emptyText}>
              Try searching for another category.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {visible.map((category) => {
              const count =
                counts[category.id] || 0;

              const imageSource = category.image
                ? { uri: category.image }
                : null;

              return (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    router.push(
                      `/category/${category.slug}`
                    )
                  }
                  style={({ pressed }) => [
                    styles.card,
                    { width: cardWidth },
                    pressed && styles.cardPressed,
                  ]}
                >
                  {/* LARGER IMAGE */}
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
                        size={29}
                        color={PREMIUM.primary}
                      />
                    )}
                  </View>

                  {/* COMPACT NAME AND COUNT */}
                  <View style={styles.cardDetails}>
                    <Text
                      style={styles.name}
                      numberOfLines={2}
                    >
                      {category.name}
                    </Text>

                    <Text
                      style={styles.count}
                      numberOfLines={1}
                    >
                      {count}{" "}
                      {count === 1
                        ? "product"
                        : "products"}
                    </Text>
                  </View>

                  {/* ORIGINAL ARROW */}
                  <View style={styles.arrow}>
                    <Ionicons
                      name="arrow-forward"
                      size={12}
                      color={PREMIUM.primary}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

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

  // WHITE HEADER
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
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextBox: {
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

  headerRight: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  // SCROLL
  contentScroll: {
    flex: 1,
  },

  scroll: {
    paddingBottom: 25,
  },

  // SEARCH
  searchBox: {
    height: 47,
    marginHorizontal: 13,
    marginTop: 15,
    borderRadius: 14,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "500",
    paddingVertical: 0,
  },

  clearButton: {
    padding: 4,
  },

  // REDUCED HEADING SPACING
  sectionHeader: {
    marginTop: 15,
    paddingHorizontal: 13,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionText: {
    flex: 1,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },

  resultsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: PREMIUM.pinkSoft,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  resultsText: {
    color: PREMIUM.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  // THREE-COLUMN GRID
  grid: {
    paddingHorizontal: GRID_PADDING,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    columnGap: GRID_GAP,
    rowGap: 9,
  },

  // COMPACT CARD
  card: {
    backgroundColor: PREMIUM.white,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    overflow: "hidden",
    alignItems: "center",
    paddingBottom: 5,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },

  // IMAGE HEIGHT INCREASED
  imageBox: {
    width: "100%",
    height: 112,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  categoryImage: {
    width: "100%",
    height: "100%",
  },

  // LESS SPACE BELOW IMAGE
  cardDetails: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingTop: 4,
  },

  name: {
    color: PREMIUM.navy,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    textAlign: "center",
    minHeight: 24,
    includeFontPadding: false,
  },

  count: {
    color: PREMIUM.muted,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 1,
    includeFontPadding: false,
  },

  // ARROW
  arrow: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
  },

  // LOADING
  loading: {
    paddingVertical: 80,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: PREMIUM.muted,
    fontSize: 12,
    fontWeight: "600",
  },

  // EMPTY
  empty: {
    paddingVertical: 80,
    alignItems: "center",
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 14,
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "800",
  },

  emptyText: {
    color: PREMIUM.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },

  bottomSpace: {
    height: 12,
  },
});
