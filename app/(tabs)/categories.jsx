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

import { categories, products } from "../../data";

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

export default function Categories() {
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

          {/* BACK BUTTON */}

          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.headerButton
            }
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color={
                PREMIUM.navy
              }
            />
          </Pressable>

          {/* TITLE */}

          <Text
            style={
              styles.title
            }
          >
            Categories
          </Text>

          {/* SEARCH BUTTON */}

          <Pressable
            style={
              styles.headerButton
            }
          >
            <Ionicons
              name="search-outline"
              size={23}
              color={
                PREMIUM.primary
              }
            />
          </Pressable>

        </View>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <View
          style={
            styles.searchBox
          }
        >

          <Ionicons
            name="search-outline"
            size={21}
            color={
              PREMIUM.primary
            }
          />

          <TextInput
            placeholder="Search categories..."
            placeholderTextColor={
              PREMIUM.muted
            }
            style={
              styles.searchInput
            }
            autoCorrect={false}
          />

        </View>

        {/* ==================================================
            CATEGORY GRID
        ================================================== */}

        <View
          style={
            styles.grid
          }
        >

          {categories
            .filter(
              (category) =>
                category.id !== "all"
            )
            .map((category) => {

              // ============================================
              // KEEPING YOUR ORIGINAL COUNT LOGIC
              // ============================================

              const count =
                products.filter(
                  (product) =>
                    product.cats.includes(
                      category.id
                    )
                ).length;

              // ============================================
              // SUPPORT LOCAL + REMOTE IMAGES
              // ============================================

              const imageSource =
                typeof category.image ===
                "string"
                  ? {
                      uri: category.image,
                    }
                  : category.image;

              return (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    router.push(
                      `/category/${category.id}`
                    )
                  }
                  style={({ pressed }) => [
                    styles.card,
                    pressed &&
                      styles.cardPressed,
                  ]}
                >

                  {/* ======================================
                      CATEGORY IMAGE
                  ====================================== */}

                  <View
                    style={
                      styles.imageBox
                    }
                  >

                    <Image
                      source={
                        imageSource
                      }
                      style={
                        styles.categoryImage
                      }
                      resizeMode="contain"
                    />

                  </View>

                  {/* ======================================
                      CATEGORY NAME
                  ====================================== */}

                  <Text
                    style={
                      styles.name
                    }
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>

                  {/* ======================================
                      PRODUCT COUNT
                  ====================================== */}

                  <Text
                    style={
                      styles.count
                    }
                  >
                    {count}{" "}
                    {count === 1
                      ? "product"
                      : "products"}
                  </Text>

                  {/* ======================================
                      ARROW
                  ====================================== */}

                  <View
                    style={
                      styles.arrow
                    }
                  >

                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={
                        PREMIUM.primary
                      }
                    />

                  </View>

                </Pressable>
              );
            })}

        </View>

        {/* ==================================================
            BOTTOM SPACE
        ================================================== */}

        <View
          style={
            styles.bottomSpace
          }
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
    paddingBottom: 30,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    paddingHorizontal: 16,

    paddingTop: 12,

    height: 62,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",
  },

  headerButton: {
    width: 40,

    height: 40,

    borderRadius: 13,

    alignItems: "center",

    justifyContent:
      "center",

    backgroundColor:
      PREMIUM.white,

    borderWidth: 1,

    borderColor:
      PREMIUM.border,
  },

  title: {
    flex: 1,

    textAlign: "center",

    marginHorizontal: 8,

    color:
      PREMIUM.navy,

    fontSize: 21,

    fontWeight: "900",
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchBox: {
    height: 48,

    marginHorizontal: 16,

    marginTop: 12,

    borderRadius: 15,

    backgroundColor:
      PREMIUM.pinkSoft,

    borderWidth: 1,

    borderColor:
      PREMIUM.pinkLight,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,

    height: 48,

    marginLeft: 9,

    color:
      PREMIUM.navy,

    fontSize: 12,

    fontWeight: "600",
  },

  // ==========================================================
  // GRID
  // ==========================================================

  grid: {
    paddingHorizontal: 16,

    marginTop: 18,

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",
  },

  // ==========================================================
  // CATEGORY CARD
  // ==========================================================

  card: {
    width: "31.8%",

    backgroundColor:
      PREMIUM.white,

    borderRadius: 16,

    borderWidth: 1,

    borderColor:
      PREMIUM.border,

    marginBottom: 13,

    paddingBottom: 11,

    overflow: "hidden",
  },

  cardPressed: {
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  // ==========================================================
  // IMAGE
  // ==========================================================

  imageBox: {
    width: "100%",

    height: 92,

    backgroundColor:
      PREMIUM.pinkSoft,

    alignItems: "center",

    justifyContent:
      "center",

    borderBottomWidth: 1,

    borderBottomColor:
      PREMIUM.pinkLight,
  },

  categoryImage: {
    width: "88%",

    height: "88%",
  },

  // ==========================================================
  // NAME
  // ==========================================================

  name: {
    marginTop: 8,

    paddingHorizontal: 5,

    color:
      PREMIUM.navy,

    fontSize: 11,

    lineHeight: 14,

    fontWeight: "900",

    textAlign: "center",
  },

  // ==========================================================
  // COUNT
  // ==========================================================

  count: {
    marginTop: 3,

    color:
      PREMIUM.muted,

    fontSize: 8,

    fontWeight: "600",

    textAlign: "center",
  },

  // ==========================================================
  // ARROW
  // ==========================================================

  arrow: {
    position: "absolute",

    right: 6,

    bottom: 6,

    width: 20,

    height: 20,

    borderRadius: 10,

    backgroundColor:
      PREMIUM.pinkSoft,

    alignItems: "center",

    justifyContent:
      "center",
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpace: {
    height: 20,
  },
});