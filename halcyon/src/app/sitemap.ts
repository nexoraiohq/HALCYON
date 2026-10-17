import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/server-api";

const SITE = "https://www.halcyon.estate";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/properties",
    "/services",
    "/about",
    "/agents",
    "/journal",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "/properties" ? "weekly" : "monthly") as
      | "weekly"
      | "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const properties = await getProperties();
  const listings = properties.map((p) => ({
    url: `${SITE}/properties/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...routes, ...listings];
}
