// services/productService.js

import { products } from "../data";
import { USE_DUMMY_DATA, apiRequest } from "./api";

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/

export async function getProducts() {
  try {
    // Dummy data for development
    if (USE_DUMMY_DATA) {
      return products;
    }

    // Real API
    const response = await apiRequest("/products");

    return response?.data || response || [];
  } catch (error) {
    console.log("getProducts error:", error);

    // Fallback to dummy data
    return products;
  }
}

/*
|--------------------------------------------------------------------------
| GET PRODUCT BY ID
|--------------------------------------------------------------------------
*/

export async function getProductById(id) {
  try {
    if (!id) {
      return null;
    }

    // Dummy data for development
    if (USE_DUMMY_DATA) {
      const product = products.find(
        (item) =>
          String(item.id) === String(id)
      );

      return product || null;
    }

    // Real API
    const response = await apiRequest(
      `/products/${id}`
    );

    return response?.data || response || null;
  } catch (error) {
    console.log(
      "getProductById error:",
      error
    );

    // Fallback to dummy data
    const product = products.find(
      (item) =>
        String(item.id) === String(id)
    );

    return product || null;
  }
}

/*
|--------------------------------------------------------------------------
| GET PRODUCTS BY CATEGORY
|--------------------------------------------------------------------------
*/

export async function getProductsByCategory(
  category
) {
  try {
    if (!category) {
      return [];
    }

    // Dummy data
    if (USE_DUMMY_DATA) {
      return products.filter((product) => {
        const categoryMatch =
          String(product.category).toLowerCase() ===
          String(category).toLowerCase();

        const catsMatch =
          Array.isArray(product.cats) &&
          product.cats.some(
            (cat) =>
              String(cat).toLowerCase() ===
              String(category).toLowerCase()
          );

        return categoryMatch || catsMatch;
      });
    }

    // Real API
    const response = await apiRequest(
      `/products?category=${encodeURIComponent(
        category
      )}`
    );

    return response?.data || response || [];
  } catch (error) {
    console.log(
      "getProductsByCategory error:",
      error
    );

    // Dummy fallback
    return products.filter((product) => {
      const categoryMatch =
        String(product.category).toLowerCase() ===
        String(category).toLowerCase();

      const catsMatch =
        Array.isArray(product.cats) &&
        product.cats.some(
          (cat) =>
            String(cat).toLowerCase() ===
            String(category).toLowerCase()
        );

      return categoryMatch || catsMatch;
    });
  }
}

/*
|--------------------------------------------------------------------------
| SEARCH PRODUCTS
|--------------------------------------------------------------------------
*/

export async function searchProducts(
  searchText
) {
  try {
    const query = String(
      searchText || ""
    )
      .trim()
      .toLowerCase();

    if (!query) {
      return products;
    }

    // Dummy search
    if (USE_DUMMY_DATA) {
      return products.filter((product) => {
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
          name.includes(query) ||
          category.includes(query) ||
          description.includes(query)
        );
      });
    }

    // Real API
    const response = await apiRequest(
      `/products/search?q=${encodeURIComponent(
        query
      )}`
    );

    return response?.data || response || [];
  } catch (error) {
    console.log(
      "searchProducts error:",
      error
    );

    return products.filter((product) => {
      const query = String(
        searchText || ""
      )
        .trim()
        .toLowerCase();

      const name =
        String(product.name || "")
          .toLowerCase();

      const category =
        String(product.category || "")
          .toLowerCase();

      return (
        name.includes(query) ||
        category.includes(query)
      );
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET BESTSELLER PRODUCTS
|--------------------------------------------------------------------------
*/

export async function getBestsellerProducts() {
  try {
    if (USE_DUMMY_DATA) {
      return products
        .filter(
          (product) =>
            product.rating >= 4.3
        )
        .slice(0, 6);
    }

    const response = await apiRequest(
      "/products/bestsellers"
    );

    return response?.data || response || [];
  } catch (error) {
    console.log(
      "getBestsellerProducts error:",
      error
    );

    return products
      .filter(
        (product) =>
          product.rating >= 4.3
      )
      .slice(0, 6);
  }
}

/*
|--------------------------------------------------------------------------
| GET FEATURED PRODUCTS
|--------------------------------------------------------------------------
*/

export async function getFeaturedProducts() {
  try {
    if (USE_DUMMY_DATA) {
      return products.slice(0, 6);
    }

    const response = await apiRequest(
      "/products/featured"
    );

    return response?.data || response || [];
  } catch (error) {
    console.log(
      "getFeaturedProducts error:",
      error
    );

    return products.slice(0, 6);
  }
}