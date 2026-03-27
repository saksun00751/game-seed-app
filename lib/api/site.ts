import { cache } from "react";
import { apiGet } from "@/lib/api/client";

interface SiteMeta {
  logo: string;
  title: string;
  name: string;
  description: string;
}

export const getSiteMeta = cache(async (): Promise<SiteMeta | null> => {
  try {
    return await apiGet<SiteMeta>("/meta/site");
  } catch {
    return null;
  }
});

export function getLogoUrl(logo: string): string {
  const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? "";
  return `${base}${logo}`;
}
