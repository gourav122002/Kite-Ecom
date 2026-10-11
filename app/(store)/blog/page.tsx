import { prisma } from "@/lib/prisma";
import { BookOpen, Calendar, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artisan Blog & Kite Flight Guides",
  description:
    "Master the secrets of 9-cord Mono Kite Manja, Bareilly cotton threads, bridling techniques, and tournament aerodynamics.",
};

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Blog Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600">
          <BookOpen className="h-3.5 w-3.5" />
          <span>FLIGHT ACADEMY & ARTISAN JOURNAL</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
          Tournament Secrets & Heritage Craft
        </h1>
        <p className="text-sm text-slate-600">
          In-depth guides on knot tensioning, manja selection, wind aerodynamics, and the heritage behind our spools.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl shadow-xs"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="relative aspect-video w-full overflow-hidden bg-slate-100"
            >
              <Image
                src={
                  post.coverImage ||
                  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800"
                }
                alt={post.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </Link>

            <div className="flex flex-1 flex-col justify-between p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-blue-600">
                    <User className="h-3.5 w-3.5" />
                    {post.author}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-bold text-blue-600 inline-flex items-center gap-1 hover:underline"
                >
                  Read Full Masterclass →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
