import { prisma } from "@/lib/prisma";
import { BlogManager } from "@/components/admin/BlogManager";
import React from "react";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <BlogManager posts={posts} />;
}
