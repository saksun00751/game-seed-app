"use client";

import { useLang, type LangCode } from "@/lib/i18n/context";

const LANGS: { code: LangCode; label: string; flag: string }[] = [
  { code: "th", label: "ไทย",   flag: "🇹🇭" },
  { code: "en", label: "EN",    flag: "🇬🇧" },
  { code: "kh", label: "ខ្មែរ", flag: "🇰🇭" },
  { code: "la", label: "ລາວ",   flag: "🇱🇦" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center justify-center gap-1.5">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium transition-all ${
            lang === l.code
              ? "bg-ap-blue text-white shadow-sm"
              : "bg-white border border-ap-border text-ap-secondary hover:border-ap-blue/40 hover:text-ap-primary"
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  );
}
