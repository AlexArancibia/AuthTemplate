import type { MetadataRoute } from "next"

const BASE = "https://scentra.pe"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/cart", "/dashboard", "/admin", "/login", "/register", "/api/", "/forgot-password", "/reset-password"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
