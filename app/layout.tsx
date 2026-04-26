import { Prompt } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getTheme, themeToCssVars } from "@/lib/api/theme";
import { getSiteMeta } from "@/lib/api/site";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-prompt",
  display: "swap",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, meta] = await Promise.all([getTheme(), getSiteMeta()]);
  const cssVars = themeToCssVars(theme) as React.CSSProperties;
  const headerCode = meta?.header_code ?? "";

  return (
    <html lang="th" className={prompt.variable} style={cssVars}>
      <body className="font-sans bg-page-bg">
        {headerCode && (
          <Script
            id="site-header-code"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(){var d=document,t=d.createElement('div');t.innerHTML=${JSON.stringify(headerCode)};var n=Array.prototype.slice.call(t.childNodes),i;for(i=0;i<n.length;i++){var el=n[i];if(el.tagName==='SCRIPT'){var s=d.createElement('script');for(var a=0;a<el.attributes.length;a++){s.setAttribute(el.attributes[a].name,el.attributes[a].value);}if(el.text)s.text=el.text;d.head.appendChild(s);}else if(el.nodeType===1){d.head.appendChild(el);}}})();`,
            }}
          />
        )}
        {children}
      </body>
    </html>
  );
}
