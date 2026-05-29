// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://teknoland-threads-boutique.lovable.app";

const SUPABASE_URL = "https://thwkmsuqkevfgqwlayqv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2ttc3Vxa2V2Zmdxd2xheXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTM4MDUsImV4cCI6MjA1OTUyOTgwNX0.uxyLw7U2wPTJIQssjXT_de8C_3nhge7ReJlFR1bj2g4";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

function xml(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const entries: SitemapEntry[] = [...staticEntries];

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Active categories -> /shop/:category
    const { data: categories, error: catErr } = await supabase
      .from("categories")
      .select("slug")
      .eq("is_active", true)
      .not("slug", "is", null);
    if (catErr) console.warn("sitemap categories error:", catErr);

    for (const c of categories ?? []) {
      entries.push({
        path: `/shop/${c.slug}`,
        changefreq: "daily",
        priority: "0.8",
      });
    }

    // Products -> /product/:category/:slug
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("slug, category, created_at")
      .not("slug", "is", null);
    if (prodErr) console.warn("sitemap products error:", prodErr);

    for (const p of products ?? []) {
      if (!p.category) continue;
      const cat = String(p.category).toLowerCase();
      entries.push({
        path: `/product/${cat}/${p.slug}`,
        lastmod: new Date(p.created_at).toISOString().split("T")[0],
        changefreq: "weekly",
        priority: "0.7",
      });
    }
  } catch (err) {
    console.warn("sitemap: failed to fetch dynamic entries, writing static only", err);
  }

  writeFileSync(resolve("public/sitemap.xml"), xml(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

main();