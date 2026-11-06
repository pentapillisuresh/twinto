
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
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
  background: "#FFFAFC",
  pinkSoft: "#FFF0F5",
  pinkLight: "#FDE3EC",
  border: "#F0E3E8",
  muted: "#858B95",
  gold: "#FFE19A",
};

export default function Home() {
  const { location } = useLocation();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ORIGINAL PRODUCT API LOGIC
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

  const deliveryTime = location?.deliveryTime || "15 mins";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PREMIUM.primaryDark}
      />

      {/* FIXED PREMIUM HEADER - OUTSIDE SCROLLVIEW */}
      <View style={styles.headerBackground}>
        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />

        {/* LOCATION */}
        <Pressable
          onPress={() => router.push("/location")}
          style={styles.locationSection}
        >
          <View style={styles.locationIcon}>
            <Ionicons
              name="location"
              size={19}
              color={PREMIUM.white}
            />
          </View>

          <View style={styles.locationContent}>
            <Text style={styles.deliverTo}>
              DELIVER TO
            </Text>

            <View style={styles.locationRow}>
              <Text
                style={styles.location}
                numberOfLines={1}
              >
                {location?.name || "Select location"}
              </Text>

              <Ionicons
                name="chevron-down"
                size={14}
                color={PREMIUM.white}
              />
            </View>

            <Text style={styles.locationSubtitle}>
              Tap to change location
            </Text>
          </View>
        </Pressable>

        {/* DELIVERY INFORMATION */}
        <View style={styles.deliveryInformation}>
          <View style={styles.deliveryLeft}>
            <View style={styles.deliveryIcon}>
              <Ionicons
                name="flash"
                size={16}
                color={PREMIUM.gold}
              />
            </View>

            <View>
              <Text style={styles.deliveryLabel}>
                EXPRESS DELIVERY
              </Text>

              <Text style={styles.deliveryValue}>
                Delivered in {deliveryTime}
              </Text>
            </View>
          </View>

          <View style={styles.deliveryStatus}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              Available
            </Text>
          </View>
        </View>
      </View>

      {/* ONLY CONTENT SCROLLS */}
      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
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
          <View style={styles.sectionHeading}>
            <View style={styles.sectionAccent} />

            <View>
              <Text style={styles.sectionTitle}>
                Categories
              </Text>

              <Text style={styles.sectionSubtitle}>
                Find your everyday essentials
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/categories")}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAll}>
              View All
            </Text>

            <Ionicons
              name="arrow-forward"
              size={14}
              color={PREMIUM.primary}
            />
          </Pressable>
        </View>

        {/* FOUR-COLUMN CATEGORY COMPONENT */}
        <View style={styles.categoryContainer}>
          <CategoryRow />
        </View>

        {/* BESTSELLERS */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionAccent} />

            <View>
              <Text style={styles.sectionTitle}>
                Bestsellers
              </Text>

              <Text style={styles.sectionSubtitle}>
                Popular choices from TWINTO
              </Text>
            </View>
          </View>

          <View style={styles.trendingBadge}>
            <Ionicons
              name="flame"
              size={13}
              color={PREMIUM.primary}
            />

            <Text style={styles.trendingText}>
              Popular
            </Text>
          </View>
        </View>

        {/* PRODUCTS - ORIGINAL LOGIC */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color={PREMIUM.primary}
            />
          </View>
        ) : filteredProducts.length > 0 ? (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={String(product.id)}
                product={product}
              />
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
              No products found
            </Text>

            <Text style={styles.emptyText}>
              Products are currently unavailable.
            </Text>
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

  // FIXED HEADER
headerBackground: {
  backgroundColor: PREMIUM.primary,
  paddingTop: 50,       // More gap at top
  paddingHorizontal: 18,
  paddingBottom: 25,    // More gap at bottom
  borderBottomLeftRadius: 25,
  borderBottomRightRadius: 25,
  overflow: "hidden",
  zIndex: 10,
  elevation: 4,
},

  headerCircleOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.055)",
    right: -90,
    top: -100,
  },

  headerCircleTwo: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.04)",
    left: -60,
    bottom: -50,
  },

  locationSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  locationContent: {
    flex: 1,
    minWidth: 0,
  },

  deliverTo: {
    color: "#FFDCE9",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  location: {
    flexShrink: 1,
    color: PREMIUM.white,
    fontSize: 15,
    fontWeight: "800",
    marginRight: 5,
  },

  locationSubtitle: {
    color: "#FFE1EC",
    fontSize: 10,
    marginTop: 3,
    fontWeight: "500",
  },

  // DELIVERY INFORMATION
  deliveryInformation: {
    marginTop: 19,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  deliveryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  deliveryIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  deliveryLabel: {
    color: "#FFDCE9",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  deliveryValue: {
    color: PREMIUM.white,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },

  deliveryStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#B9FFD3",
  },

  statusText: {
    color: PREMIUM.white,
    fontSize: 10,
    fontWeight: "700",
  },

  // SCROLLABLE CONTENT
  contentScroll: {
    flex: 1,
  },

  scroll: {
    paddingBottom: 30,
  },

  // BANNER
  bannerContainer: {
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 21,
    overflow: "hidden",
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
  },

  bannerImage: {
    width: "100%",
    aspectRatio: 2048 / 768,
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

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  sectionAccent: {
    width: 3,
    height: 32,
    borderRadius: 3,
    backgroundColor: PREMIUM.primary,
    marginRight: 10,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 3,
    fontWeight: "500",
  },

  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PREMIUM.pinkSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 4,
    marginLeft: 8,
  },

  seeAll: {
    color: PREMIUM.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  // CATEGORIES
  categoryContainer: {
    marginTop: 15,
    paddingHorizontal: 10,
  },

  // TRENDING
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PREMIUM.pinkSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 5,
    marginLeft: 8,
  },

  trendingText: {
    color: PREMIUM.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  // PRODUCT GRID
  grid: {
    paddingHorizontal: 18,
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 12,
  },

  loadingBox: {
    paddingVertical: 60,
    alignItems: "center",
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
  },

  emptyText: {
    marginTop: 5,
    fontSize: 11,
    color: PREMIUM.muted,
    textAlign: "center",
  },

  bottomSpace: {
    height: 25,
  },
});
