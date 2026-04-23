import BalanceCard from "@/components/dashboard/BalanceCard";
import type { Metadata } from "next";
import Link from "next/link";
import PromoBanner from "@/components/ui/PromoBanner";
import GameGroupSlider from "@/components/ui/GameGroupSlider";
import { Suspense } from "react";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { getAllGamesGroupedFromApi } from "@/lib/api/games";
import { getTranslation } from "@/lib/i18n/getTranslation";
import { getPageMetaTitle } from "@/lib/i18n/metaTitle";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: await getPageMetaTitle(locale, "dashboard") };
}

async function DashboardGamesSection({ locale }: { locale: string }) {
  const [apiToken, lang] = await Promise.all([getApiToken(), getLangCookie()]);
  let gameGroups: Awaited<ReturnType<typeof getAllGamesGroupedFromApi>> = [];
  try {
    gameGroups = await getAllGamesGroupedFromApi(apiToken ?? undefined, lang);
  } catch {}

  return <DashboardGamesContent locale={locale} gameGroups={gameGroups} />;
}

interface DashboardGamesContentProps {
  locale: string;
  gameGroups: Awaited<ReturnType<typeof getAllGamesGroupedFromApi>>;
}

function DashboardGamesContent({ locale, gameGroups }: DashboardGamesContentProps) {
  const t = getTranslation(locale, "bet");

  return (
    <div className="space-y-8">
      {/* Games Section */}
      {gameGroups.map((group) => {
        const headerGradient: Record<string, string> = {
          SLOT:      "from-rose-500 to-pink-400",
          CASINO:    "from-amber-500 to-yellow-400",
          SPORT:     "from-green-600 to-lime-400",
          CARDGROUP: "from-violet-600 to-purple-400",
          COCK:      "from-orange-600 to-red-400",
          FISH:      "from-cyan-500 to-teal-400",
        };
        const gradient = headerGradient[group.game_type] ?? "from-gray-500 to-gray-400";
        return (
          <section key={group.game_type} className="bg-white rounded-2xl border border-ap-border shadow-card overflow-hidden">
            <div className={`bg-gradient-to-r ${gradient} flex items-center justify-between px-4 py-3`}>
              <h2 className="text-[15px] font-bold text-white tracking-tight">
                {group.emoji} {(t as Record<string, string>)[group.game_type] ?? group.label}
              </h2>
              <Link href={`/${locale}/games/${group.game_type.toLowerCase()}`} className="text-[14px] font-semibold text-white/80 hover:text-white">
                {t.viewAll} ({group.providers.length}) →
              </Link>
            </div>
            <div className="px-4 py-3">
              <GameGroupSlider games={group.providers} gameType={group.game_type.toLowerCase()} />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DashboardGamesFallback() {
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

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="relative min-h-screen bg-ap-bg pb-20 sm:pb-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-16 w-[360px] h-[360px] rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[340px] h-[340px] rounded-full bg-blue-200/25 blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-5 pt-6 space-y-8">
        <BalanceCard phone="" displayName="" />
        <PromoBanner />
        <Suspense fallback={<DashboardGamesFallback />}>
          <DashboardGamesSection locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
