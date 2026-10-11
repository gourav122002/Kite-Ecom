import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const sortBy = searchParams.get("sort") || "latest"; // 'latest', 'price_asc', 'price_desc', 'rating'

    const whereClause: any = {
      status: "ACTIVE",
    };

    if (query.trim()) {
      whereClause.OR = [
        { name: { contains: query.trim() } },
        { description: { contains: query.trim() } },
        { sku: { contains: query.trim() } },
        { brand: { contains: query.trim() } },
      ];
    }

    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) whereClause.price.gte = minPrice;
      if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price_asc") orderBy = { price: "asc" };
    if (sortBy === "price_desc") orderBy = { price: "desc" };
    if (sortBy === "rating") orderBy = { rating: "desc" };

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        variants: true,
      },
      orderBy,
    });

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
