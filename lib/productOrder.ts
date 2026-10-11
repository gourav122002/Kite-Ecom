/**
 * =======================================================================
 * MANUAL HOME PAGE CARD ORDER
 * =======================================================================
 * To change the position of any product card on the Home Page or Catalog:
 * 
 * 1. Move the line up or down in the array below.
 * 2. Position 1 (top of array) will show 1st on the website,
 *    Position 2 will show 2nd, and so on.
 * 3. Save this file — the website will automatically update!
 * =======================================================================
 */

export const MANUAL_PRODUCT_ORDER: string[] = [
  // 🪁 1. MONO KITE MANJA
  "mono-kite-manja",                                      // #1  Monokite Manjha Original (6000m)
  "monokite-fighter-manjha-6000m",           // #2  Monokite Manjha & Fighter Pack of 2
  // ✨ 4. MONOFIL GOLD MANJA
  "monofil-gold-manja-special-edition-8000m",             // #11 Monofil Gold Manja Special Edition (8000m)
  "tuntun-manja-tournament-edition",

  // 🧵 5. TUNTUN TN
  "tuntun-tn-manjha-original-6000m",                      // #16 Tuntun TN Manjha Original (6000m)

  // 🏆 6. HERO PLUS
  "hero-plus-manjha-original-4000m",                      // #17 Hero Plus Manjha Original (4000m)

  "monofil-gold-manja-tournament-8000m",

  // 🌿 SPECIAL COTTON FIGHTER MANJA
  "mayur-gold-cotton-manja-8000m",                        // Mayur Gold Cotton Manja (8000m)
  "red-panda-manjha-original-5000m",                      // Red Panda Manjha Original (5000m)
  "100-pure-cotton-kite-manja-3-reel-9-cord",             // 100% Pure Cotton Kite Manja (3 Reel 9-Cord)

  // 📦 PACK OF 2 MANJA (TWIN VALUE PACKS)
  "monokite-manjha-tournament-pack-of-2",                 // #3  Monokite Manjha Tournament Pack of 2
  "monokite-manjha-duo-pack-of-2",                        // #4  Monokite Manjha Duo Pack of 2

  // ⚔️ 2. MONO KITE FIGHTER
  "monokite-manjha-monokite-fighter-pack-of-2",                        // #5  Monokite Fighter Manjha (6000m)
  "monokite-fighter-monofil-gold-pack-of-2",              // #6  Monokite Fighter & Monofil Gold Pack of 2
  "monokite-fighter-tuntun-manjha-pack-of-2",             // #7  Monokite Fighter & Tuntun Pack of 2

  // 🎯 3. TUNTUN MANJA
  // #8  Tuntun Manja Tournament Edition
  "tuntun-manjha-pack-of-2-original",                     // #9  Tuntun Manjha Pack of 2 Original
  "tuntun-manjha-original-monokite-pack-of-2",            // #10 Tuntun Manjha Original & Monokite Pack of 2

  // #12 Monofil Gold Manja Tournament (8000m)
  "monofil-gold-manja-original-pack-of-2",                // #13 Monofil Gold Manja Original Pack of 2
  "monofil-gold-ultra-monokite-pack-of-2",                // #14 Monofil Gold Ultra & Monokite Pack of 2
  "tun-tun-manjha-monofil-gold-pack-of-2",                // #15 Tun Tun Manjha & Monofil Gold Pack of 2
];

/**
 * Sorts any list of products according to MANUAL_PRODUCT_ORDER above.
 */
export function sortProductsByPriority<T extends { slug: string }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const indexA = MANUAL_PRODUCT_ORDER.indexOf(a.slug);
    const indexB = MANUAL_PRODUCT_ORDER.indexOf(b.slug);
    const scoreA = indexA === -1 ? 999 : indexA;
    const scoreB = indexB === -1 ? 999 : indexB;
    return scoreA - scoreB;
  });
}
