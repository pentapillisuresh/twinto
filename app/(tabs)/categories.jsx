
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
  StatusBar,
  useWindowDimensions,
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
  gold: "#FFE19A",
};

const GRID_PADDING = 16;
const GRID_GAP = 10;
const GRID_COLUMNS = 3;

export default function Categories() {
  const { width } = useWindowDimensions();

  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // EXACTLY THREE COLUMNS
  const cardWidth =
    (width -
      GRID_PADDING * 2 -
      GRID_GAP * (GRID_COLUMNS - 1)) /
    GRID_COLUMNS;

  // ORIGINAL API AND PRODUCT COUNT LOGIC - UNCHANGED
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

  // ORIGINAL SEARCH FILTERING - UNCHANGED
  const visible = categories.filter((c) =>
    search
      ? c.name.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PREMIUM.primaryDark}
      />

      {/* FIXED PREMIUM HEADER */}
      <View style={styles.headerBackground}>
        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />

        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color={PREMIUM.white}
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

          <View style={styles.headerSpacer} />
        </View>

        {/* HEADER INFORMATION */}
        <View style={styles.headerInfo}>
          <View style={styles.headerInfoIcon}>
            <Ionicons
              name="grid-outline"
              size={19}
              color={PREMIUM.gold}
            />
          </View>

          <View style={styles.headerInfoText}>
            <Text style={styles.headerInfoTitle}>
              Shop your favorites
            </Text>

            <Text style={styles.headerInfoSubtitle}>
              Discover everything in one place
            </Text>
          </View>

          <View style={styles.totalBadge}>
            <Text style={styles.totalNumber}>
              {categories.length}
            </Text>

            <Text style={styles.totalLabel}>
              Categories
            </Text>
          </View>
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
            placeholder="Search categories..."
            placeholderTextColor={PREMIUM.muted}
            style={styles.searchInput}
            autoCorrect={false}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={PREMIUM.muted}
              />
            </Pressable>
          )}
        </View>

        {/* SECTION HEADING */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              All Categories
            </Text>

            <Text style={styles.sectionSubtitle}>
              Choose what you need
            </Text>
          </View>

          <View style={styles.resultsBadge}>
            <Text style={styles.resultsText}>
              {visible.length} items
            </Text>
          </View>
        </View>

        {/* ORIGINAL LOADING / EMPTY / GRID LOGIC */}
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={PREMIUM.primary}
            />
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
                    { width: cardWidth },
                    pressed && styles.cardPressed,
                  ]}
                >
                  {/* IMAGE */}
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
                        size={28}
                        color={PREMIUM.primary}
                      />
                    )}
                  </View>

                  {/* CATEGORY NAME */}
                  <Text
                    style={styles.name}
                    numberOfLines={2}
                  >
                    {category.name}
                  </Text>

                  {/* PRODUCT COUNT */}
                  <Text style={styles.count}>
                    {count}{" "}
                    {count === 1 ? "product" : "products"}
                  </Text>

                  {/* SMALL DECORATIVE ARROW */}
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

  // FIXED PREMIUM HEADER
  headerBackground: {
    backgroundColor: PREMIUM.primary,
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
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
    right: -100,
    top: -110,
  },

  headerCircleTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.04)",
    left: -60,
    bottom: -60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextBox: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  headerTitle: {
    color: PREMIUM.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 3,
  },

  headerSpacer: {
    width: 42,
    height: 42,
  },

  // HEADER INFORMATION
  headerInfo: {
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
  },

  headerInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerInfoText: {
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
    marginTop: 3,
  },

  totalBadge: {
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
  },

  totalNumber: {
    color: PREMIUM.white,
    fontSize: 14,
    fontWeight: "900",
  },

  totalLabel: {
    color: "#FFE0EB",
    fontSize: 8,
    fontWeight: "600",
  },

  // SCROLL
  contentScroll: {
    flex: 1,
  },

  scroll: {
    paddingBottom: 30,
  },

  // SEARCH
  searchBox: {
    height: 51,
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  searchIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  searchInput: {
    flex: 1,
    height: 49,
    marginHorizontal: 10,
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "500",
  },

  // SECTION
  sectionHeader: {
    marginTop: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    color: PREMIUM.muted,
    fontSize: 11,
    marginTop: 4,
  },

  resultsBadge: {
    backgroundColor: PREMIUM.pinkSoft,
    borderRadius: 20,
    paddingHorizontal: 11,
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
    marginTop: 17,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    columnGap: GRID_GAP,
    rowGap: 13,
  },

  // CATEGORY CARD
  card: {
    backgroundColor: PREMIUM.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    paddingBottom: 12,
    overflow: "hidden",
    minHeight: 150,
    alignItems: "center",
    shadowColor: "#7A2949",
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  imageBox: {
    width: "100%",
    height: 90,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM.pinkLight,
  },

  categoryImage: {
    width: "100%",
    height: "100%",
  },

  name: {
    marginTop: 9,
    paddingHorizontal: 5,
    color: PREMIUM.navy,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    textAlign: "center",
    minHeight: 30,
  },

  count: {
    marginTop: 3,
    marginBottom: 5,
    color: PREMIUM.muted,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },

  arrow: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  // LOADING
  loading: {
    paddingVertical: 80,
    alignItems: "center",
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
    height: 20,
  },
});
