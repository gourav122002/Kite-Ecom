"use client";

import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/server/actions/adminActions";
import { slugify } from "@/lib/utils";
import { FolderTree, Plus, Edit2, X, Check, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function CategoryManager({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCat(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600");
    setFeatured(false);
    setSeoTitle("");
    setSeoDescription("");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImageUrl(cat.imageUrl || "");
    setFeatured(cat.featured || false);
    setSeoTitle(cat.seoTitle || "");
    setSeoDescription(cat.seoDescription || "");
    setError(null);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCat) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      slug,
      description: description || null,
      imageUrl: imageUrl || null,
      featured,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    };

    let res;
    if (editingCat) {
      res = await updateCategoryAction(editingCat.id, payload);
    } else {
      res = await createCategoryAction(payload);
    }

    if (res.success) {
      setModalOpen(false);
      router.refresh();
    } else {
      setError(res.error || "Failed to save category");
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (cat: any) => {
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      const res = await deleteCategoryAction(cat.id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to delete category");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Categories Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize products into high-ranking SEO category hubs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 mb-4">
                <Image
                  src={cat.imageUrl || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400"}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
                {cat.featured && (
                  <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    Featured Hub
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {cat._count?.products || 0} Products
                </span>
              </div>

              <p className="text-xs text-slate-500 font-mono mt-1">/categories/{cat.slug}</p>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{cat.description}</p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <a
                href={`/categories/${cat.slug}`}
                target="_blank"
                className="text-slate-500 hover:text-slate-900 font-medium"
              >
                View Hub ↗
              </a>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(cat)}
                  className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="flex items-center rounded-lg bg-red-50 p-1.5 font-bold text-red-600 hover:bg-red-100 transition"
                  title="Delete Category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">
              {editingCat ? "Edit Category" : "Create New Category"}
            </h3>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SEO Title & Meta
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Target Category Title | ApexCraft"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="catFeatured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label htmlFor="catFeatured" className="font-bold text-slate-700">
                  Feature on Homepage
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
