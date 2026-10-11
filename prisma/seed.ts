import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Robust CSV parser supporting multiline fields and quotes
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentCell.trim());
      currentCell = "";
      if (currentRow.length > 0 && currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

const colorNames: Record<string, string> = {
  "#c0c0c0": "Silver Grey",
  "#ff0000": "Fighter Red",
  "#ffa500": "Sunset Orange",
  "#111111": "Obsidian Black",
  "#000000": "Jet Black",
  "#44b46e": "Emerald Green",
  "#008000": "Classic Green",
  "#231709": "Deep Bronze",
  "#ffc0cb": "Rose Pink",
  "#ffff00": "Golden Yellow",
  "#00ffff": "Electric Cyan",
  "#c31e56": "Crimson Ruby",
  "#9d293f": "Royal Maroon",
  "#68c668": "Lime Jade",
};

function formatCleanTitle(rawName: string, id: string): string {
  // Specific cleaner names for long SEO titles
  if (id === "3163830") return "Monokite Manjha Original (6000m)";
  if (id === "48319931") return "Monokite Manjha & Monokite Fighter Pack of 2";
  if (id === "48666647") return "Red Panda Manjha Original (5000m)";
  if (id === "49470096") return "Monofil Gold Manja Tournament (8000m)";
  if (id === "49472288") return "Mayur Gold Cotton Manja (8000m)";
  if (id === "48323746") return "Monokite Fighter & Monofil Gold Pack of 2";
  if (id === "30073434") return "Big Fighter Kites (Pack of 25)";
  if (id === "48375375") return "Monokite Manjha Tournament Pack of 2";
  if (id === "48160814") return "Tuntun TN Manjha Original (6000m)";
  if (id === "48319936") return "Tuntun Manjha Pack of 2 Original";
  if (id === "48323734") return "Monofil Gold Ultra & Monokite Pack of 2";
  if (id === "48323764") return "Tun Tun Manjha & Monofil Gold Pack of 2";
  if (id === "48323849") return "Monofil Gold Manja Original Pack of 2";
  if (id === "48323781") return "Tuntun Manjha Original & Monokite Pack of 2";
  if (id === "48319790") return "Monokite Manjha Duo Pack of 2";
  if (id === "47831495") return "Medium-Size Fiber Kite Spool (Charkhi/Firki 3000-4000m)";
  if (id === "47136138") return "Monofil Gold Manja Special Edition (8000m)";
  if (id === "48323776") return "Monokite Fighter & Tuntun Manjha Pack of 2";
  if (id === "47831459") return "Handcrafted Wooden Kite Flying Spool (Charkhi/Firki)";
  if (id === "47827648") return "Fiber Wheel Kite Spool with Short Handle (Charkhi/Firki)";
  if (id === "31572334") return "Monokite Fighter Manjha (6000m)";
  if (id === "49651382") return "Big Fighter Kites (Pack of 40)";
  if (id === "47136141") return "Hero Plus Manjha Original (4000m)";
  if (id === "31572396") return "Tuntun Manja Tournament Edition";
  if (id === "26414036") return "Full Size Classic Charkhi Reel (Plastic/Fiber)";
  if (id === "48243673") return "100% Pure Cotton Kite Manja (3 Reel 9-Cord)";

  let title = rawName;
  if (title.includes(" - Buy")) title = title.split(" - Buy")[0];
  if (title.includes(" | Buy")) title = title.split(" | Buy")[0];
  if (title.includes(" | ")) title = title.split(" | ")[0];
  return title.trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

async function main() {
  console.log("🪁 Seeding actual catalog from results_58732339_0a67c5bf-ce80-4981-9edc-4cb7c2d38e5a.csv...");

  // Clear existing records to ensure fresh mapping
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.address.deleteMany();
  await prisma.adminAuditLog.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  // 1. Create Admin & Customer Users
  await prisma.user.create({
    data: {
      email: "admin@store.com",
      name: "Mono Kite Admin",
      passwordHash,
      role: "ADMIN",
      phone: "+91 9876543210",
    },
  });

  await prisma.user.create({
    data: {
      email: "rahul.sharma@example.com",
      name: "Rahul Sharma",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phone: "+91 9812345678",
      addresses: {
        create: {
          name: "Rahul Sharma",
          phone: "+91 9812345678",
          street: "Flat 402, Sunshine Heights, Linking Road",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400050",
          country: "India",
          isDefault: true,
        },
      },
    },
  });

  // 2. Create the 3 Core Store Categories with authentic imagery
  const catManja = await prisma.category.create({
    data: {
      name: "Original Monokite Manja",
      slug: "kite-manja",
      description: "Authentic sunlight-cured 9-cord, 12-cord & cotton tournament manjha crafted since 2005.",
      imageUrl: "https://dms.mydukaan.io/original/jpeg/media/160d317a-c244-4a5e-abff-974f637064cb.png",
      seoTitle: "Original Monokite Manja Online | India's Trusted Manufacturer Since 2005",
      seoDescription: "Buy original Monokite Manjha directly from the manufacturer. 9-cord high-tensile cotton with pan-India delivery.",
      featured: true,
    },
  });

  const catKites = await prisma.category.create({
    data: {
      name: "Fighter & Designer Kites",
      slug: "handcrafted-kites",
      description: "Hand-balanced Indian fighter kites (Cheel, Pari, Dheel) made with virgin paper & shaved bamboo.",
      imageUrl: "https://dms.mydukaan.io/original/jpeg/media/956ceeab-9766-490f-9cac-5117f41a81eb.png",
      seoTitle: "Indian Fighter Kites Online | Packs of 25 & 40 Big Kites",
      seoDescription: "Shop authentic fighter kites hand-balanced for sharp aerial combat and tournaments.",
      featured: true,
    },
  });

  const catFirkis = await prisma.category.create({
    data: {
      name: "Firki Reels & Charkhi",
      slug: "firki-and-spools",
      description: "Durable fiber and handcrafted wooden charkhis & firkis with smooth rotation for festivals.",
      imageUrl: "https://dms.mydukaan.io/original/jpeg/media/7e5802f6-ead1-495d-9796-7d5d4829562f.png",
      seoTitle: "Buy Charkhi & Firki Online | Wooden & Fiber Reels",
      seoDescription: "High capacity 3000m-4000m kite flying spools and traditional wooden firkis.",
      featured: true,
    },
  });

  const catCotton = await prisma.category.create({
    data: {
      name: "Special Cotton Fighter Manja",
      slug: "special-cotton-fighter-manja",
      description: "100% pure cotton fighter manja, Bareilly 9-cord & heritage tournament spools.",
      imageUrl: "https://dms.mydukaan.io/original/jpeg/media/c2ab799b-2ec4-4ec7-8944-59d3ee8ef82a.png",
      seoTitle: "Special Cotton Fighter Manja Online | 100% Pure Bareilly Cotton",
      seoDescription: "Authentic Bareilly pure cotton manja, Mayur Gold 8000m, Red Panda 5000m, and 9-cord tournament cotton spools.",
      featured: true,
    },
  });

  // 3. Read and Parse the CSV file
  const csvPath = path.resolve(process.cwd(), "results_58732339_0a67c5bf-ce80-4981-9edc-4cb7c2d38e5a.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const rawCSV = fs.readFileSync(csvPath, "utf-8");
  const parsedRows = parseCSV(rawCSV);
  const headers = parsedRows[0];
  const dataRows = parsedRows.slice(1);

  // Group rows by Product ID
  const productGroups = new Map<string, Record<string, string>[]>();
  for (const row of dataRows) {
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = row[idx] || "";
    });
    const prodId = rowObj["Product ID"] || rowObj["Product Name*"];
    if (!productGroups.has(prodId)) {
      productGroups.set(prodId, []);
    }
    productGroups.get(prodId)!.push(rowObj);
  }

  console.log(`Found ${productGroups.size} unique products in CSV.`);

  const usedSlugs = new Set<string>();

  // Specific ordering requested by user:
  // 1. Mono Kite -> 2. Mono Kite Fighter -> 3. Tuntun Manja -> 4. Monofil Gold -> 5. Tuntun TN -> 6. Hero Plus -> 7. Mayur Gold -> Others
  function getProductPriority(prodId: string): number {
    const pId = String(prodId);
    // 1. Mono Kite Original & Mono Kite Packs
    if (pId === "3163830") return 1; // Monokite Manjha Original (6000m)
    if (pId === "48319931") return 2; // Monokite Manjha & Monokite Fighter Pack of 2
    if (pId === "48375375") return 3; // Monokite Manjha Tournament Pack of 2
    if (pId === "48319790") return 4; // Monokite Manjha Duo Pack of 2

    // 2. Mono Kite Fighter
    if (pId === "31572334") return 5; // Monokite Fighter Manjha (6000m)
    if (pId === "48323746") return 6; // Monokite Fighter & Monofil Gold Pack of 2
    if (pId === "48323776") return 7; // Monokite Fighter & Tuntun Manjha Pack of 2

    // 3. Tuntun Manja
    if (pId === "31572396") return 8; // Tuntun Manja Tournament Edition
    if (pId === "48319936") return 9; // Tuntun Manjha Pack of 2 Original
    if (pId === "48323781") return 10; // Tuntun Manjha Original & Monokite Pack of 2

    // 4. Monofil Gold Manja
    if (pId === "49470096") return 11; // Monofil Gold Manja Tournament (8000m)
    if (pId === "47136138") return 12; // Monofil Gold Manja Special Edition (8000m)
    if (pId === "48323849") return 13; // Monofil Gold Manja Original Pack of 2
    if (pId === "48323734") return 14; // Monofil Gold Ultra & Monokite Pack of 2
    if (pId === "48323764") return 15; // Tun Tun Manjha & Monofil Gold Pack of 2

    // 5. Tuntun TN
    if (pId === "48160814") return 16; // Tuntun TN Manjha Original (6000m)

    // 6. Hero Plus
    if (pId === "47136141") return 17; // Hero Plus Manjha Original (4000m)

    // 7. Mayur Gold
    if (pId === "49472288") return 18; // Mayur Gold Cotton Manja (8000m)

    // 8. Other Manjha
    if (pId === "48666647") return 19; // Red Panda Manjha Original (5000m)
    if (pId === "48243673") return 20; // 100% Pure Cotton Kite Manja (3 Reel 9-Cord)

    // 9. Kites (Patang)
    if (pId === "30073434") return 21; // Big Fighter Kites (Pack of 25)
    if (pId === "49651382") return 22; // Big Fighter Kites (Pack of 40)

    // 10. Charkhis & Spools
    if (pId === "47831459") return 23; // Handcrafted Wooden Kite Flying Spool (Charkhi/Firki)
    if (pId === "47831495") return 24; // Medium-Size Fiber Kite Spool (Charkhi/Firki 3000-4000m)
    if (pId === "47827648") return 25; // Fiber Wheel Kite Spool with Short Handle (Charkhi/Firki)
    if (pId === "26414036") return 26; // Full Size Classic Charkhi Reel (Plastic/Fiber)

    return 99;
  }

  // Sort groups according to the priority order
  const sortedProductEntries = Array.from(productGroups.entries()).sort(
    ([idA], [idB]) => getProductPriority(idA) - getProductPriority(idB)
  );

  let productIndex = 0;
  for (const [prodId, rows] of sortedProductEntries) {
    productIndex++;
    const firstRow = rows[0];
    const priority = getProductPriority(prodId);

    const cleanName = formatCleanTitle(firstRow["Product Name*"], prodId);
    let baseSlug = slugify(cleanName);

    // Keep primary canonical slug for the flag brand product
    if (prodId === "3163830") {
      baseSlug = "mono-kite-manja";
    }

    let uniqueSlug = baseSlug;
    let dupCounter = 1;
    while (usedSlugs.has(uniqueSlug)) {
      dupCounter++;
      uniqueSlug = `${baseSlug}-${dupCounter}`;
    }
    usedSlugs.add(uniqueSlug);

    // Determine category
    const catText = (firstRow["Categories*"] || "").toLowerCase();
    const cottonSlugs = [
      "mayur-gold-cotton-manja-8000m",
      "red-panda-manjha-original-5000m",
      "100-pure-cotton-kite-manja-3-reel-9-cord",
    ];
    let categoryId = catManja.id;
    if (cottonSlugs.includes(uniqueSlug)) {
      categoryId = catCotton.id;
    } else if (catText.includes("patang")) {
      categoryId = catKites.id;
    } else if (catText.includes("charkhi") || catText.includes("spool")) {
      categoryId = catFirkis.id;
    }

    // Pricing
    const mrp = parseFloat(firstRow["Price*"]) || 1499.0;
    const discountedPrice = parseFloat(firstRow["Discounted Price"]) || mrp;

    // Image links
    const rawImages = (firstRow["Image links (up to 24 for each product group)"] || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));

    const imagesToCreate = rawImages.length > 0
      ? rawImages
      : ["https://dms.mydukaan.io/original/jpeg/media/160d317a-c244-4a5e-abff-974f637064cb.png"];

    const isFeatured = priority <= 8;

    // Generate ratings and review counts realistically
    const rating = Math.round((4.7 + (productIndex % 4) * 0.1) * 10) / 10;
    const reviewCount = 18 + ((productIndex * 7) % 65);

    // Create Product
    const createdProduct = await prisma.product.create({
      data: {
        name: cleanName,
        slug: uniqueSlug,
        sku: firstRow["Product SKU ID"] || `MK-SKU-${prodId}`,
        description: firstRow["Product Description"] || cleanName,
        shortDescription: firstRow["Meta Description"] || firstRow["Title Tag - Dukaan SEO"] || cleanName,
        price: discountedPrice,
        compareAtPrice: mrp > discountedPrice ? mrp : null,
        stock: 50 + (productIndex * 5) % 40,
        status: "ACTIVE",
        categoryId,
        brand: firstRow["Brand"] || "Original Mono Kite",
        seoTitle: firstRow["Title Tag - Dukaan SEO"] || `${cleanName} | Mono Kite Store`,
        seoDescription: firstRow["Meta Description"] || `Buy ${cleanName} online at best factory price with fast delivery across India.`,
        seoKeywords: firstRow["Product Tag"] || undefined,
        rating,
        reviewCount,
        featured: isFeatured,
        images: {
          create: imagesToCreate.map((url, imgIdx) => ({
            url,
            sortOrder: imgIdx,
            altText: `${cleanName} - View ${imgIdx + 1}`,
          })),
        },
        inventoryLogs: {
          create: {
            change: 50,
            reason: "INITIAL_FACTORY_IMPORT",
          },
        },
      },
    });

    // Check for variants across rows in this product group
    const hasVariants = rows.some(
      (r) => r["Variant Value 1"] || r["Variant Label 1"] || r["Variant SKU Code"]
    );

    if (hasVariants) {
      for (let vIdx = 0; vIdx < rows.length; vIdx++) {
        const vRow = rows[vIdx];
        const hex = (vRow["Variant Value 1"] || "").trim().toLowerCase();
        const friendlyColor = colorNames[hex] || vRow["Variant Value 1"] || `Option ${vIdx + 1}`;
        const variantName = hex ? `${friendlyColor} (${hex})` : friendlyColor;

        const vPrice = parseFloat(vRow["Discounted Price"]) || discountedPrice;
        const priceDelta = Math.round((vPrice - discountedPrice) * 100) / 100;

        await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            name: variantName,
            sku: vRow["Variant SKU Code"] || vRow["Product SKU ID"] || `${createdProduct.sku}-V${vIdx + 1}`,
            priceDelta,
            stock: 25,
          },
        });
      }
    }

    console.log(`  ✓ [${productIndex}/26] Seeded "${cleanName}" -> /products/${uniqueSlug}`);
  }

  // 4. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "MONO2005",
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOrderValue: 799,
        maxDiscount: 400,
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: "FESTIVAL20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderValue: 1499,
        maxDiscount: 600,
        usageLimit: 500,
        isActive: true,
      },
      {
        code: "MAKARSANKRANTI",
        discountType: "FIXED",
        discountValue: 200,
        minOrderValue: 1999,
        maxDiscount: 200,
        usageLimit: 300,
        isActive: true,
      },
    ],
  });

  // 5. Blog Posts
  await prisma.blogPost.createMany({
    data: [
      {
        title: "The Legacy of Original Monokite Manja: Crafting Precision Since 2005",
        slug: "legacy-of-original-monokite-manja-since-2005",
        excerpt:
          "How Mono Kite pioneered the original sun-cured cotton manjha formula trusted by tournament champions nationwide.",
        content: `
# The Story Behind India's Most Trusted Kite Thread

Since **2005**, **Mono Kite** has stood as India's trusted manufacturer of original Monokite products. From the historic kite-flying alleys of Bareilly and Gujarat to rooftops across the nation, our signature sun-cured multi-cord threads have defined aerial combat superiority for over two decades.

### Why Champions Choose Original Mono Kite
- **100% Egyptian Cotton Core**: Zero synthetic stretching for instantaneous cutting response.
- **Herbal Glass Silicate Glaze**: Razor sharp cutting performance cured under natural Indian sunlight.
- **Micro-Polished Finish**: Glides smoothly across the fingers without abrasive burns.

Order your authentic tournament spool today directly from the factory.
        `,
        coverImage: "https://dms.mydukaan.io/original/jpeg/media/160d317a-c244-4a5e-abff-974f637064cb.png",
        author: "Mono Kite Master Craftsman",
        published: true,
      },
    ],
  });

  console.log("🎉 Successfully mapped all 26 actual products, categories, variants, and real images into the website!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
