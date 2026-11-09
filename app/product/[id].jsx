
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { useCart } from "../../context";

import {
  getProductById,
  getProductsByCategory,
} from "../../services/productService";

const C = {
  primary: "#C9004F",
  primaryDark: "#A90042",
  navy: "#172033",
  white: "#FFFFFF",
  background: "#FFF9FB",
  soft: "#FFF0F5",
  border: "#E9DDE2",
  muted: "#858B95",
  gray: "#68717F",
  green: "#16844A",
  imageBg: "#FFFFFF",
};

const SCREEN_WIDTH = Dimensions.get("window").width;

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

function getQuantity(cart, id) {
  const item = (cart || []).find((entry) => {
    const productId =
      entry?.id ?? entry?.product?.id;

    return String(productId) === String(id);
  });

  return Number(item?.quantity) || 0;
}

function getImageSource(product) {
  return product?.image
    ? { uri: product.image }
    : null;
}

function formatDeliveryTime(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const text = String(value).trim();

  return /min|hour|hr/i.test(text)
    ? text
    : `${text} mins`;
}

function InformationRow({ label, value, last = false }) {
  if (
    value == null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  return (
    <View
      style={[
        styles.informationRow,
        last && styles.informationRowLast,
      ]}
    >
      <Text style={styles.informationLabel}>
        {label}
      </Text>

      <Text style={styles.informationValue}>
        {String(value)}
      </Text>
    </View>
  );
}

function RelatedProduct({
  item,
  cart,
  onOpen,
  onAdd,
  onIncrease,
  onDecrease,
  imageRefs,
}) {
  const quantity = getQuantity(cart, item.id);

  const imageSource = getImageSource(item);

  const mrp = Number(item.mrp || 0);
  const price = Number(item.price || 0);

  const discount =
    Number(item.discount) > 0
      ? Number(item.discount)
      : mrp > price && price > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  return (
    <Pressable
      style={styles.relatedCard}
      onPress={() => onOpen(item.id)}
    >
      <View
        style={styles.relatedImageBox}
        ref={(ref) => {
          imageRefs.current[String(item.id)] = ref;
        }}
        collapsable={false}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.relatedImage}
            resizeMode="contain"
          />
        ) : (
          <Ionicons
            name="image-outline"
            size={30}
            color={C.muted}
          />
        )}

        {discount > 0 && (
          <View style={styles.relatedDiscount}>
            <Text style={styles.relatedDiscountText}>
              {discount}% OFF
            </Text>
          </View>
        )}
      </View>

      <Text
        style={styles.relatedName}
        numberOfLines={2}
      >
        {item.name}
      </Text>

      <Text
        style={styles.relatedWeight}
        numberOfLines={1}
      >
        {item.weight || item.unit || ""}
      </Text>

      <View style={styles.relatedPriceRow}>
        <Text style={styles.relatedPrice}>
          {formatMoney(price)}
        </Text>

        {mrp > price && (
          <Text style={styles.relatedMrp}>
            {formatMoney(mrp)}
          </Text>
        )}
      </View>

      {quantity === 0 ? (
        <Pressable
          style={styles.relatedAdd}
          onPress={(event) => {
            event.stopPropagation?.();
            onAdd(item);
          }}
        >
          <Ionicons
            name="add"
            size={17}
            color={C.primary}
          />
          <Text style={styles.relatedAddText}>
            ADD
          </Text>
        </Pressable>
      ) : (
        <View style={styles.relatedQuantity}>
          <Pressable
            style={styles.relatedQtyButton}
            onPress={(event) => {
              event.stopPropagation?.();
              onDecrease(item.id);
            }}
            hitSlop={5}
          >
            <Ionicons
              name="remove"
              size={20}
              color={C.white}
            />
          </Pressable>

          <Text style={styles.relatedQtyText}>
            {quantity}
          </Text>

          <Pressable
            style={styles.relatedQtyButton}
            onPress={(event) => {
              event.stopPropagation?.();
              onIncrease(item);
            }}
            hitSlop={5}
          >
            <Ionicons
              name="add"
              size={20}
              color={C.white}
            />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

export default function ProductDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const insets = useSafeAreaInsets();

  const {
    cart = [],
    itemCount = 0,
    addToCart,
    increase,
    decrease,
    location,
  } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const mainImageRef = useRef(null);
  const cartIconRef = useRef(null);
  const relatedImageRefs = useRef({});

  // Flying-to-cart animation
  const flyX = useRef(new Animated.Value(0)).current;
  const flyY = useRef(new Animated.Value(0)).current;
  const flyScale = useRef(new Animated.Value(1)).current;
  const flyOpacity = useRef(new Animated.Value(0)).current;

  const [flyingImage, setFlyingImage] = useState(null);
  const [flyStart, setFlyStart] = useState({
    x: 0,
    y: 0,
  });

  const animationRunning = useRef(false);
  const animationToken = useRef(0);

  // ORIGINAL PRODUCT FETCHING LOGIC
  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setProduct(null);
        setRelated([]);

        const data = await getProductById(id);

        if (!active) return;

        setProduct(data);

        if (data?.categoryId) {
          const list = await getProductsByCategory(
            data.categoryId
          );

          if (!active) return;

          setRelated(
            (Array.isArray(list) ? list : [])
              .filter(
                (p) =>
                  String(p.id) !== String(data.id)
              )
              .slice(0, 5)
          );
        }
      } catch (error) {
        console.log(
          "Product details error:",
          error
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      active = false;
      animationToken.current += 1;
      animationRunning.current = false;
      flyX.stopAnimation();
      flyY.stopAnimation();
      flyScale.stopAnimation();
      flyOpacity.stopAnimation();
    };
  }, [id]);

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" &&
      Platform.Version >= 35)
      ? insets.top
      : 0;

  const quantity = product
    ? getQuantity(cart, product.id)
    : 0;

  const deliveryTime = formatDeliveryTime(
    location?.deliveryTime
  );

  const startFlyAnimation = (
    selectedProduct,
    sourceRef
  ) => {
    const imageSource = getImageSource(
      selectedProduct
    );

    if (
      !imageSource ||
      animationRunning.current
    ) {
      return;
    }

    const source = sourceRef?.current;
    const target = cartIconRef.current;

    if (
      !source?.measureInWindow ||
      !target?.measureInWindow
    ) {
      return;
    }

    source.measureInWindow(
      (sx, sy, sw, sh) => {
        target.measureInWindow(
          (tx, ty, tw, th) => {
            if (
              !sw ||
              !sh ||
              !tw ||
              !th
            ) {
              return;
            }

            const token = ++animationToken.current;

            const startX =
              sx + sw / 2 - 27;

            const startY =
              sy + sh / 2 - 27;

            const endX =
              tx + tw / 2 - 27;

            const endY =
              ty + th / 2 - 27;

            animationRunning.current = true;

            setFlyStart({
              x: startX,
              y: startY,
            });

            setFlyingImage(imageSource);

            flyX.setValue(0);
            flyY.setValue(0);
            flyScale.setValue(1);
            flyOpacity.setValue(1);

            Animated.parallel([
              Animated.timing(flyX, {
                toValue: endX - startX,
                duration: 1800,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
              }),

              Animated.timing(flyY, {
                toValue: endY - startY,
                duration: 1800,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
              }),

              Animated.timing(flyScale, {
                toValue: 0.28,
                duration: 1800,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
              }),

              Animated.sequence([
                Animated.delay(850),
                Animated.timing(flyOpacity, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
            ]).start(() => {
              if (
                token !== animationToken.current
              ) {
                return;
              }

              animationRunning.current = false;
              setFlyingImage(null);
            });
          }
        );
      }
    );
  };

  const animateRelated = (item) => {
    const source = {
      current:
        relatedImageRefs.current[String(item.id)],
    };

    startFlyAnimation(item, source);
  };

  const handleAdd = (item, isMain = false) => {
    addToCart(item);

    if (isMain) {
      startFlyAnimation(
        item,
        mainImageRef
      );
    } else {
      animateRelated(item);
    }
  };

  const handleIncrease = (
    item,
    isMain = false
  ) => {
    increase(item.id);

    if (isMain) {
      startFlyAnimation(
        item,
        mainImageRef
      );
    } else {
      animateRelated(item);
    }
  };

  const handleDecrease = (productId) => {
    decrease(productId);
  };

  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          paddingTop: topInset + 10,
        },
      ]}
    >
      <Pressable
        style={styles.headerButton}
        onPress={() => router.back()}
      >
        <Ionicons
          name="chevron-back"
          size={23}
          color={C.navy}
        />
      </Pressable>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>
          Product Details
        </Text>

        <Text style={styles.headerSubtitle}>
          Fresh picks, delivered fast
        </Text>
      </View>

      <Pressable
        ref={cartIconRef}
        collapsable={false}
        style={styles.headerButton}
        onPress={() =>
          router.push("/(tabs)/cart")
        }
      >
        <Ionicons
          name="bag-outline"
          size={22}
          color={C.primary}
        />

        {itemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>
              {itemCount > 99
                ? "99+"
                : itemCount}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  const renderFlyingImage = () => {
    if (!flyingImage) return null;

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.flyingImageBox,
          {
            left: flyStart.x,
            top: flyStart.y,
            opacity: flyOpacity,
            transform: [
              { translateX: flyX },
              { translateY: flyY },
              { scale: flyScale },
            ],
          },
        ]}
      >
        <Image
          source={flyingImage}
          style={styles.flyingImage}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={C.white}
        />

        {renderHeader()}

        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={C.primary}
          />

          <Text style={styles.stateText}>
            Loading product...
          </Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={C.white}
        />

        {renderHeader()}

        <View style={styles.centerState}>
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color={C.primary}
          />

          <Text style={styles.stateTitle}>
            Product not found
          </Text>

          <Pressable
            style={styles.stateButton}
            onPress={() => router.back()}
          >
            <Text style={styles.stateButtonText}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const imageSource = getImageSource(product);

  const price = Number(product.price || 0);
  const mrp = Number(product.mrp || 0);

  const saveAmount = Math.max(
    0,
    mrp - price
  );

  const discount =
    Number(product.discount) > 0
      ? Number(product.discount)
      : mrp > price && price > 0
      ? Math.round(
          ((mrp - price) / mrp) * 100
        )
      : 0;

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name ||
        product.categoryName ||
        null;

  const rating = Number(product.rating || 0);
  const reviews = Number(product.reviews || 0);

  const productWeight =
    product.weight || product.unit || null;

  const productShelfLife =
    product.shelfLife ||
    product.shelf_life ||
    null;

  const productBrand =
    product.brand || null;

  const productUnit =
    product.unit &&
    product.unit !== productWeight
      ? product.unit
      : null;

  const hasInformation = [
    categoryName,
    productWeight,
    productBrand,
    productUnit,
    rating > 0 ? rating : null,
    productShelfLife,
  ].some(
    (value) =>
      value != null &&
      String(value).trim() !== ""
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.white}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: 28,
          },
        ]}
      >
        {/* FULL PRODUCT IMAGE */}
        <View
          style={styles.imageSection}
          ref={mainImageRef}
          collapsable={false}
        >
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons
                name="image-outline"
                size={52}
                color={C.muted}
              />
            </View>
          )}

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                {discount}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* PRODUCT NAME AND PRICE */}
        <View style={styles.productContent}>
          {!!categoryName && (
            <Text style={styles.categoryLabel}>
              {categoryName.toUpperCase()}
            </Text>
          )}

          <Text style={styles.productName}>
            {product.name}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.weightText}>
              {productWeight || ""}
            </Text>

            {rating > 0 && (
              <View style={styles.ratingRow}>
                <Ionicons
                  name="star"
                  size={16}
                  color={C.primary}
                />

                <Text style={styles.ratingValue}>
                  {rating.toFixed(1)}
                </Text>

                {reviews > 0 && (
                  <Text style={styles.reviewCount}>
                    ({reviews})
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatMoney(price)}
            </Text>

            {mrp > price && (
              <Text style={styles.mrp}>
                {formatMoney(mrp)}
              </Text>
            )}

            {saveAmount > 0 && (
              <View style={styles.savingLabel}>
                <Text style={styles.savingText}>
                  Save {formatMoney(saveAmount)}
                </Text>
              </View>
            )}
          </View>

          {/* DYNAMIC DELIVERY */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryIcon}>
              <Ionicons
                name="flash"
                size={21}
                color={C.primary}
              />
            </View>

            <View style={styles.deliveryContent}>
              <Text style={styles.deliveryTitle}>
                {deliveryTime
                  ? `Delivery in ${deliveryTime}`
                  : "Delivery time unavailable"}
              </Text>

              <Text style={styles.deliverySubtitle}>
                Based on your selected location
              </Text>
            </View>

            <Ionicons
              name="time-outline"
              size={20}
              color={C.primary}
            />
          </View>

          {/* DESCRIPTION */}
          {!!product.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>
                About this product
              </Text>

              <Text style={styles.description}>
                {product.description}
              </Text>
            </View>
          )}

          {/* PRODUCT INFORMATION */}
          <View style={styles.informationSection}>
            <Text style={styles.sectionTitle}>
              Product Information
            </Text>

            {hasInformation ? (
              <View style={styles.informationTable}>
                <InformationRow
                  label="Category"
                  value={categoryName}
                />

                <InformationRow
                  label="Weight"
                  value={productWeight}
                />

                <InformationRow
                  label="Brand"
                  value={productBrand}
                />

                <InformationRow
                  label="Unit"
                  value={productUnit}
                />

                <InformationRow
                  label="Rating"
                  value={
                    rating > 0
                      ? `${rating.toFixed(1)} / 5`
                      : null
                  }
                />

                <InformationRow
                  label="Shelf Life"
                  value={productShelfLife}
                  last
                />
              </View>
            ) : (
              <Text style={styles.noInfoText}>
                Additional product information
                is not available.
              </Text>
            )}
          </View>

          {/* QUALITY STRIP */}
          <View style={styles.qualityStrip}>
            <View style={styles.qualityItem}>
              <Ionicons
                name="leaf-outline"
                size={21}
                color={C.primary}
              />

              <Text style={styles.qualityText}>
                Fresh
              </Text>
            </View>

            <View style={styles.qualityDivider} />

            <View style={styles.qualityItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={C.primary}
              />

              <Text style={styles.qualityText}>
                Quality
              </Text>
            </View>

            <View style={styles.qualityDivider} />

            <View style={styles.qualityItem}>
              <Ionicons
                name="flash-outline"
                size={21}
                color={C.primary}
              />

              <Text style={styles.qualityText}>
                Fast
              </Text>
            </View>
          </View>

          {/* YOU MAY ALSO LIKE */}
          {related.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeading}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>
                    You May Also Like
                  </Text>

                  <Text style={styles.relatedSubtitle}>
                    More products for you
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    const slug =
                      product.categorySlug ||
                      product.category?.slug;

                    if (slug) {
                      router.push(
                        `/category/${slug}`
                      );
                    }
                  }}
                  disabled={
                    !(
                      product.categorySlug ||
                      product.category?.slug
                    )
                  }
                >
                  <Text
                    style={[
                      styles.seeAll,
                      !(
                        product.categorySlug ||
                        product.category?.slug
                      ) && styles.seeAllDisabled,
                    ]}
                  >
                    See All
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                  styles.relatedScroll
                }
              >
                {related.map((item) => (
                  <RelatedProduct
                    key={String(item.id)}
                    item={item}
                    cart={cart}
                    imageRefs={relatedImageRefs}
                    onOpen={(productId) =>
                      router.push(
                        `/product/${productId}`
                      )
                    }
                    onAdd={(selected) =>
                      handleAdd(selected, false)
                    }
                    onIncrease={(selected) =>
                      handleIncrease(
                        selected,
                        false
                      )
                    }
                    onDecrease={handleDecrease}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FIXED BOTTOM CART ACTION */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(
              insets.bottom,
              12
            ),
          },
        ]}
      >
        {quantity === 0 ? (
          <Pressable
            style={styles.addButton}
            onPress={() =>
              handleAdd(product, true)
            }
          >
            <Ionicons
              name="bag-add-outline"
              size={21}
              color={C.white}
            />

            <Text style={styles.addButtonText}>
              Add to Cart
            </Text>
          </Pressable>
        ) : (
          <View style={styles.bottomActionRow}>
            <View style={styles.quantityContainer}>
              <Pressable
                style={styles.mainQuantityButton}
                onPress={() =>
                  handleDecrease(product.id)
                }
              >
                <Ionicons
                  name="remove"
                  size={22}
                  color={C.primary}
                />
              </Pressable>

              <Text style={styles.mainQuantityText}>
                {quantity}
              </Text>

              <Pressable
                style={styles.mainQuantityButton}
                onPress={() =>
                  handleIncrease(product, true)
                }
              >
                <Ionicons
                  name="add"
                  size={22}
                  color={C.primary}
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
                color={C.white}
              />

              <Text style={styles.viewCartText}>
                View Cart
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color={C.white}
              />
            </Pressable>
          </View>
        )}
      </View>

      {renderFlyingImage()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  // WHITE HEADER
  header: {
    backgroundColor: C.white,
    paddingHorizontal: 15,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    zIndex: 5,
  },

  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.navy,
  },

  headerSubtitle: {
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },

  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: C.primary,
    borderWidth: 2,
    borderColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  cartBadgeText: {
    fontSize: 9,
    color: C.white,
    fontWeight: "900",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 10,
  },

  // FULL IMAGE
  imageSection: {
    height: Math.min(
      SCREEN_WIDTH * 0.85,
      350
    ),
    marginHorizontal: 14,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: C.primary,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  discountBadgeText: {
    color: C.white,
    fontSize: 10,
    fontWeight: "900",
  },

  productContent: {
    paddingHorizontal: 15,
    paddingTop: 18,
  },

  categoryLabel: {
    color: C.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 7,
  },

  productName: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
    color: C.navy,
    letterSpacing: -0.5,
  },

  metaRow: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weightText: {
    color: C.gray,
    fontSize: 13,
    fontWeight: "600",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  ratingValue: {
    color: C.navy,
    fontSize: 13,
    fontWeight: "800",
  },

  reviewCount: {
    color: C.muted,
    fontSize: 11,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 17,
    gap: 10,
  },

  price: {
    fontSize: 28,
    fontWeight: "900",
    color: C.primary,
  },

  mrp: {
    color: C.muted,
    fontSize: 15,
    textDecorationLine: "line-through",
  },

  savingLabel: {
    backgroundColor: C.soft,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 5,
  },

  savingText: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  // DELIVERY
  deliveryCard: {
    marginTop: 20,
    backgroundColor: C.soft,
    borderWidth: 1,
    borderColor: "#F8DCE7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  deliveryIcon: {
    width: 43,
    height: 43,
    borderRadius: 9,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryContent: {
    flex: 1,
    marginLeft: 12,
  },

  deliveryTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: C.navy,
  },

  deliverySubtitle: {
    fontSize: 10,
    color: C.muted,
    marginTop: 5,
  },

  // DESCRIPTION
  descriptionSection: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.navy,
  },

  description: {
    marginTop: 10,
    color: C.gray,
    fontSize: 13,
    lineHeight: 21,
  },

  // PRODUCT INFORMATION
  informationSection: {
    marginTop: 24,
    padding: 14,
    borderRadius: 11,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },

  informationTable: {
    marginTop: 13,
  },

  informationRow: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E9ED",
    paddingVertical: 10,
    gap: 12,
  },

  informationRowLast: {
    borderBottomWidth: 0,
  },

  informationLabel: {
    flex: 1,
    color: C.muted,
    fontSize: 12,
  },

  informationValue: {
    flex: 1,
    textAlign: "right",
    color: C.navy,
    fontSize: 12,
    fontWeight: "800",
  },

  noInfoText: {
    color: C.muted,
    fontSize: 12,
    marginTop: 12,
  },

  // QUALITY STRIP
  qualityStrip: {
    marginTop: 12,
    minHeight: 70,
    backgroundColor: C.soft,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
  },

  qualityItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  qualityText: {
    color: C.navy,
    fontSize: 11,
    fontWeight: "800",
  },

  qualityDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#F0D5DF",
  },

  // RELATED PRODUCTS
  relatedSection: {
    marginTop: 26,
  },

  relatedHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  relatedSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
  },

  seeAll: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  seeAllDisabled: {
    opacity: 0.35,
  },

  relatedScroll: {
    paddingRight: 15,
    paddingBottom: 7,
    gap: 10,
  },

  relatedCard: {
    width: 150,
    padding: 9,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },

  relatedImageBox: {
    height: 124,
    width: "100%",
    backgroundColor: C.white,
    borderRadius: 7,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  relatedImage: {
    width: "100%",
    height: "100%",
  },

  relatedDiscount: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: C.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  relatedDiscountText: {
    color: C.white,
    fontSize: 9,
    fontWeight: "900",
  },

  relatedName: {
    color: C.navy,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 8,
    minHeight: 32,
  },

  relatedWeight: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  relatedPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 9,
    minHeight: 21,
  },

  relatedPrice: {
    color: C.navy,
    fontSize: 13,
    fontWeight: "900",
  },

  relatedMrp: {
    color: C.muted,
    fontSize: 10,
    textDecorationLine: "line-through",
  },

  relatedAdd: {
    height: 33,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.primary,
    backgroundColor: C.soft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 9,
  },

  relatedAddText: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  relatedQuantity: {
    height: 33,
    marginTop: 9,
    backgroundColor: C.primary,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },

  relatedQtyButton: {
    width: 36,
    height: 33,
    alignItems: "center",
    justifyContent: "center",
  },

  relatedQtyText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  // FIXED BOTTOM
  bottomBar: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 15,
    paddingTop: 11,
    elevation: 9,
  },

  addButton: {
    height: 52,
    backgroundColor: C.primary,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  addButtonText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "900",
  },

  bottomActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  quantityContainer: {
    width: 130,
    height: 52,
    backgroundColor: C.soft,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },

  mainQuantityButton: {
    width: 35,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  mainQuantityText: {
    color: C.navy,
    fontSize: 16,
    fontWeight: "900",
  },

  viewCartButton: {
    flex: 1,
    height: 52,
    backgroundColor: C.primary,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  viewCartText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "900",
  },

  // FLYING IMAGE
  flyingImageBox: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 9,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    zIndex: 9999,
    elevation: 30,
    pointerEvents: "none",
  },

  flyingImage: {
    width: "100%",
    height: "100%",
  },

  // LOADING / ERROR
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  stateText: {
    color: C.muted,
    fontSize: 12,
    marginTop: 12,
  },

  stateTitle: {
    color: C.navy,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 12,
  },

  stateButton: {
    marginTop: 18,
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingHorizontal: 25,
    paddingVertical: 12,
  },

  stateButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "900",
  },
});
