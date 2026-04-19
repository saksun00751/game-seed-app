import { cache } from "react";

export interface Theme {
  "ap-bg": string;
  "ap-card": string;
  "ap-blue": string;
  "ap-blue-h": string;
  "ap-primary": string;
  "ap-secondary": string;
  "ap-tertiary": string;
  "ap-border": string;
  "ap-red": string;
  "ap-green": string;
  "ap-orange": string;
  "page-bg": string;
  "navbar-bg": string;
  "balance-card-bg": string;
}

const DEFAULT_THEME: Theme = {
  "ap-bg": "#f5f5f7",
  "ap-card": "#ffffff",
  "ap-blue": "#0071e3",
  "ap-blue-h": "#0077ed",
  "ap-primary": "#1d1d1f",
  "ap-secondary": "#4f4f54",
  "ap-tertiary": "#8e8e93",
  "ap-border": "rgba(0,0,0,0.08)",
  "ap-red": "#ff3b30",
  "ap-green": "#34c759",
  "ap-orange": "#ff9500",
  "page-bg": "#f5f5f7",
  "navbar-bg": "rgba(255,255,255,0.9)",
  "balance-card-bg": "#0071e3",
};

export const getTheme = cache(async (): Promise<Theme> => {
  return DEFAULT_THEME;
});

export function themeToCssVars(theme: Theme): Record<string, string> {
  return Object.fromEntries(
    Object.entries(theme).map(([k, v]) => [`--${k}`, v])
  );
}
