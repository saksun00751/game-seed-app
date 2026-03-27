import type { Metadata } from "next";

export const metadata: Metadata = { title: "แนะนำเพื่อน — Lotto" };

/*
import { headers } from "next/headers";
import ReferralPage from "@/components/referral/ReferralPage";
import { requireAuth } from "@/lib/session/auth";

interface ReferralItem {
  id: string;
  totalEarned: number;
  createdAt: string;
  referee: {
    displayName: string | null;
    phone: string;
    createdAt: string;
  };
}

interface ReferralApiResponse {
  success: boolean;
  data?: {
    referralCode: string;
    referredCount: number;
    totalEarned: number;
    referrals: ReferralItem[];
  };
}

export default async function ReferralRoute() {
  const user = await requireAuth();
  const headersList = await headers();
  const host  = headersList.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";

  let referralCode = user.referralCode ?? ("LT" + user.id.slice(0, 6).toUpperCase());
  let referredCount = 0;
  let totalEarned = 0;
  let referrals: ReferralItem[] = [];

  try {
    const res = await fetch(`${proto}://${host}/api/referral`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as ReferralApiResponse;
      if (data.success && data.data) {
        referralCode = data.data.referralCode || referralCode;
        referredCount = data.data.referredCount ?? 0;
        totalEarned = data.data.totalEarned ?? 0;
        referrals = data.data.referrals ?? [];
      }
    }
  } catch {}

  const referralLink = `${proto}://${host}/register?ref=${referralCode}`;

  return (
    <div className="min-h-screen bg-ap-bg pb-20 sm:pb-8">
      <ReferralPage
        referralCode={referralCode}
        referralLink={referralLink}
        displayName={user.displayName ?? "สมาชิก"}
        referredCount={referredCount}
        totalEarned={totalEarned}
        referrals={referrals}
      />
    </div>
  );
}
*/

export default function ReferralRoute() {
  return (
    <div className="min-h-screen bg-ap-bg pb-20 sm:pb-8 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-[56px] sm:text-[84px] font-extrabold text-ap-primary leading-none">Comming Soon</p>
        <p className="text-[34px] sm:text-[52px] font-bold text-ap-tertiary mt-4 leading-tight">Wait for API</p>
      </div>
    </div>
  );
}
