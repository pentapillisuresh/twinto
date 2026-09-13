import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCart } from "../../context";

// ============================================================
// PREMIUM COLORS
// ============================================================

const COLORS = {
  primary: "#C9004F",
  primaryDark: "#A90042",
  primaryLight: "#FFF0F5",

  white: "#FFFFFF",

  background: "#FFF9FB",

  text: "#172033",
  textSecondary: "#59606D",
  muted: "#858B95",

  border: "#E7DCE2",

  imageBackground: "#F4F1EA",

  star: "#F4B400",
};

export default function ProductCard({
  product,
  item,
}) {
  const router = useRouter();

  const {
    cart = [],
    addToCart,
    increase,
    decrease,
  } = useCart();

  const currentProduct = product || item;

  if (!currentProduct) {
    return null;
  }

  // ==========================================================
  // FIND PRODUCT IN CART
  // ==========================================================

  const cartItem = cart.find((cartProduct) => {
    if (!cartProduct) {
      return false;
    }

    const cartProductId =
      cartProduct.id ??
      cartProduct.product?.id;

    return (
      String(cartProductId) ===
      String(currentProduct.id)
    );
  });

  const quantity =
    Number(cartItem?.quantity) || 0;

  // ==========================================================
  // OPEN PRODUCT
  // ==========================================================

  function openProduct() {
    router.push(
      `/product/${currentProduct.id}`
    );
  }

  // ==========================================================
  // ADD
  // ==========================================================

  function addProduct() {
    addToCart(currentProduct);
  }

  // ==========================================================
  // INCREASE
  // ==========================================================

  function increaseProduct() {
    increase(currentProduct.id);
  }

  // ==========================================================
  // DECREASE
  // ==========================================================

  function decreaseProduct() {
    decrease(currentProduct.id);
  }

  // ==========================================================
  // IMAGE SOURCE
  // ==========================================================

  const imageSource =
    typeof currentProduct.image === "string"
      ? {
          uri: currentProduct.image,
        }
      : currentProduct.image;

  return (
    <Pressable
      onPress={openProduct}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* ====================================================
          IMAGE CARD
      ==================================================== */}

      <View style={styles.imageCard}>

        {/* PRODUCT IMAGE */}

        <Image
          source={imageSource}
          style={styles.productImage}
          resizeMode="contain"
        />

        {/* ==================================================
            HEART
        ================================================== */}

        <Pressable
          style={styles.favoriteButton}
          onPress={(event) => {
            event.stopPropagation();
          }}
        >
          <Ionicons
            name="heart-outline"
            size={18}
            color={COLORS.white}
          />
        </Pressable>

        {/* ==================================================
            PRODUCT TYPE INDICATOR
        ================================================== */}

        <View style={styles.productTypeIcon}>
          <View style={styles.productTypeDot} />
        </View>

        {/* ==================================================
            ADD / QUANTITY
        ================================================== */}

        {quantity === 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={(event) => {
              event.stopPropagation();
              addProduct();
            }}
          >
            <Ionicons
              name="add"
              size={22}
              color={COLORS.primary}
            />
          </Pressable>
        ) : (
          <View style={styles.quantityContainer}>

            {/* MINUS */}

            <Pressable
              style={styles.quantityButton}
              onPress={(event) => {
                event.stopPropagation();
                decreaseProduct();
              }}
            >
              <Ionicons
                name="remove"
                size={14}
                color={COLORS.primary}
              />
            </Pressable>

            {/* NUMBER */}

            <Text style={styles.quantity}>
              {quantity}
            </Text>

            {/* PLUS */}

            <Pressable
              style={styles.quantityButton}
              onPress={(event) => {
                event.stopPropagation();
                increaseProduct();
              }}
            >
              <Ionicons
                name="add"
                size={14}
                color={COLORS.primary}
              />
            </Pressable>

          </View>
        )}
      </View>

      {/* ====================================================
          CONTENT OUTSIDE IMAGE CARD
      ==================================================== */}

      <View style={styles.details}>

        {/* ==================================================
            DISCOUNT
        ================================================== */}

        {currentProduct.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {currentProduct.discount}% OFF
            </Text>
          </View>
        )}

        {/* ==================================================
            PRICE
        ================================================== */}

        <View style={styles.priceRow}>

          <Text style={styles.price}>
            ₹{currentProduct.price}
          </Text>

          {currentProduct.mrp >
            currentProduct.price && (
            <Text style={styles.mrp}>
              ₹{currentProduct.mrp}
            </Text>
          )}

        </View>

        {/* ==================================================
            CATEGORY
        ================================================== */}

        <Text
          style={styles.category}
          numberOfLines={1}
        >
          {currentProduct.category}
        </Text>

        {/* ==================================================
            PRODUCT NAME
        ================================================== */}

        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {currentProduct.name}
        </Text>

        {/* ==================================================
            WEIGHT
        ================================================== */}

        <Text
          style={styles.weight}
          numberOfLines={1}
        >
          {currentProduct.weight}
        </Text>

        {/* ==================================================
            DELIVERY
        ================================================== */}

        <View style={styles.deliveryRow}>

          <Ionicons
            name="flash"
            size={11}
            color={COLORS.primary}
          />

          <Text style={styles.delivery}>
            {currentProduct.delivery}
          </Text>

        </View>

      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({

  // ==========================================================
  // MAIN CARD
  // ==========================================================

  card: {
    width: "31.5%",

    backgroundColor: "transparent",

    marginBottom: 14,

    overflow: "visible",
  },

  cardPressed: {
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  // ==========================================================
  // IMAGE CARD
  // ==========================================================

  imageCard: {
    width: "100%",

    height: 108,

    backgroundColor:
      COLORS.imageBackground,

    borderRadius: 12,

    position: "relative",

    alignItems: "center",
    justifyContent: "center",

    overflow: "visible",

    borderWidth: 1,

    borderColor: COLORS.border,
  },

  // ==========================================================
  // PRODUCT IMAGE
  // ==========================================================

  productImage: {
    width: "100%",
    height: "100%",
  },

  // ==========================================================
  // HEART
  // ==========================================================

  favoriteButton: {
    position: "absolute",

    top: 7,
    right: 7,

    width: 27,
    height: 27,

    borderRadius: 14,

    backgroundColor:
      "rgba(40, 40, 40, 0.30)",

    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // PRODUCT TYPE INDICATOR
  // ==========================================================

  productTypeIcon: {
    position: "absolute",

    left: 7,
    bottom: 7,

    width: 19,
    height: 19,

    borderRadius: 3,

    backgroundColor: COLORS.white,

    borderWidth: 2,

    borderColor: COLORS.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  productTypeDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: COLORS.primary,
  },

  // ==========================================================
  // ADD BUTTON
  // ==========================================================

  addButton: {
    position: "absolute",

    right: 5,
    bottom: -12,

    width: 38,
    height: 38,

    borderRadius: 8,

    backgroundColor: COLORS.white,

    borderWidth: 1.5,

    borderColor: COLORS.primary,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,
    shadowRadius: 4,

    elevation: 4,
  },

  addButtonPressed: {
    backgroundColor:
      COLORS.primaryLight,

    transform: [
      {
        scale: 0.90,
      },
    ],
  },

  // ==========================================================
  // QUANTITY
  // ==========================================================

  quantityContainer: {
    position: "absolute",

    right: 5,
    bottom: -12,

    height: 38,

    minWidth: 70,

    borderRadius: 8,

    backgroundColor: COLORS.white,

    borderWidth: 1.5,

    borderColor: COLORS.primary,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 2,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,
    shadowRadius: 4,

    elevation: 4,
  },

  quantityButton: {
    width: 23,
    height: 32,

    alignItems: "center",
    justifyContent: "center",
  },

  quantity: {
    minWidth: 18,

    textAlign: "center",

    color: COLORS.primary,

    fontSize: 12,

    fontWeight: "900",
  },

  // ==========================================================
  // DETAILS
  // ==========================================================

  details: {
    paddingTop: 16,

    paddingHorizontal: 3,

    paddingBottom: 2,
  },

  // ==========================================================
  // DISCOUNT
  // ==========================================================

  discountBadge: {
    alignSelf: "flex-start",

    backgroundColor:
      COLORS.primary,

    paddingHorizontal: 6,

    paddingVertical: 3,

    borderRadius: 3,

    marginBottom: 4,
  },

  discountText: {
    color: COLORS.white,

    fontSize: 8,

    lineHeight: 10,

    fontWeight: "900",
  },

  // ==========================================================
  // PRICE
  // ==========================================================

  priceRow: {
    flexDirection: "row",

    alignItems: "baseline",

    marginBottom: 2,
  },

  price: {
    color: COLORS.text,

    fontSize: 14,

    fontWeight: "900",
  },

  mrp: {
    color: COLORS.muted,

    fontSize: 8,

    textDecorationLine:
      "line-through",

    marginLeft: 4,
  },

  // ==========================================================
  // CATEGORY
  // ==========================================================

  category: {
    color: COLORS.muted,

    fontSize: 8,

    fontWeight: "700",

    marginTop: 1,
  },

  // ==========================================================
  // NAME
  // ==========================================================

  name: {
    color: COLORS.text,

    fontSize: 11,

    lineHeight: 14,

    fontWeight: "800",

    marginTop: 1,
  },

  // ==========================================================
  // WEIGHT
  // ==========================================================

  weight: {
    color: COLORS.primary,

    fontSize: 9,

    lineHeight: 12,

    fontWeight: "800",

    marginTop: 2,
  },

  // ==========================================================
  // DELIVERY
  // ==========================================================

  deliveryRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 2,
  },

  delivery: {
    color: COLORS.textSecondary,

    fontSize: 8,

    fontWeight: "700",

    marginLeft: 2,
  },
});