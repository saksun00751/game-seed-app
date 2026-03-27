"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";

type LangCode = "th" | "en" | "kh" | "la";

const DATE_LOCALE_BY_LANG: Record<LangCode, string> = {
  th: "th-TH",
  en: "en-US",
  kh: "km-KH",
  la: "lo-LA",
};

function format(closeAt: string, expiredText: string, dayText: string, dateLocale: string): string {
  const diffMs = new Date(closeAt).getTime() - Date.now();
  if (diffMs <= 0) return expiredText;

  const totalSec = Math.floor(diffMs / 1000);
  const days  = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;

  if (days > 0) {
    const closeDate = new Date(closeAt).toLocaleString(dateLocale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${days} ${dayText} (${closeDate})`;
  }
  return [hours, mins, secs].map((n) => String(n).padStart(2, "0")).join(":");
}

interface Props {
  closeAt:           string;   // ISO 8601 string
  className?:        string;
  showCurrentTime?:  boolean;
  expiredText?:      string;   // optional override text
  expiredClassName?: string;
}

export default function CountdownTimer({ closeAt, className = "", showCurrentTime, expiredText, expiredClassName }: Props) {
  const { lang } = useLang();
  const tc = useTranslation("countdown");
  const langKey = (lang in DATE_LOCALE_BY_LANG ? lang : "th") as LangCode;
  const expiredLabel = expiredText ?? tc.expired;
  const textRef = useRef<HTMLSpanElement>(null);

  const [display,   setDisplay]  = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [shrinkText, setShrinkText] = useState(false);

  useEffect(() => {
    const tick = () => {
      const expired = new Date(closeAt).getTime() <= Date.now();
      setIsExpired(expired);
      setDisplay(format(closeAt, expiredLabel, tc.day, DATE_LOCALE_BY_LANG[langKey]));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [closeAt, expiredLabel, tc.day, langKey]);

  const activeClass = isExpired && expiredClassName ? expiredClassName : className;
  const finalClass = !showCurrentTime && shrinkText ? `${activeClass} text-[16px]` : activeClass;

  useEffect(() => {
    if (showCurrentTime) return;
    const el = textRef.current;
    if (!el) return;

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "0");
    if (!lineHeight) {
      setShrinkText(false);
      return;
    }

    const lineCount = el.scrollHeight / lineHeight;
    setShrinkText(lineCount > 2);
  }, [display, showCurrentTime, activeClass]);

  if (showCurrentTime) {
    return (
      <div className="text-center">
        <span ref={textRef} className={finalClass}>{display}</span>
        {!isExpired && <div className="text-[10px] text-ap-tertiary mt-0.5">{tc.hms}</div>}
      </div>
    );
  }

  return <span ref={textRef} className={finalClass}>{display}</span>;
}
