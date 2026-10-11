"use client";

import { createProductAction, updateProductAction } from "@/server/actions/adminActions";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: any;
  isEdit?: boolean;
}

export function ProductForm({ categories, initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compareAtPrice ? String(initialData.compareAtPrice) : ""
  );
  const [costPrice, setCostPrice] = useState(
    initialData?.costPrice ? String(initialData.costPrice) : ""
  );
  const [stock, setStock] = useState(initialData?.stock ? String(initialData.stock) : "25");
  const [status, setStatus] = useState(initialData?.status || "ACTIVE");
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || (categories.length > 0 ? categories[0].id : "")
  );
  const [brand, setBrand] = useState(initialData?.brand || "ApexCraft Pro");

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");
  const [featured, setFeatured] = useState(initialData?.featured || false);

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images?.map((i: any) => i.url) || [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
    ]
  );
  const [newImageInput, setNewImageInput] = useState("");

  // Variants
  const [variants, setVariants] = useState<
    { name: string; sku: string; priceDelta: number; stock: number }[]
  >(initialData?.variants || []);
  const [variantName, setVariantName] = useState("");
  const [variantPriceDelta, setVariantPriceDelta] = useState("0");
  const [variantStock, setVariantStock] = useState("10");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      setSlug(slugify(val));
    }
  };

  const handleAddImage = () => {
    if (newImageInput.trim()) {
      setImageUrls([...imageUrls, newImageInput.trim()]);
      setNewImageInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    if (variantName.trim()) {
      setVariants([
        ...variants,
        {
          name: variantName.trim(),
          sku: `${sku}-${variantName.trim().substring(0, 3).toUpperCase()}`,
          priceDelta: Number(variantPriceDelta) || 0,
          stock: Number(variantStock) || 10,
        },
      ]);
      setVariantName("");
      setVariantPriceDelta("0");
      setVariantStock("10");
    }
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      slug,
      sku,
      description,
      shortDescription: shortDescription || null,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      costPrice: costPrice ? Number(costPrice) : null,
      stock: Number(stock),
      status,
      categoryId,
      brand: brand || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoKeywords: seoKeywords || null,
      canonicalUrl: canonicalUrl || null,
      featured,
      images: imageUrls.map((url, idx) => ({
        url,
        sortOrder: idx,
        altText: `${name} ${idx + 1}`,
      })),
      variants,
    };

    let res;
    if (isEdit && initialData?.id) {
      res = await updateProductAction(initialData.id, payload);
    } else {
      res = await createProductAction(payload);
    }

    if (res.success) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError(res.error || "Failed to save product");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isEdit ? "Edit Product" : "Create New Product"}
            </h1>
            <p className="text-xs text-slate-500">
              Configure details, prices, variants, inventory, and SEO fields.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Product" : "Publish Product"}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* General info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">General Information</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Mono Kite Manja 9-Cord Spool 5000m"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="mono-kite-manja-spool"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SKU (Stock Keeping Unit) *
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="MKM-9C-5000"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Description (Card snippet)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief 1-sentence value proposition..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Description & Craft Details *
              </label>
              <textarea
                rows={6}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive description of materials, curing process, flight dynamics..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-600 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Pricing & Inventory</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1499.00"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compare At Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="1999.00"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-500 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Stock Qty *
                </label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="50"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <span>Product Image URLs</span>
            </h2>

            <div className="flex gap-2">
              <input
                type="url"
                value={newImageInput}
                onChange={(e) => setNewImageInput(e.target.value)}
                placeholder="https://images.unsplash.com/... or Cloudinary URL"
                className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Add Image
              </button>
            </div>

            <div className="space-y-2">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs"
                >
                  <span className="font-mono text-slate-600 truncate max-w-md">{url}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Product Variants */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Variants (Optional)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="e.g. 5000m (9 Cord)"
                className="rounded-xl border border-slate-200 p-2 text-xs"
              />
              <input
                type="number"
                value={variantPriceDelta}
                onChange={(e) => setVariantPriceDelta(e.target.value)}
                placeholder="Price +/- (₹)"
                className="rounded-xl border border-slate-200 p-2 text-xs"
              />
              <button
                type="button"
                onClick={handleAddVariant}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                + Add Option
              </button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs"
                  >
                    <span className="font-bold text-slate-800">{v.name}</span>
                    <span className="text-slate-500">
                      Delta: ₹{v.priceDelta} | Stock: {v.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(i)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Status, Category, SEO */}
        <div className="space-y-6">
          {/* Status & Category */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Organization</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE (Visible in Store)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="ApexCraft Pro"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600"
              />
              <label htmlFor="featured" className="text-xs font-bold text-slate-700">
                Feature on Homepage (Best Seller)
              </label>
            </div>
          </div>

          {/* Technical SEO Fields */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Technical SEO</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Target keyword title | ApexCraft"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Compelling 150-character snippet for Google search..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SEO Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="mono kite manja, 9 cord, bareilly cotton"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Canonical URL Override
              </label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://apexcraft.in/products/mono-kite-manja"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
