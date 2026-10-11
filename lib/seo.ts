export const SITE_CONFIG = {
  name: "Mono Kite",
  legalName: "Mono Kite",
  tagline: "India's Trusted Manufacturer of Mono Kite Products Since 2005",
  description:
    "Mono Kite manja—India's trusted manufacturer of Mono Kite products. Since 2005, we've proudly crafted authentic Mono Kite Manjha trusted by kite lovers across the nation.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
  currency: process.env.NEXT_PUBLIC_STORE_CURRENCY || "₹",
};

export function generateProductJsonLd(product: {
  name: string;
  description: string;
  price: number;
  slug: string;
  sku: string;
  brand?: string | null;
  images?: { url: string }[];
  stock: number;
  rating?: number;
  reviewCount?: number;
}) {
  const images = product.images?.map((img) => img.url) || [SITE_CONFIG.ogImage];
  const url = `${SITE_CONFIG.url}/products/${product.slug}`;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Mono Kite",
    },
    offers: {
      "@type": "Offer",
      url: url,
      priceCurrency: "INR",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating || 4.9,
      reviewCount: product.reviewCount || 48,
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    foundingDate: "2005",
    description: SITE_CONFIG.description,
    sameAs: [
      "https://facebook.com/monokiteindia",
      "https://instagram.com/monokiteindia",
      "https://youtube.com/@monokiteindia",
    ],
  };
}
