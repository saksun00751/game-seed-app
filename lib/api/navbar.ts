import { cache } from "react";
import { apiGet } from "@/lib/api/client";

export interface NavbarItem {
  key:          string;
  item_type:    "normal" | "center_cta";
  icon_type:    string;
  icon:         string;
  label:        string;
  label_i18n:   Record<string, string>;
  action_type:  string;
  action_value: string;
  sort_order:   number;
}

export interface NavbarConfigResponse {
  success: boolean;
  data: {
    language: string;
    navbar: {
      code:              string;
      published_version: number;
      items:             NavbarItem[];
    };
  };
}

export const getNavbarConfig = cache(
  async (token?: string, lang?: string): Promise<NavbarItem[] | null> => {
    try {
      const res = await apiGet<NavbarConfigResponse>("/lotto/navbar-config", token, lang);
      return [...res.data.navbar.items].sort((a, b) => a.sort_order - b.sort_order);
    } catch {
      return null;
    }
  },
);
