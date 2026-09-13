import { useEffect, useState } from "react";

import {
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

import { products } from "../../data";
import { useLocation } from "../../context";

import CategoryRow from "../../components/home/CategoryRow";
import ProductCard from "../../components/product/ProductCard";

// ============================================================
// PREMIUM COLORS
// ============================================================

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

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [search, setSearch] = useState("");

  const [filteredProducts, setFilteredProducts] =
    useState(products);

  // ==========================================================
  // SEARCH FILTER
  // ==========================================================

  useEffect(() => {
    const value =
      search.toLowerCase().trim();

    if (!value) {
      setFilteredProducts(products);
      return;
    }

    setFilteredProducts(
      products.filter((product) => {
        const name =
          String(product.name || "")
            .toLowerCase();

        const category =
          String(product.category || "")
            .toLowerCase();

        const description =
          String(product.description || "")
            .toLowerCase();

        return (
          name.includes(value) ||
          category.includes(value) ||
          description.includes(value)
        );
      })
    );
  }, [search]);

  // ==========================================================
  // DELIVERY TIME
  // ==========================================================

  const deliveryTime =
    location?.deliveryTime ||
    "15 mins";

  return (
    <View style={styles.container}>

      {/* ====================================================
          MAIN SCROLL
      ==================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scroll
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>

          {/* LOCATION */}

          <Pressable
            onPress={() =>
              router.push("/location")
            }
            style={
              styles.locationSection
            }
          >

            <View
              style={
                styles.locationIcon
              }
            >
              <Ionicons
                name="location"
                size={20}
                color={
                  PREMIUM.primary
                }
              />
            </View>

            <View
              style={
                styles.locationContent
              }
            >

              <Text
                style={
                  styles.deliverTo
                }
              >
                DELIVER TO
              </Text>

              <View
                style={
                  styles.locationRow
                }
              >

                <Text
                  style={
                    styles.location
                  }
                  numberOfLines={1}
                >
                  {location?.name ||
                    "Anantapur"}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={15}
                  color={
                    PREMIUM.navy
                  }
                />

              </View>

            </View>

          </Pressable>

          {/* ==================================================
              DELIVERY TIME
          ================================================== */}

          <View
            style={
              styles.deliveryPill
            }
          >

            <View
              style={
                styles.deliveryIcon
              }
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={
                  PREMIUM.primary
                }
              />
            </View>

            <Text
              style={
                styles.deliveryTime
              }
            >
              {deliveryTime}
            </Text>

          </View>

        </View>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <View style={styles.searchBox}>

          <Ionicons
            name="search-outline"
            size={22}
            color={
              PREMIUM.primary
            }
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for products, categories or brands..."
            placeholderTextColor="#969DAA"
            style={
              styles.searchInput
            }
            returnKeyType="search"
            autoCorrect={false}
          />

          <Ionicons
            name="mic-outline"
            size={21}
            color="#687181"
          />

        </View>

        {/* ==================================================
            HERO BANNER
            FULL IMAGE - NO CROPPING
        ================================================== */}

        <Pressable
          onPress={() =>
            router.push(
              "/categories"
            )
          }
          style={
            styles.bannerContainer
          }
        >

          <Image
            source={require(
              "../../assets/images/homebanner.png"
            )}
            style={
              styles.bannerImage
            }
            resizeMode="contain"
          />

        </Pressable>

        {/* ==================================================
            CATEGORIES
            DOTS REMOVED
        ================================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Categories
          </Text>

          <Pressable
            onPress={() =>
              router.push(
                "/categories"
              )
            }
            style={
              styles.seeAllButton
            }
          >

            <Text
              style={
                styles.seeAll
              }
            >
              See All
            </Text>

            <Ionicons
              name="chevron-forward"
              size={17}
              color={
                PREMIUM.primary
              }
            />

          </Pressable>

        </View>

        <View
          style={
            styles.categoryContainer
          }
        >
          <CategoryRow />
        </View>

        {/* ==================================================
            BESTSELLERS
        ================================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >

          <View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              {search
                ? "Search results"
                : "Bestsellers"}
            </Text>

            {!search && (
              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Popular choices from TWINTO
              </Text>
            )}

          </View>

          {!search && (
            <Pressable
              onPress={() =>
                router.push(
                  "/categories"
                )
              }
              style={
                styles.seeAllButton
              }
            >

              <Text
                style={
                  styles.seeAll
                }
              >
                See All
              </Text>

              <Ionicons
                name="chevron-forward"
                size={17}
                color={
                  PREMIUM.primary
                }
              />

            </Pressable>
          )}

        </View>

        {/* ==================================================
            PRODUCTS
            ALL PRODUCTS
        ================================================== */}

        {filteredProducts.length > 0 ? (

          <View
            style={
              styles.grid
            }
          >

            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </View>

        ) : (

          <View
            style={
              styles.empty
            }
          >

            <View
              style={
                styles.emptyIcon
              }
            >

              <Ionicons
                name="search-outline"
                size={30}
                color={
                  PREMIUM.primary
                }
              />

            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No products found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try searching for something else.
            </Text>

          </View>
        )}

        {/* ==================================================
            DAILY DEALS
        ================================================== */}

        {!search && (

          <Pressable
            onPress={() =>
              router.push(
                "/categories"
              )
            }
            style={
              styles.dealCard
            }
          >

            <View
              style={
                styles.dealIcon
              }
            >

              <Ionicons
                name="pricetag"
                size={25}
                color={
                  PREMIUM.white
                }
              />

            </View>

            <View
              style={
                styles.dealContent
              }
            >

              <Text
                style={
                  styles.dealTitle
                }
              >
                Fresh Deals Every Day
              </Text>

              <Text
                style={
                  styles.dealText
                }
              >
                Up to 50% OFF on selected products
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={23}
              color={
                PREMIUM.primary
              }
            />

          </Pressable>
        )}

        {/* ==================================================
            BOTTOM SPACE
        ================================================== */}

        <View
          style={{
            height: 25,
          }}
        />

      </ScrollView>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {
    flex: 1,

    backgroundColor:
      PREMIUM.background,
  },

  scroll: {
    paddingTop: 8,
    paddingBottom: 20,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    paddingHorizontal: 18,

    paddingTop: 25,

    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent:
      "space-between",
  },

  // ==========================================================
  // LOCATION
  // ==========================================================

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

    backgroundColor:
      PREMIUM.pinkSoft,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,

    borderWidth: 1,

    borderColor:
      PREMIUM.pinkLight,
  },

  locationContent: {
    flex: 1,
  },

  deliverTo: {
    color:
      PREMIUM.muted,

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1,
  },

  locationRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 2,
  },

  location: {
    color:
      PREMIUM.navy,

    fontSize: 15,

    fontWeight: "900",

    maxWidth: 175,

    marginRight: 3,
  },

  // ==========================================================
  // DELIVERY TIME
  // MOVED DOWN SLIGHTLY
  // ==========================================================

  deliveryPill: {
    height: 43,

    minWidth: 94,

    paddingHorizontal: 10,

    borderRadius: 22,

    backgroundColor:
      PREMIUM.pinkSoft,

    borderWidth: 1,

    borderColor:
      PREMIUM.pinkLight,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "center",

    marginTop: 14,
  },

  deliveryIcon: {
    marginRight: 5,
  },

  deliveryTime: {
    color:
      PREMIUM.primary,

    fontSize: 13,

    fontWeight: "900",
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchBox: {
    height: 50,

    marginHorizontal: 18,

    marginTop: 16,

    borderRadius: 17,

    backgroundColor:
      PREMIUM.white,

    borderWidth: 1,

    borderColor:
      PREMIUM.border,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,

    height: 50,

    marginHorizontal: 9,

    color:
      PREMIUM.navy,

    fontSize: 12,

    fontWeight: "500",
  },

  // ==========================================================
  // BANNER
  // FULL IMAGE
  // ==========================================================

  bannerContainer: {
    marginHorizontal: 18,

    marginTop: 18,

    borderRadius: 22,

    overflow: "hidden",

    backgroundColor:
      PREMIUM.pinkSoft,

    alignItems: "center",

    justifyContent: "center",
  },

  bannerImage: {
    width: "100%",

    aspectRatio: 2048 / 768,

    height: undefined,
  },

  // ==========================================================
  // SECTION HEADER
  // ==========================================================

  sectionHeader: {
    marginTop: 14,

    paddingHorizontal: 18,

    flexDirection: "row",

    alignItems: "flex-end",

    justifyContent:
      "space-between",
  },

  sectionTitle: {
    color:
      PREMIUM.navy,

    fontSize: 21,

    fontWeight: "900",

    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    color:
      PREMIUM.muted,

    fontSize: 10,

    marginTop: 4,
  },

  seeAllButton: {
    flexDirection: "row",

    alignItems: "center",

    paddingVertical: 5,
  },

  seeAll: {
    color:
      PREMIUM.primary,

    fontSize: 12,

    fontWeight: "900",
  },

  // ==========================================================
  // CATEGORY
  // ==========================================================

  categoryContainer: {
    marginTop: 8,
  },

  // ==========================================================
  // PRODUCT GRID
  // ==========================================================

  grid: {
    paddingHorizontal: 18,

    marginTop: 14,

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    alignItems: "center",

    paddingHorizontal: 30,

    paddingVertical: 45,
  },

  emptyIcon: {
    width: 62,

    height: 62,

    borderRadius: 21,

    backgroundColor:
      PREMIUM.pinkSoft,

    alignItems: "center",

    justifyContent:
      "center",
  },

  emptyTitle: {
    marginTop: 14,

    fontSize: 17,

    fontWeight: "900",

    color:
      PREMIUM.navy,
  },

  emptyText: {
    marginTop: 5,

    fontSize: 12,

    color:
      PREMIUM.muted,
  },

  // ==========================================================
  // DEAL CARD
  // ==========================================================

  dealCard: {
    marginHorizontal: 18,

    marginTop: 22,

    minHeight: 92,

    borderRadius: 20,

    backgroundColor:
      PREMIUM.pinkSoft,

    borderWidth: 1,

    borderColor:
      PREMIUM.pinkLight,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 15,
  },

  dealIcon: {
    width: 51,

    height: 51,

    borderRadius: 17,

    backgroundColor:
      PREMIUM.primary,

    alignItems: "center",

    justifyContent:
      "center",
  },

  dealContent: {
    flex: 1,

    marginLeft: 13,

    marginRight: 8,
  },

  dealTitle: {
    color:
      PREMIUM.navy,

    fontSize: 15,

    fontWeight: "900",
  },

  dealText: {
    color:
      PREMIUM.muted,

    fontSize: 11,

    marginTop: 4,
  },
});