import type { Metadata } from "next";
import BalanceCard from "@/components/dashboard/BalanceCard";
import { requireAuth } from "@/lib/session/auth";
import { logoutAction } from "@/lib/actions";
import { apiGet } from "@/lib/api/client";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { getTranslation } from "@/lib/i18n/getTranslation";
import type { Ticket } from "@/app/[locale]/(protected)/history/page";

export const metadata: Metadata = { title: "ข้อมูลสมาชิก — Lotto" };

interface ApiBankItem {
  code:      number;
  name_th:   string;
  shortcode: string;
  image_url: string;
}
interface BanksResponse {
  data?: { banks?: ApiBankItem[] };
}

interface TicketsResponse {
  success: boolean;
  data:    Ticket[];
}

interface LoadBalanceProfile {
  name:     string;
  bank_code: number;
  acc_no:   string;
}
interface LoadBalanceResponse {
  success:  boolean;
  profile:  LoadBalanceProfile;
}

/** Format 10-digit phone → 0XX-XXX-XXXX */
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}


interface Props {
  params?: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const [{ locale }, user, apiToken, lang] = await Promise.all([
    params ?? Promise.resolve({ locale: "th" }),
    requireAuth(),
    getApiToken(),
    getLangCookie(),
  ]);
  const t = getTranslation(lang, "profile");
  const th = getTranslation(lang, "history");

  let bankOptions: ApiBankItem[] = [];
  let bankName:    string | null = null;
  let accNo:       string | null = null;
  let recentTickets: Ticket[] = [];

  const [banksRes, loadbalanceRes, ticketsRes] = await Promise.allSettled([
    apiGet<BanksResponse>("/auth/register/banks"),
    apiGet<LoadBalanceResponse>("/member/loadbalance", apiToken ?? undefined, lang),
    apiGet<TicketsResponse>("/lotto/tickets", apiToken ?? undefined, lang),
  ]);

  if (banksRes.status === "fulfilled" && banksRes.value?.data?.banks) {
    bankOptions = banksRes.value.data.banks;
  }
  if (loadbalanceRes.status === "fulfilled" && loadbalanceRes.value?.profile) {
    const p = loadbalanceRes.value.profile;
    accNo    = p.acc_no   || null;
    bankName = bankOptions.find((b) => b.code === p.bank_code)?.name_th ?? null;
  }
  if (ticketsRes.status === "fulfilled") {
    recentTickets = (ticketsRes.value?.data ?? []).slice(0, 5);
  }

  const displayName  = user.displayName ?? t.member;
  const referralCode = user.referralCode ?? ("LT" + user.id.replace(/-/g, "").slice(0, 6).toUpperCase());

  function maskAccount(acc: string) {
    return acc.length > 4 ? `${"X".repeat(acc.length - 4)}-${acc.slice(-4)}` : acc;
  }

