const DEFAULT_SITE_URL = "https://kids-coding-bootcamp.digitaldreams.ng";

export type JsonLd = Record<string, unknown>;

export function configuredSiteUrl() {
  const envUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${configuredSiteUrl()}${normalizedPath}`;
}
