import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useCart } from "../../context";
import {
  getProductById,
  getProductsByCategory,
} from "../../services/productService";

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
  imageBg: "#F8F5F1",
};

export default function ProductDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const { cart, itemCount = 0, addToCart, increase, decrease } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        if (data?.categoryId) {
          const list = await getProductsByCategory(data.categoryId);
          setRelated(
            list
              .filter((p) => String(p.id) !== String(data.id))
              .slice(0, 5)
          );
        }
      } catch (e) {
        console.log("Product details error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PREMIUM.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color={PREMIUM.primary}
          />
        </View>
        <Text style={styles.errorText}>Product not found</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const cartItem = cart.find((item) => {
    if (!item) return false;
    const cid = item.id ?? item.product?.id;
    return String(cid) === String(product.id);
  });

  const quantity = Number(cartItem?.quantity) || 0;

  const imageSource = product.image ? { uri: product.image } : null;

  const saveAmount =
    Number(product.mrp || 0) - Number(product.price || 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={23}
            color={PREMIUM.navy}
          />
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Product Details
        </Text>

        <Pressable
          style={styles.headerButton}
          onPress={() => router.push("/(tabs)/cart")}
        >
          <Ionicons
            name="bag-outline"
            size={23}
            color={PREMIUM.navy}
          />
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {itemCount > 99 ? "99+" : itemCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* IMAGE */}
        <View style={styles.imageSection}>
          <View style={styles.imageBox}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons
                name="image-outline"
                size={60}
                color={PREMIUM.muted}
              />
            )}
          </View>

          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {product.discount}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* INFO */}
        <View style={styles.infoContainer}>
          <Text style={styles.categoryText}>{product.category}</Text>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.weight}>{product.weight}</Text>
            <View style={styles.ratingRow}>
              <Ionicons
                name="star"
                size={15}
                color={PREMIUM.primary}
              />
              <Text style={styles.ratingText}>
                {product.rating || 0}
              </Text>
              <Text style={styles.reviewText}>
                ({product.reviews || 0})
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.mrp > product.price && (
              <Text style={styles.mrp}>₹{product.mrp}</Text>
            )}
            {saveAmount > 0 && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>
                  Save ₹{saveAmount}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.deliveryCard}>
            <View style={styles.deliveryIcon}>
              <Ionicons
                name="flash"
                size={18}
                color={PREMIUM.primary}
              />
            </View>
            <View style={styles.deliveryContent}>
              <Text style={styles.deliveryTitle}>
                Delivery in {product.delivery}
              </Text>
              <Text style={styles.deliverySubtitle}>
                Fast delivery to your location
              </Text>
            </View>
          </View>

          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                About this product
              </Text>
              <Text style={styles.description}>
                {product.description}
              </Text>
            </View>
          ) : null}

          {/* RELATED */}
          {related.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <View>
                  <Text style={styles.relatedTitle}>
                    You May Also Like
                  </Text>
                  <Text style={styles.relatedSubtitle}>
                    More products for you
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {related.map((item) => {
                  const relImg = item.image
                    ? { uri: item.image }
                    : null;
                  return (
                    <Pressable
                      key={String(item.id)}
                      style={styles.relatedCard}
                      onPress={() =>
                        router.push(`/product/${item.id}`)
                      }
                    >
                      <View style={styles.relatedImageBox}>
                        {relImg ? (
                          <Image
                            source={relImg}
                            style={styles.relatedImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons
                            name="image-outline"
                            size={24}
                            color={PREMIUM.muted}
                          />
                        )}
                      </View>
                      <Text
                        style={styles.relatedName}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.relatedWeight}>
                        {item.weight}
                      </Text>
                      <View style={styles.relatedBottom}>
                        <Text style={styles.relatedPrice}>
                          ₹{item.price}
                        </Text>
                        <Pressable
                          style={styles.relatedAdd}
                          onPress={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <Ionicons
                            name="add"
                            size={18}
                            color={PREMIUM.white}
                          />
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          { bottom: insets.bottom },
        ]}
      >
        {quantity === 0 ? (
          <Pressable
            style={styles.addButton}
            onPress={() => addToCart(product)}
          >
            <Ionicons
              name="bag-add-outline"
              size={21}
              color={PREMIUM.white}
            />
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </Pressable>
        ) : (
          <View style={styles.cartActionRow}>
            <View style={styles.quantityContainer}>
              <Pressable
                style={styles.quantityButton}
                onPress={() => decrease(product.id)}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={PREMIUM.primary}
                />
              </Pressable>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() => increase(product.id)}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={PREMIUM.primary}
                />
              </Pressable>
            </View>

            <Pressable
              style={styles.viewCartButton}
              onPress={() => router.push("/(tabs)/cart")}
            >
              <Ionicons
                name="bag-outline"
                size={20}
                color={PREMIUM.white}
              />
              <Text style={styles.viewCartText}>View Cart</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={PREMIUM.white}
              />
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PREMIUM.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: PREMIUM.background,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    height: 58,
    paddingHorizontal: 15,
    backgroundColor: PREMIUM.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: PREMIUM.navy,
    fontSize: 17,
    fontWeight: "900",
    marginHorizontal: 8,
  },
  cartBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: PREMIUM.primary,
    borderWidth: 2,
    borderColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { color: PREMIUM.white, fontSize: 8, fontWeight: "900" },
  content: { paddingBottom: 180 },
  imageSection: {
    height: 275,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  imageBox: {
    width: 245,
    height: 245,
    borderRadius: 123,
    backgroundColor: PREMIUM.imageBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImage: { width: "100%", height: "100%" },
  discountBadge: {
    position: "absolute",
    top: 15,
    left: 16,
    backgroundColor: PREMIUM.primary,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
  },
  discountText: { color: PREMIUM.white, fontSize: 11, fontWeight: "900" },
  infoContainer: { paddingHorizontal: 17, paddingTop: 12 },
  categoryText: {
    color: PREMIUM.primary,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  productName: {
    color: PREMIUM.navy,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  metaRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weight: { color: PREMIUM.gray, fontSize: 13, fontWeight: "600" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 4,
  },
  reviewText: { color: PREMIUM.muted, fontSize: 11, marginLeft: 3 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    flexWrap: "wrap",
  },
  price: { color: PREMIUM.primary, fontSize: 27, fontWeight: "900" },
  mrp: {
    color: PREMIUM.muted,
    fontSize: 13,
    textDecorationLine: "line-through",
    marginLeft: 9,
  },
  saveBadge: {
    marginLeft: 9,
    backgroundColor: PREMIUM.pinkSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  saveBadgeText: { color: PREMIUM.primary, fontSize: 9, fontWeight: "900" },
  deliveryCard: {
    marginTop: 9,
    minHeight: 56,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryContent: { flex: 1, marginLeft: 9 },
  deliveryTitle: { color: PREMIUM.navy, fontSize: 12, fontWeight: "900" },
  deliverySubtitle: { color: PREMIUM.muted, fontSize: 9, marginTop: 2 },
  section: { marginTop: 13 },
  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 5,
  },
  description: { color: PREMIUM.gray, fontSize: 12, lineHeight: 18 },
  relatedSection: { marginTop: 16 },
  relatedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  relatedTitle: {
    color: PREMIUM.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  relatedSubtitle: { color: PREMIUM.muted, fontSize: 9, marginTop: 2 },
  relatedScroll: { paddingRight: 8 },
  relatedCard: {
    width: 137,
    marginRight: 9,
    padding: 7,
    borderRadius: 15,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
  },
  relatedImageBox: {
    width: "100%",
    height: 88,
    borderRadius: 11,
    backgroundColor: PREMIUM.imageBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  relatedImage: { width: "100%", height: "100%" },
  relatedName: {
    color: PREMIUM.navy,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6,
  },
  relatedWeight: { color: PREMIUM.muted, fontSize: 9, marginTop: 1 },
  relatedBottom: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  relatedPrice: {
    color: PREMIUM.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  relatedAdd: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: PREMIUM.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PREMIUM.white,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 11,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.border,
    elevation: 12,
  },
  addButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonText: { color: PREMIUM.white, fontSize: 14, fontWeight: "900" },
  cartActionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  quantityContainer: {
    width: 112,
    height: 52,
    borderRadius: 15,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityButton: {
    width: 36,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    minWidth: 24,
    textAlign: "center",
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "900",
  },
  viewCartButton: {
    flex: 1,
    height: 52,
    borderRadius: 15,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  viewCartText: { color: PREMIUM.white, fontSize: 14, fontWeight: "900" },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorText: {
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 18,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: PREMIUM.primary,
  },
  backButtonText: { color: PREMIUM.white, fontSize: 13, fontWeight: "900" },
});