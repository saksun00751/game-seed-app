import type { Metadata } from "next";
import WithdrawPage from "@/components/withdraw/WithdrawPage";
import { requireAuth } from "@/lib/session/auth";
import { apiGet } from "@/lib/api/client";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";

export const metadata: Metadata = { title: "ถอนเงิน — Lotto" };

interface LoadBalanceProfile {
  name:                  string;
  bank_code:             number;
  acc_no:                string;
  balance:               string;
  withdraw_min:          string;
  withdraw_max:          number;
  maxwithdraw_day:       string;
  withdraw_sum_today:    number;
  withdraw_remain_today: number;
  withdraw_limit_amount: string;
}

interface LoadBalanceResponse {
  success:   boolean;
  withdraw:  boolean;
  profile:   LoadBalanceProfile;
  system: {
    notice: string | null;
  };
}

interface ApiBankItem {
  code:      number;
  name_th:   string;
  shortcode: string;
  image_url: string;
}

interface BanksResponse {
  data?: { banks?: ApiBankItem[] };
}

export default async function WithdrawRoute() {
  await requireAuth();
  const [token, lang] = await Promise.all([getApiToken(), getLangCookie()]);

  let profile: LoadBalanceProfile | null = null;
  let canWithdraw = true;
  let notice: string | null = null;

  try {
    const res = await apiGet<LoadBalanceResponse>("/member/loadbalance", token ?? undefined, lang);
    profile     = res.profile;
    canWithdraw = res.withdraw;
    notice      = res.system?.notice ?? null;
  } catch {}

  let bankName: string | null = null;
  if (profile?.bank_code) {
    try {
      const res = await apiGet<BanksResponse>("/auth/register/banks");
      bankName = res.data?.banks?.find((b) => b.code === profile!.bank_code)?.name_th ?? null;
    } catch {}
  }

  return (
    <div className="min-h-screen bg-ap-bg pb-20 sm:pb-8">
      <WithdrawPage
        displayName={profile?.name ?? "สมาชิก"}
        bankName={bankName}
        bankAccount={profile?.acc_no ?? null}
        balance={parseFloat(profile?.balance ?? "0")}
        withdrawMin={parseFloat(profile?.withdraw_min ?? "100")}
        withdrawMax={profile?.withdraw_max ?? 200000}
        withdrawMaxDay={parseFloat(profile?.maxwithdraw_day ?? "200000")}
        withdrawSumToday={profile?.withdraw_sum_today ?? 0}
        withdrawRemainToday={profile?.withdraw_remain_today ?? 0}
        withdrawLimitAmount={parseFloat(profile?.withdraw_limit_amount ?? "0")}
        canWithdraw={canWithdraw}
        notice={notice}
      />
    </div>
  );
}
