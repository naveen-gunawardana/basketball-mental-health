import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/profile",
          "/sessions",
          "/api/",
        ],
      },
    ],
    sitemap: "https://mentalitysports.com/sitemap.xml",
  };
}
