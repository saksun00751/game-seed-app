"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

interface PromoItem {
  code:    number;
  name_th: string;
  filepic: string;
}

export default function PromoBanner() {
  const { lang } = useLang();
  const [items, setItems]   = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx]       = useState(0);
  const timerRef            = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/promotion/list")
      .then((r) => r.json())
      .then((res) => {
        const list: PromoItem[] = (res.data?.promotions ?? []).filter((p: PromoItem) => p.filepic);
        setItems(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const go = (i: number) => setIdx((i + items.length) % items.length);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx((v) => (v + 1) % items.length), 4000);
  };

  useEffect(() => {
    if (items.length <= 1) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [items.length]);

  if (loading) return (
    <div className="w-full aspect-[16/6] rounded-2xl bg-gray-200 animate-pulse" />
  );

  if (items.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl select-none">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {items.map((p) => (
          <Link
            key={p.code}
            href={`/${lang}/promotion`}
            className="relative flex-shrink-0 w-full aspect-[16/6] bg-ap-bg block"
          >
            <img
              src={p.filepic}
              alt={p.name_th}
              className="w-full h-full object-cover"
            />
          </Link>
        ))}
      </div>

      {/* Prev / Next */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => { go(idx - 1); resetTimer(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            onClick={() => { go(idx + 1); resetTimer(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => { go(i); resetTimer(); }}
              className={[
                "rounded-full transition-all duration-300",
                i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
