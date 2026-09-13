import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";

import AppHeader from "../../components/common/AppHeader";
import SearchBar from "../../components/common/SearchBar";
import ProductCard from "../../components/product/ProductCard";

import { COLORS } from "../../constants";

import { categories } from "../../data";

import {
  getProductsByCategory,
} from "../../services/productService";

export default function CategoryProducts() {
  const { slug } = useLocalSearchParams();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const category = categories.find(
    (item) => item.id === slug
  );

  useEffect(() => {
    loadProducts();
  }, [slug]);

  async function loadProducts() {
    setLoading(true);

    try {
      const data =
        await getProductsByCategory(slug);

      setProducts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={category?.name || "Products"}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={`Search ${
          category?.name || "products"
        }`}
      />

      <View style={styles.resultHeader}>
        <View>
          <Text style={styles.title}>
            {category?.name || "Products"}
          </Text>

          <Text style={styles.count}>
            {filteredProducts.length} products
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={
            styles.columnWrapper
          }
          contentContainerStyle={
            styles.productList
          }
          renderItem={({ item }) => (
            <ProductCard product={item} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                No products found
              </Text>

              <Text style={styles.emptyText}>
                Try another search.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  resultHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  count: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
  },

  productList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  columnWrapper: {
    justifyContent: "space-between",
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
    paddingTop: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptyText: {
    color: COLORS.muted,
    marginTop: 6,
  },
});