  const STATUS_STYLE: Record<string, string> = {
    active:    "bg-ap-blue/10 text-ap-blue",
    won:       "bg-ap-green/10 text-ap-green",
    lost:      "bg-ap-red/10 text-ap-red",
    pending:   "bg-yellow-50 text-yellow-700",
    cancelled: "bg-ap-bg text-ap-tertiary",
  };
  const STATUS_LABEL: Record<string, string> = {
    active: th.statusActive, won: th.statusWon, lost: th.statusLost,
    pending: th.statusPending, cancelled: th.statusCancelled,
  };
  const menuSections = [
    {
      title: t.menuAccountTitle,
      items: [
        { href: "/history",      icon: "📋", label: t.menuBetsLabel,    desc: t.menuBetsDesc },
        { href: "/transactions", icon: "💳", label: t.menuFinanceLabel, desc: t.menuFinanceDesc },
      ],
    },
    {
      title: t.menuSettingsTitle,
      items: [
        { href: "/deposit",         icon: "💰", label: t.menuDepositLabel,  desc: t.menuDepositDesc },
        { href: "/change-password", icon: "🔐", label: t.menuPasswordLabel, desc: t.menuPasswordDesc },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-ap-bg pb-20 sm:pb-8">
      <div className="max-w-5xl mx-auto px-5 pt-6 space-y-5">

        {/* Balance Card */}
        <BalanceCard phone={formatPhone(user.phone)} displayName={displayName} />

        {/* Bank account */}
        <div className="bg-white rounded-2xl border border-ap-border shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-ap-tertiary uppercase tracking-wide font-medium mb-1">{t.bankAccount}</p>
              {accNo ? (
                <>
                  <p className="text-[15px] font-semibold text-ap-primary">{bankName}</p>
                  <p className="text-[13px] text-ap-secondary font-mono mt-0.5">{maskAccount(accNo)}</p>
                </>
              ) : (
                <p className="text-[13px] text-ap-tertiary">{t.noBank}</p>
              )}
            </div>
            <div className="w-11 h-11 rounded-2xl bg-ap-blue/8 flex items-center justify-center text-[22px]">
              🏦
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <a href={`/${locale}/deposit`}
              className="flex items-center justify-center gap-2 bg-ap-blue text-white rounded-full py-2.5 text-[13px] font-semibold hover:bg-ap-blue-h transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              {t.deposit}
            </a>
            <a href={`/${locale}/withdraw`}
              className="flex items-center justify-center gap-2 bg-ap-red text-white rounded-full py-2.5 text-[13px] font-semibold hover:opacity-90 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 19V5M5 12h14" strokeLinecap="round" transform="rotate(90 12 12)" />
              </svg>
              {t.withdraw}
            </a>
          </div>
        </div>

        {/* Referral card */}
        <a href={`/${locale}/referral`} className="block bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl p-5 text-white relative overflow-hidden group hover:opacity-95 transition-opacity">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[22px]">🎁</span>
                <span className="text-[16px] font-bold tracking-tight">{t.referralTitle}</span>
                <span className="text-[10px] font-bold bg-white/25 rounded-full px-2 py-0.5 border border-white/30">{t.referralNew}</span>
              </div>
              <p className="text-[13px] text-white/80 mb-2">{t.referralDesc}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] bg-white/20 rounded-lg px-2.5 py-1 font-mono font-bold tracking-widest border border-white/20">
                  {referralCode}
                </span>
                <span className="text-[12px] text-white/70">{t.referralYourCode}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="text-[36px]">👥</div>
              <span className="text-[11px] text-white/80 font-medium">{t.referralView}</span>
            </div>
          </div>
        </a>

        {/* ประวัติการแทงล่าสุด */}
        <div className="bg-white rounded-2xl border border-ap-border shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-ap-border flex items-center justify-between">
            <p className="text-[14px] font-bold text-ap-primary">📋 {t.recentBets}</p>
            <a href={`/${locale}/history`} className="text-[12px] text-ap-blue font-semibold hover:underline">{t.viewAll}</a>
          </div>
          {recentTickets.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-ap-tertiary">{t.noBets}</p>
            </div>
          ) : (
            <div className="divide-y divide-ap-border">
              {recentTickets.map((ticket) => {
                const [datePart, timePart] = ticket.created_at.split(" ");
                return (
                  <div key={ticket.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-bold text-ap-primary">{ticket.market_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[ticket.status] ?? "bg-ap-bg text-ap-secondary"}`}>
                          {STATUS_LABEL[ticket.status] ?? ticket.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-ap-tertiary">{datePart} {timePart} · {ticket.draw_date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-bold text-ap-primary tabular-nums">
                        ฿{Number(ticket.total_amount).toLocaleString("th-TH")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Menu sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-ap-border shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-ap-border">
              <p className="text-[12px] font-semibold text-ap-tertiary uppercase tracking-wide">{section.title}</p>
            </div>
            <div className="divide-y divide-ap-border">
              {section.items.map((item) => (
                <a key={item.href} href={`/${locale}${item.href}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-ap-bg/60 transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-ap-bg flex items-center justify-center text-[18px] flex-shrink-0 group-hover:bg-ap-blue/5 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-ap-primary">{item.label}</p>
                    <p className="text-[12px] text-ap-tertiary mt-0.5">{item.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-ap-tertiary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="bg-white rounded-2xl border border-ap-border shadow-card overflow-hidden">
          <form action={logoutAction}>
            <button type="submit"
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-ap-red/5 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-ap-red/8 flex items-center justify-center text-[18px] flex-shrink-0">
                🚪
              </div>
              <span className="text-[14px] font-semibold text-ap-red">{t.logout}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-ap-tertiary pb-2">
          {t.version}
        </p>
      </div>
    </div>
  );
}
