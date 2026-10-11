"use client";

import { createBlogPostAction } from "@/server/actions/adminActions";
import { slugify } from "@/lib/utils";
import { BookOpen, Plus, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function BlogManager({ posts }: { posts: any[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000"
  );
  const [author, setAuthor] = useState("Master Artisan");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createBlogPostAction({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      author: author || "Store Editorial",
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      published: true,
    });

    if (res.success) {
      setModalOpen(false);
      setTitle("");
      setSlug("");
      setContent("");
      setExcerpt("");
      router.refresh();
    } else {
      setError(res.error || "Failed to publish article");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Artisan Blog & Flight Guides</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish tournament tutorials, bridling guides, and SEO craft stories.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-lg"
          >
            <div>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 mb-4">
                <Image
                  src={
                    post.coverImage ||
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600"
                  }
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>By {post.author}</span>
                <span>{new Date(post.publishedAt).toLocaleDateString("en-IN")}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{post.title}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">/blog/{post.slug}</p>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{post.excerpt}</p>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800 text-[10px]">
                PUBLISHED
              </span>
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Read Live Post</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Write Article Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Write New Blog Post</h3>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Mastering the Mono Kite Manja"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Slug *
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
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Short Excerpt
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Summary for cards and search..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Article Content (Markdown supported) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Article content here..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-800 focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Target Keyword Title | ApexCraft Blog"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
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
                  {loading ? "Publishing..." : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
