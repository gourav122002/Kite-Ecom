import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/store/CartDrawer";
import { AuthModal } from "@/components/store/AuthModal";
import { SITE_CONFIG, generateOrganizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | India's Trusted Manufacturer of Mono Kite Products Since 2005`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Mono Kite",
    "Mono Kite Manja",
    "Monokite Manjha",
    "9 Cord Manja",
    "12 Cord Tournament Manja",
    "Bareilly Cotton Saddha",
    "Fighter Kites",
    "Teakwood Firki",
    "Uttarayan Kite Festival",
    "Makar Sankranti Kites",
    "Authentic Kite Spools",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_CONFIG.url,
    title: `${SITE_CONFIG.name} | India's Trusted Manufacturer of Mono Kite Since 2005`,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} Manja`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} | Mono Kite Products Since 2005`,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = generateOrganizationJsonLd();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* Razorpay Checkout Script - loaded lazily to prevent early DOM manipulation during React hydration */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
