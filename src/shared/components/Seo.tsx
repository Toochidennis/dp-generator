import { useEffect } from "react";
import { absoluteUrl, type JsonLd } from "@/shared/utils/seo";

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  robots?: string;
  siteName?: string;
  imageAlt?: string;
  jsonLd?: JsonLd | JsonLd[];
};

function setMeta(selector: string, attrs: Record<string, string>) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    tag.setAttribute(key, value);
  });
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
}

function setJsonLd(data?: JsonLd | JsonLd[]) {
  const id = "page-structured-data";
  let script = document.getElementById(id) as HTMLScriptElement | null;

  if (!data) {
    script?.remove();
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export function Seo({
  title,
  description,
  path = "/",
  image = "/images/digital-dreams-logo.png",
  type = "website",
  robots = "index, follow",
  siteName,
  imageAlt,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const url = absoluteUrl(path);
    const imageUrl = absoluteUrl(image);

    document.title = title;
    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[name="robots"]', { name: "robots", content: robots });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: type });
    setMeta('meta[property="og:url"]', { property: "og:url", content: url });
    setMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });

    if (siteName) {
      setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: siteName });
    }

    if (imageAlt) {
      setMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: imageAlt });
    }

    setLink("canonical", url);
    setJsonLd(jsonLd);
  }, [description, image, imageAlt, jsonLd, path, robots, siteName, title, type]);

  return null;
}
