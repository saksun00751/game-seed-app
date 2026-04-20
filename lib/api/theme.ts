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
  "ap-bg": "#edf1f6",
  "ap-card": "#ffffff",
  "ap-blue": "#0071e3",
  "ap-blue-h": "#0077ed",
  "ap-primary": "#0f172a",
  "ap-secondary": "#334155",
  "ap-tertiary": "#64748b",
  "ap-border": "rgba(15, 23, 42, 0.14)",
  "ap-red": "#ff3b30",
  "ap-green": "#34c759",
  "ap-orange": "#ff9500",
  "page-bg": "#edf1f6",
  "navbar-bg": "rgba(255,255,255,0.96)",
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
