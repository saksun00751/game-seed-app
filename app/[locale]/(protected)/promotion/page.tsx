import type { Metadata } from "next";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiGet } from "@/lib/api/client";

export const metadata: Metadata = { title: "โปรโมชั่น — Lotto" };

interface ApiPromotion {
  code:           number;
  name_th:        string;
  filepic:        string;
  bonus_percent:  string;
  bonus_max:      string;
  bonus_price:    string;
  turnpro:        string;
  content:        string;
  active:         string;
  enable:         string;
  amount_min:     string;
}

interface PromotionListResponse {
  success: boolean;
  data?: { promotions?: ApiPromotion[] };
}

function PromoCard({ promo }: { promo: ApiPromotion }) {
  const bonusPercent = parseFloat(promo.bonus_percent) || 0;
  const bonusMax     = parseFloat(promo.bonus_max)     || 0;
  const turnpro      = parseFloat(promo.turnpro)       || 0;
  const hasBonus     = bonusPercent > 0 || bonusMax > 0;

  return (
    <div className="bg-white rounded-2xl border border-ap-border shadow-card overflow-hidden">

      {/* Image */}
      {promo.filepic ? (
        <div className="relative w-full aspect-[16/7] bg-ap-bg">
          <img
            src={promo.filepic}
            alt={promo.name_th}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/7] bg-gradient-to-br from-ap-blue to-blue-400 flex items-center justify-center">
          <span className="text-[40px]">🎁</span>
        </div>
      )}

      <div className="p-4 space-y-3">

        {/* Title */}
        <h2 className="text-[15px] font-bold text-ap-primary leading-tight">{promo.name_th}</h2>

        {/* Stats */}
        {hasBonus && (
          <div className="grid grid-cols-3 gap-2">
            {bonusPercent > 0 && (
              <div className="bg-ap-bg rounded-xl px-3 py-2 text-center">
                <p className="text-[18px] font-extrabold text-ap-blue tabular-nums">{bonusPercent}%</p>
                <p className="text-[10px] text-ap-tertiary mt-0.5">โบนัส</p>
              </div>
            )}
            {bonusMax > 0 && (
              <div className="bg-ap-bg rounded-xl px-3 py-2 text-center">
                <p className="text-[15px] font-bold text-ap-primary tabular-nums">
                  ฿{bonusMax.toLocaleString("th-TH")}
                </p>
                <p className="text-[10px] text-ap-tertiary mt-0.5">สูงสุด</p>
              </div>
            )}
            {turnpro > 0 && (
              <div className="bg-ap-bg rounded-xl px-3 py-2 text-center">
                <p className="text-[15px] font-bold text-ap-primary tabular-nums">{turnpro}x</p>
                <p className="text-[10px] text-ap-tertiary mt-0.5">เทิร์น</p>
              </div>
            )}
          </div>
        )}

        {/* Content (HTML) */}
        {promo.content && (
          <div
            className="text-[12px] text-ap-secondary leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: promo.content }}
          />
        )}

      </div>
    </div>
  );
}

export default async function PromotionPage() {
  const [apiToken, lang] = await Promise.all([
    getApiToken(),
    getLangCookie(),
  ]);

  let promotions: ApiPromotion[] = [];
  try {
    const res = await apiGet<PromotionListResponse>("/promotion/list", apiToken ?? undefined, lang);
    promotions = res.data?.promotions ?? [];
  } catch {}

  return (
    <div className="min-h-screen bg-ap-bg pb-20 sm:pb-8">
      <div className="max-w-5xl mx-auto px-5 pt-6 space-y-5">

        <div>
          <h1 className="text-[22px] font-bold text-ap-primary tracking-tight">โปรโมชั่น</h1>
          <p className="text-[13px] text-ap-secondary mt-0.5">{promotions.length} โปรโมชั่น</p>
        </div>

        {promotions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ap-border shadow-card py-14 flex flex-col items-center gap-2">
            <span className="text-[48px]">🎁</span>
            <p className="text-[13px] text-ap-tertiary">ยังไม่มีโปรโมชั่น</p>
          </div>
        ) : (
          promotions.map((promo) => (
            <PromoCard key={promo.code} promo={promo} />
          ))
        )}

      </div>
    </div>
  );
}
