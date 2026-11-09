
import { useRef, useState } from "react";

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
import { useFlyToCart } from "../cart/FlyToCart";

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
  imageBackground: "#F8F5F5",
};

export default function ProductCard({
  product,
  item,
}) {
  const router = useRouter();

  const imageRef = useRef(null);

  const flyToCart = useFlyToCart();

  const {
    cart = [],
    addToCart,
    increase,
    decrease,
  } = useCart();

  const currentProduct = product || item;

  const [imageFailed, setImageFailed] =
    useState(false);

  if (!currentProduct) return null;

  const cartItem = cart.find((c) => {
    if (!c) return false;

    const cid = c.id ?? c.product?.id;

    return (
      String(cid) ===
      String(currentProduct.id)
    );
  });

  const quantity =
    Number(cartItem?.quantity) || 0;

  const imageUrl = getImageUrl(
    currentProduct.image ||
      currentProduct.imageUrl ||
      currentProduct.image_url
  );

  const price =
    Number(currentProduct.price) || 0;

  const mrp =
    Number(currentProduct.mrp) || 0;

  const discount =
    mrp > price && mrp > 0
      ? Math.round(
          ((mrp - price) / mrp) * 100
        )
      : Number(currentProduct.discount) || 0;

  const productUnit =
    currentProduct.weight ||
    currentProduct.unit ||
    "";

  const deliveryTime =
    currentProduct.delivery || "15 mins";

  const formatPrice = (value) =>
    Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  // Animate from the product image to the Cart tab.
  const animateProductToCart = () => {
    if (
      !imageUrl ||
      imageFailed ||
      typeof flyToCart !== "function"
    ) {
      return;
    }

    imageRef.current?.measureInWindow(
      (x, y, width, height) => {
        if (!width || !height) return;

        flyToCart({
          imageUrl,
          startX: x + width / 2,
          startY: y + height / 2,
          size: Math.min(width, height, 75),
        });
      }
    );
  };

  const handleAdd = (event) => {
    event?.stopPropagation?.();

    animateProductToCart();

    addToCart(currentProduct);
  };

  const handleIncrease = (event) => {
    event?.stopPropagation?.();

    animateProductToCart();

    increase(currentProduct.id);
  };

  const handleDecrease = (event) => {
    event?.stopPropagation?.();

    decrease(currentProduct.id);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() =>
        router.push(
          `/product/${currentProduct.id}`
        )
      }
    >
      {/* PRODUCT IMAGE */}

      <View
        ref={imageRef}
        collapsable={false}
        style={styles.imageContainer}
      >
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
              size={28}
              color={COLORS.muted}
            />
          </View>
        )}

        {/* FAVORITE ICON */}

        <View style={styles.favoriteButton}>
          <Ionicons
            name="heart-outline"
            size={17}
            color={COLORS.white}
          />
        </View>

        {/* DISCOUNT BADGE */}

        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {discount}% OFF
            </Text>
          </View>
        )}

        {/* ADD / QUANTITY */}

        {quantity === 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={handleAdd}
          >
            <Text style={styles.addText}>
              ADD
            </Text>
          </Pressable>
        ) : (
          <View style={styles.quantityContainer}>
            <Pressable
              style={styles.quantityButton}
              onPress={handleDecrease}
            >
              <Ionicons
                name="remove"
                size={15}
                color={COLORS.white}
              />
            </Pressable>

            <Text style={styles.quantity}>
              {quantity}
            </Text>

            <Pressable
              style={styles.quantityButton}
              onPress={handleIncrease}
            >
              <Ionicons
                name="add"
                size={15}
                color={COLORS.white}
              />
            </Pressable>
          </View>
        )}
      </View>

      {/* PRODUCT INFORMATION */}

      <View style={styles.details}>
        <View style={styles.deliveryBadge}>
          <Ionicons
            name="flash"
            size={10}
            color={COLORS.primary}
          />

          <Text
            style={styles.deliveryText}
            numberOfLines={1}
          >
            {deliveryTime}
          </Text>
        </View>

        <Text
          style={styles.productName}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {currentProduct.name}
        </Text>

        <Text
          style={styles.unit}
          numberOfLines={1}
        >
          {productUnit}
        </Text>

        <View style={styles.priceRow}>
          <Text
            style={styles.price}
            numberOfLines={1}
          >
            ₹{formatPrice(price)}
          </Text>

          {mrp > price && (
            <Text
              style={styles.mrp}
              numberOfLines={1}
            >
              ₹{formatPrice(mrp)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "transparent",
    marginBottom: 4,
  },

  cardPressed: {
    opacity: 0.85,
  },

  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: COLORS.imageBackground,
    borderRadius: 13,
    position: "relative",
    marginBottom: 15,
  },

  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 13,
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "rgba(40,40,40,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  discountBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 7,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },

  discountText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "900",
  },

  addButton: {
    position: "absolute",
    bottom: -12,
    right: 5,
    width: 57,
    height: 30,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  addButtonPressed: {
    backgroundColor: COLORS.primaryLight,
  },

  addText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  quantityContainer: {
    position: "absolute",
    bottom: -12,
    right: 3,
    width: 78,
    height: 30,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },

  quantityButton: {
    width: 25,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  quantity: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  details: {
    paddingHorizontal: 2,
  },

  deliveryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F3F0F2",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginBottom: 5,
  },

  deliveryText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 2,
  },

  productName: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
    minHeight: 30,
  },

  unit: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  price: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  mrp: {
    color: COLORS.muted,
    fontSize: 9,
    textDecorationLine: "line-through",
    marginLeft: 4,
    flexShrink: 1,
  },
});
