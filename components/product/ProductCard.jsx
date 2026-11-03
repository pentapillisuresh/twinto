
import { useState } from "react";
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
import { getImageUrl } from "../../utils/imageUrl";

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
};

export default function ProductCard({ product, item }) {
  const router = useRouter();

  const {
    cart = [],
    addToCart,
    increase,
    decrease,
  } = useCart();

  const currentProduct = product || item;

  const [imageFailed, setImageFailed] = useState(false);

  if (!currentProduct) return null;

  const cartItem = cart.find((c) => {
    if (!c) return false;

    const cid = c.id ?? c.product?.id;

    return String(cid) === String(currentProduct.id);
  });

  const quantity = Number(cartItem?.quantity) || 0;

  // Convert localhost URLs into the Android-accessible backend URL.
  const imageUrl = getImageUrl(
    currentProduct.image ||
      currentProduct.imageUrl ||
      currentProduct.image_url
  );

  return (
    <Pressable
      onPress={() =>
        router.push(`/product/${currentProduct.id}`)
      }
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* PRODUCT IMAGE */}
      <View style={styles.imageCard}>
        {imageUrl && !imageFailed ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(event) => {
              console.log(
                "[PRODUCT IMAGE FAILED]",
                currentProduct.name,
                imageUrl,
                event.nativeEvent?.error
              );

              setImageFailed(true);
            }}
            onLoad={() => {
              console.log(
                "[PRODUCT IMAGE LOADED]",
                currentProduct.name
              );
            }}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="image-outline"
              size={32}
              color={COLORS.muted}
            />
          </View>
        )}

        {/* FAVORITE ICON */}
        <View style={styles.favoriteButton}>
          <Ionicons
            name="heart-outline"
            size={18}
            color={COLORS.white}
          />
        </View>

        {/* ADD TO CART */}
        {quantity === 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={(event) => {
              event.stopPropagation();
              addToCart(currentProduct);
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
            <Pressable
              style={styles.quantityButton}
              onPress={(event) => {
                event.stopPropagation();
                decrease(currentProduct.id);
              }}
            >
              <Ionicons
                name="remove"
                size={14}
                color={COLORS.primary}
              />
            </Pressable>

            <Text style={styles.quantity}>
              {quantity}
            </Text>

            <Pressable
              style={styles.quantityButton}
              onPress={(event) => {
                event.stopPropagation();
                increase(currentProduct.id);
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

      {/* PRODUCT DETAILS */}
      <View style={styles.details}>
        {currentProduct.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {currentProduct.discount}% OFF
            </Text>
          </View>
        )}

        {/* PRICE */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ₹{currentProduct.price}
          </Text>

          {currentProduct.mrp > currentProduct.price && (
            <Text style={styles.mrp}>
              ₹{currentProduct.mrp}
            </Text>
          )}
        </View>

        {/* CATEGORY */}
        <Text
          style={styles.category}
          numberOfLines={1}
        >
          {currentProduct.category}
        </Text>

        {/* NAME */}
        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {currentProduct.name}
        </Text>

        {/* WEIGHT / UNIT */}
        <Text
          style={styles.weight}
          numberOfLines={1}
        >
          {currentProduct.weight || currentProduct.unit}
        </Text>

        {/* DELIVERY */}
        <View style={styles.deliveryRow}>
          <Ionicons
            name="flash"
            size={11}
            color={COLORS.primary}
          />

          <Text style={styles.delivery}>
            {currentProduct.delivery || "15 mins"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "31.5%",
    backgroundColor: "transparent",
    marginBottom: 14,
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
  },

  imageCard: {
    width: "100%",
    height: 108,
    backgroundColor: COLORS.imageBackground,
    borderRadius: 12,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 11,
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteButton: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "rgba(40,40,40,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },

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
    elevation: 4,
  },

  addButtonPressed: {
    backgroundColor: COLORS.primaryLight,
    transform: [{ scale: 0.9 }],
  },

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

  details: {
    paddingTop: 16,
    paddingHorizontal: 3,
    paddingBottom: 2,
  },

  discountBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
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
    textDecorationLine: "line-through",
    marginLeft: 4,
  },

  category: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "700",
    marginTop: 1,
  },

  name: {
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    marginTop: 1,
  },

  weight: {
    color: COLORS.primary,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
    marginTop: 2,
  },

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
