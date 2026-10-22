"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";

type Category = { id: number; slug: string; name: string };
type Product = {
  id: string;
  category_id: number | null;
  name: string;
  slug: string;
  price: number;
  old_price: number | null;
  product_images: { id: number; url: string; position: number }[];
};

export default function LandingProductFilters({
  products,
  categories,
  language,
}: {
  products: Product[];
  categories: Category[];
  language: "fr" | "ar";
}) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const visibleProducts = selectedCategory === null
    ? products
    : products.filter(product => product.category_id === selectedCategory);
  const allLabel = language === "ar" ? "الكل" : "Tous";

  const buttonClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition ${
      active
        ? "border-blue-700 bg-blue-700 text-white"
        : "border-slate-300 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-700"
    }`;

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={language === "ar" ? "تصفية المنتجات حسب الفئة" : "Filtrer les produits par catégorie"}>
        <button type="button" aria-pressed={selectedCategory === null} onClick={() => setSelectedCategory(null)} className={buttonClass(selectedCategory === null)}>
          {allLabel}
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            aria-pressed={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={buttonClass(selectedCategory === category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      {visibleProducts.length > 0
        ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{visibleProducts.map(product => <ProductCard key={product.id} p={product} />)}</div>
        : <p className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
          {language === "ar" ? "لا توجد منتجات في هذه الفئة حاليًا." : "Aucun produit dans cette catégorie pour le moment."}
        </p>}
    </>
  );
}
