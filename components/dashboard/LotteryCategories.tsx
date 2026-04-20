"use client";

import { useEffect, useState } from "react";
import { mapMarketsToCategories } from "@/lib/api/lotto";
import type { MarketsLatestResponse } from "@/lib/api/lotto";
import type { Category, SubItem } from "@/lib/categories";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLang } from "@/lib/i18n/context";
import PackageModalButton from "@/components/bet/PackageModalButton";

function StatusBadge({ status, label }: { status: SubItem["drawStatus"]; label?: string }) {
  const text = label?.trim() || "—";
  if (status === "open")
    return <span className="inline-flex h-[34px] items-center rounded-full px-4 text-[13px] font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">{text}</span>;
  if (status === "closed")
    return <span className="inline-flex h-[34px] items-center rounded-full px-4 text-[13px] font-semibold bg-slate-200 text-slate-600 border border-slate-300">{text}</span>;
  if (status === "resulted")
    return <span className="inline-flex h-[34px] items-center rounded-full px-4 text-[13px] font-bold bg-rose-100 text-rose-600 border border-rose-200">{text}</span>;
  return <span className="inline-flex h-[34px] items-center rounded-full px-4 text-[13px] font-bold bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm">{text}</span>;
}

interface LotteryCategoriesProps {
  initialCategories?: Category[];
}

export default function LotteryCategories({ initialCategories = [] }: LotteryCategoriesProps) {
  const t = useTranslation("dashboard");
  const { lang } = useLang();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading]       = useState(initialCategories.length === 0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/lotto/markets")
      .then((r) => r.json())
      .then((res: MarketsLatestResponse) => {
        if (!cancelled && res?.data?.groups) {
          setCategories(mapMarketsToCategories(res.data.groups));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-ap-border overflow-hidden animate-pulse bg-white shadow-card">
            <div className="h-11 bg-sky-200/70" />
            <div className="h-10 px-4 bg-sky-50 border-b border-slate-200" />
            <div className="bg-white divide-y divide-slate-200/80">
              {[1, 2, 3].map((j, idx) => (
                <div key={j} className={`h-12 px-4 flex items-center gap-2 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}`}>
                  <div className="w-6 h-6 rounded-full bg-slate-200" />
                  <div className="h-3 w-32 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-[18px] font-bold text-ap-primary tracking-tight flex items-center gap-2">
        <span className="emoji-font text-[20px]">🏆</span>
        <span>{t.todayLottery}</span>
      </h2>

      {categories.map((cat: Category) => (
        <div key={cat.id} className="rounded-2xl border border-sky-100 shadow-card hover:shadow-card-hover transition-all overflow-hidden bg-white">

          <div className="relative bg-gradient-to-r from-[#0468ce] via-[#0a7bde] to-[#20a4ff] px-4 py-2.5 flex items-center gap-2 overflow-hidden">
            <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.12)_0%,transparent_48%,rgba(255,255,255,0.08)_100%)]" />
            <span className="relative text-[18px]">{cat.emoji}</span>
            <span className="text-white font-bold text-[14px] tracking-tight">{cat.label}</span>
         
            <span className="ml-auto relative bg-white/95 text-ap-blue text-[13px] font-bold rounded-full px-3 py-1 border border-white shadow-sm">
              {cat.items.length} {t.itemsCount}
            </span>
          </div>

          {cat.description && (
            <div className="px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100">
              <p className="text-[14px] text-slate-600 leading-relaxed">{cat.description}</p>
            </div>
          )}

          <div className="grid grid-cols-[1fr_60px_60px_90px] sm:grid-cols-[1fr_100px_72px_72px_120px] px-4 py-2.5 bg-gradient-to-b from-sky-50 to-slate-50 border-b border-slate-200 text-[12px] tracking-[0.02em] font-bold text-slate-700 text-center">
            <span className="text-left">{t.colLottery}</span>
            <span className="hidden sm:block">{t.colDraw}</span>
            <span>{t.colTop3}</span>
            <span>{t.colBot2}</span>
            <span>{t.colStatus}</span>
          </div>

          <div className="bg-white">
            {cat.items.map((item: SubItem, index) => (
              <div
                key={item.id}
                className={[
                  "group relative grid grid-cols-[1fr_60px_60px_90px] sm:grid-cols-[1fr_100px_72px_72px_120px] px-4 py-3.5 border-b border-slate-200/80 last:border-0 items-center transition-all",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/70",
                  "hover:bg-sky-50/70",
                ].join(" ")}
              >
                <span className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-sky-400/80 transition-colors" />
                <div className="flex items-center gap-2 min-w-0">
                  {item.logo
                    ? <img src={item.logo} alt={item.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                    : <span className="text-[18px] flex-shrink-0 emoji-font">{item.flag}</span>}
                  <div className="min-w-0">
                    <span className="block text-[15px] font-semibold text-ap-primary truncate">{item.name}</span>
                    <span className="block sm:hidden text-[12px] text-ap-tertiary truncate">
                      {t.colDraw} {item.drawDate ?? "—"}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block text-center text-[13px] text-slate-700 tabular-nums font-medium">
                  {item.drawDate ?? "—"}
                </div>
                <div className="flex justify-center">
                  {item.result?.top3
                    ? <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[13px] font-bold tabular-nums rounded-lg min-w-[42px] text-center px-2 py-0.5 shadow-sm">{item.result.top3}</span>
                    : <span className="text-ap-tertiary text-[15px]">—</span>}
                </div>
                <div className="flex justify-center">
                  {item.result?.bot2
                    ? <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[13px] font-bold tabular-nums rounded-lg min-w-[42px] text-center px-2 py-0.5 shadow-sm">{item.result.bot2}</span>
                    : <span className="text-ap-tertiary text-[15px]">—</span>}
                </div>
                <div className="flex justify-center">
                  {item.drawStatus === "open" && cat.groupId != null && item.drawId != null ? (
                    <PackageModalButton
                      groupId={cat.groupId}
                      drawId={item.drawId}
                      locale={lang}
                      closeAt={item.closeAt}
                    />
                  ) : (
                    <StatusBadge status={item.drawStatus} label={item.statusLabel} />
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      ))}
    </section>
  );
}
