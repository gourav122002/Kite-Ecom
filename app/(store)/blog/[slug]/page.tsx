import { prisma } from "@/lib/prisma";
import { generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) return { title: "Article Not Found" };

  return {
    title: post.seoTitle || `${post.title} | ${SITE_CONFIG.name}`,
    description: post.seoDescription || post.excerpt || post.content.slice(0, 160),
    keywords: post.seoKeywords ? post.seoKeywords.split(",").map((k) => k.trim()) : undefined,
    alternates: {
      canonical: `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post || !post.published) {
    notFound();
  }

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Articles</span>
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
          <span className="font-semibold text-blue-600 flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-100 shadow-md">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base whitespace-pre-line">
        {post.content}
      </div>

      {/* Footer CTA */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl space-y-3 mt-12">
        <h3 className="text-xl font-bold">Ready to Elevate Your Flight?</h3>
        <p className="text-xs text-blue-100">
          Equip yourself with genuine 9-cord tournament Mono Kite Manja and handcrafted fighter kites today.
        </p>
        <Link
          href="/products/mono-kite-manja"
          className="inline-block rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition shadow-sm"
        >
          Order Tournament Spool
        </Link>
      </div>
    </article>
  );
}
