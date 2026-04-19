import { Prompt } from "next/font/google";
import "./globals.css";
import { getTheme, themeToCssVars } from "@/lib/api/theme";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-prompt",
  display: "swap",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme();
  const cssVars = themeToCssVars(theme) as React.CSSProperties;

  return (
    <html className={prompt.variable} style={cssVars}>
      <body className="font-sans bg-page-bg">{children}</body>
    </html>
  );
}
