// services/categoryService.js
import { apiRequest } from "./api";

export async function getCategories() {
  const data = await apiRequest("/categories");
  return data || [];
}

export async function getCategoryBySlug(slug) {
  const all = await getCategories();
  return (
    all.find((c) => String(c.slug) === String(slug)) ||
    all.find((c) => String(c.id) === String(slug)) ||
    null
  );
}