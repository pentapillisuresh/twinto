
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
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  gold: "#FFE19A",
};

export default function ProductDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const {
    cart,
    itemCount = 0,
    addToCart,
    increase,
    decrease,
  } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // ORIGINAL PRODUCT API LOGIC
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

  const topInset =
    Platform.OS === "ios" || Platform.Version >= 35
      ? insets.top
      : 0;

  // FIXED HEADER
  function renderHeader() {
    return (
      <View
        style={[
          styles.headerBackground,
          { paddingTop: topInset + 16 },
        ]}
      >
        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />

        <View style={styles.headerRow}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color={PREMIUM.white}
            />
          </Pressable>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>
              Product Details
            </Text>
            <Text style={styles.headerSubtitle}>
              Discover your favorites
            </Text>
          </View>

          <Pressable
            style={styles.headerButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Ionicons
              name="bag-outline"
              size={21}
              color={PREMIUM.white}
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

        <View style={styles.headerInfo}>
          <View style={styles.headerInfoIcon}>
            <Ionicons
              name="sparkles-outline"
              size={19}
              color={PREMIUM.gold}
            />
          </View>
          <View style={styles.headerInfoContent}>
            <Text style={styles.headerInfoTitle}>
              Fresh picks for you
            </Text>
            <Text style={styles.headerInfoSubtitle}>
              Quality groceries at great prices
            </Text>
          </View>
          <Ionicons
            name="checkmark-circle-outline"
            size={21}
            color={PREMIUM.white}
          />
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={PREMIUM.primary}
        />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={PREMIUM.primary}
          />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={PREMIUM.primary}
        />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={32}
              color={PREMIUM.primary}
            />
          </View>
          <Text style={styles.errorText}>
            Product not found
          </Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ORIGINAL CART LOOKUP LOGIC
  const cartItem = cart.find((item) => {
    if (!item) return false;
    const cid = item.id ?? item.product?.id;
    return String(cid) === String(product.id);
  });

  const quantity = Number(cartItem?.quantity) || 0;

  const imageSource = product.image
    ? { uri: product.image }
    : null;

  const saveAmount =
    Number(product.mrp || 0) -
    Number(product.price || 0);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PREMIUM.primary}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* PRODUCT IMAGE */}
        <View style={styles.imageSection}>
          <View style={styles.imageDecor} />

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
                size={55}
                color={PREMIUM.muted}
              />
            )}
          </View>

          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Ionicons
                name="pricetag"
                size={12}
                color={PREMIUM.white}
              />
              <Text style={styles.discountText}>
                {product.discount}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* PRODUCT DETAILS */}
        <View style={styles.infoContainer}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name="grid-outline"
              size={12}
              color={PREMIUM.primary}
            />
            <Text style={styles.categoryText}>
              {product.category}
            </Text>
          </View>

          <Text style={styles.productName}>
            {product.name}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.weightBadge}>
              <Ionicons
                name="cube-outline"
                size={14}
                color={PREMIUM.gray}
              />
              <Text style={styles.weight}>
                {product.weight}
              </Text>
            </View>

            <View style={styles.ratingRow}>
              <Ionicons
                name="star"
                size={15}
                color="#F4B740"
              />
              <Text style={styles.ratingText}>
                {product.rating || 0}
              </Text>
              <Text style={styles.reviewText}>
                ({product.reviews || 0})
              </Text>
            </View>
          </View>

          {/* PRICE */}
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₹{product.price}
              </Text>

              {product.mrp > product.price && (
                <Text style={styles.mrp}>
                  ₹{product.mrp}
                </Text>
              )}
            </View>

            {saveAmount > 0 && (
              <View style={styles.saveBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={PREMIUM.primary}
                />
                <Text style={styles.saveBadgeText}>
                  Save ₹{saveAmount}
                </Text>
              </View>
            )}
          </View>

          {/* DELIVERY */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryIcon}>
              <Ionicons
                name="flash"
                size={19}
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

            <Ionicons
              name="chevron-forward"
              size={18}
              color={PREMIUM.primary}
            />
          </View>

          {/* DESCRIPTION */}
          {product.description ? (
            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>
                  About this product
                </Text>
              </View>

              <Text style={styles.description}>
                {product.description}
              </Text>
            </View>
          ) : null}

          {/* RELATED PRODUCTS */}
          {related.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionAccent} />
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
                        numberOfLines={2}
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
                            size={19}
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

      {/* FIXED BOTTOM CART BAR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        {quantity === 0 ? (
          <Pressable
            style={styles.addButton}
            onPress={() => addToCart(product)}
          >
            <Ionicons
              name="bag-add-outline"
              size={20}
              color={PREMIUM.white}
            />
            <Text style={styles.addButtonText}>
              Add to Cart
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={PREMIUM.white}
            />
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
                  size={19}
                  color={PREMIUM.primary}
                />
              </Pressable>

              <Text style={styles.quantityText}>
                {quantity}
              </Text>

              <Pressable
                style={styles.quantityButtonPlus}
                onPress={() => increase(product.id)}
              >
                <Ionicons
                  name="add"
                  size={19}
                  color={PREMIUM.white}
                />
              </Pressable>
            </View>

            <Pressable
              style={styles.viewCartButton}
              onPress={() =>
                router.push("/(tabs)/cart")
              }
            >
              <Ionicons
                name="bag-outline"
                size={19}
                color={PREMIUM.white}
              />
              <Text style={styles.viewCartText}>
                View Cart
              </Text>
              <Ionicons
                name="arrow-forward"
                size={17}
                color={PREMIUM.white}
              />
            </Pressable>
          </View>
        )}
      </View>
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
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    elevation: 4,
    zIndex: 10,
  },

  headerCircleOne: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.055)",
    right: -95,
    top: -110,
  },

  headerCircleTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.045)",
    left: -65,
    bottom: -60,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.17)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleBox: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  headerTitle: {
    color: PREMIUM.white,
    fontSize: 17,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    marginTop: 4,
  },

  headerInfo: {
    marginTop: 19,
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  headerInfoIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  headerInfoContent: {
    flex: 1,
  },

  headerInfoTitle: {
    color: PREMIUM.white,
    fontSize: 13,
    fontWeight: "800",
  },

  headerInfoSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    marginTop: 4,
  },

  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: PREMIUM.white,
    borderWidth: 2,
    borderColor: PREMIUM.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  cartBadgeText: {
    color: PREMIUM.primary,
    fontSize: 9,
    fontWeight: "900",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingBottom: 25,
  },

  // PRODUCT IMAGE
  imageSection: {
    marginHorizontal: 16,
    marginTop: 17,
    height: 280,
    backgroundColor: PREMIUM.white,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  imageDecor: {
    position: "absolute",
    width: 255,
    height: 255,
    borderRadius: 128,
    backgroundColor: PREMIUM.pinkSoft,
    opacity: 0.7,
  },

  imageBox: {
    width: 232,
    height: 232,
    borderRadius: 116,
    backgroundColor: PREMIUM.imageBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  discountBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: PREMIUM.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  discountText: {
    color: PREMIUM.white,
    fontSize: 10,
    fontWeight: "900",
  },

  // PRODUCT INFO
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    gap: 5,
    marginBottom: 10,
  },

  categoryText: {
    color: PREMIUM.primary,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  productName: {
    color: PREMIUM.navy,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  weightBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: PREMIUM.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    gap: 6,
  },

  weight: {
    color: PREMIUM.gray,
    fontSize: 12,
    fontWeight: "600",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 18,
  },

  ratingText: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  reviewText: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginLeft: 4,
  },

  // PRICE CARD
  priceCard: {
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    borderRadius: 20,
    marginTop: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  price: {
    color: PREMIUM.primary,
    fontSize: 25,
    fontWeight: "900",
  },

  mrp: {
    color: PREMIUM.muted,
    fontSize: 12,
    marginLeft: 9,
    textDecorationLine: "line-through",
  },

  saveBadge: {
    backgroundColor: PREMIUM.pinkSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  saveBadgeText: {
    color: PREMIUM.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  // DELIVERY CARD
  deliveryCard: {
    marginTop: 12,
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    flexDirection: "row",
    alignItems: "center",
  },

  deliveryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryContent: {
    flex: 1,
    marginLeft: 11,
  },

  deliveryTitle: {
    color: PREMIUM.navy,
    fontSize: 13,
    fontWeight: "800",
  },

  deliverySubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  // DESCRIPTION
  section: {
    marginTop: 17,
    backgroundColor: PREMIUM.white,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: PREMIUM.border,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionAccent: {
    width: 3,
    height: 23,
    borderRadius: 3,
    backgroundColor: PREMIUM.primary,
    marginRight: 10,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "800",
  },

  description: {
    color: PREMIUM.gray,
    fontSize: 12,
    lineHeight: 20,
  },

  // RELATED PRODUCTS
  relatedSection: {
    marginTop: 24,
    marginBottom: 12,
  },

  relatedTitle: {
    color: PREMIUM.navy,
    fontSize: 17,
    fontWeight: "900",
  },

  relatedSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  relatedScroll: {
    paddingTop: 5,
    paddingRight: 8,
    paddingBottom: 5,
  },

  relatedCard: {
    width: 148,
    marginRight: 11,
    padding: 9,
    borderRadius: 19,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    shadowColor: "#7A2949",
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  relatedImageBox: {
    width: "100%",
    height: 108,
    borderRadius: 15,
    backgroundColor: PREMIUM.imageBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  relatedImage: {
    width: "100%",
    height: "100%",
  },

  relatedName: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 9,
    minHeight: 32,
    lineHeight: 16,
  },

  relatedWeight: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  relatedBottom: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  relatedPrice: {
    color: PREMIUM.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  relatedAdd: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: PREMIUM.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // FIXED BOTTOM CART BAR
  bottomBar: {
    backgroundColor: PREMIUM.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.border,
    shadowColor: PREMIUM.navy,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 9,
  },

  addButton: {
    height: 54,
    borderRadius: 28,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  addButtonText: {
    color: PREMIUM.white,
    fontSize: 14,
    fontWeight: "900",
  },

  cartActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  quantityContainer: {
    width: 120,
    height: 54,
    borderRadius: 28,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },

  quantityButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonPlus: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: PREMIUM.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    minWidth: 20,
    textAlign: "center",
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "900",
  },

  viewCartButton: {
    flex: 1,
    height: 54,
    borderRadius: 28,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  viewCartText: {
    color: PREMIUM.white,
    fontSize: 13,
    fontWeight: "900",
  },

  // LOADING / ERROR
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PREMIUM.background,
  },

  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  errorText: {
    color: PREMIUM.navy,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 18,
  },

  backButton: {
    paddingHorizontal: 27,
    paddingVertical: 13,
    borderRadius: 25,
    backgroundColor: PREMIUM.primary,
  },

  backButtonText: {
    color: PREMIUM.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
