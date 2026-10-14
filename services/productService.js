// services/productService.js
import { apiRequest } from "./api";

function normalizeProduct(p) {
  if (!p) return null;
  const price = Number(p.price) || 0;
  const mrp = Number(p.mrp) || 0;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || "",
    image: p.image || null,
    price,
    mrp,
    unit: p.unit || "piece",
    weight: p.unit || "piece",
    stock: Number(p.stock) || 0,
    categoryId: p.categoryId,
    category: p.category?.name || p.category || "",
    rating: Number(p.rating) || 0,
    reviews: Number(p.reviewCount) || 0,
    reviewCount: Number(p.reviewCount) || 0,
    isBestseller: !!p.isBestseller,
    isFeatured: !!p.isFeatured,
    isActive: !!p.isActive,
    discount:
      mrp > price
        ? Math.round(((mrp - price) / mrp) * 100)
        : 0,
    delivery: "15 mins",
  };
}

export async function getProducts() {
  const data = await apiRequest("/products");
  return (data || []).map(normalizeProduct);
}

export async function getProductById(id) {
  if (!id) return null;
  const data = await apiRequest(`/products/${id}`);
  return normalizeProduct(data);
}

export async function getProductsByCategory(categoryIdOrSlug) {
  if (!categoryIdOrSlug) return [];
  const data = await apiRequest(
    `/products?categoryId=${encodeURIComponent(categoryIdOrSlug)}`
  );
  return (data || []).map(normalizeProduct);
}

export async function searchProducts(q) {
  const query = String(q || "").trim();
  if (!query) return getProducts();
  const data = await apiRequest(
    `/products?search=${encodeURIComponent(query)}`
  );
  return (data || []).map(normalizeProduct);
}

export async function getBestsellerProducts() {
  const all = await getProducts();
  return all.filter((p) => p.rating >= 4.3).slice(0, 6);
}