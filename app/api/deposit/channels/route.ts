import { NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiGet, ApiError } from "@/lib/api/client";

export interface DepositChannelsResponse {
  success: boolean;
  data?: {
    deposit?: {
      bank:    number;
      payment: number;
      tw:      number;
      slip:    number;
      sort: {
        bank:    number | null;
        payment: number | null;
        tw:      number | null;
        slip:    number | null;
      };
    };
  };
  message?: string;
}

interface MemberProfileResponse {
  success?: boolean;
  profile?: {
    deposit?: {
      bank?: number | string | boolean;
      payment?: number | string | boolean;
      tw?: number | string | boolean;
      slip?: number | string | boolean;
      sort?: {
        bank?: number | null;
        payment?: number | null;
        tw?: number | null;
        slip?: number | null;
      };
    };
  };
}

function asEnabled(value: unknown): number {
  if (value === true) return 1;
  if (value === false || value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) && n === 1 ? 1 : 0;
}

export async function GET() {
  const token = await getApiToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const lang = await getLangCookie();
  try {
    const profileData = await apiGet<MemberProfileResponse>("/member/profile", token, lang);
    const deposit = profileData?.profile?.deposit;

    if (deposit) {
      return NextResponse.json({
        success: true,
        data: {
          deposit: {
            bank: asEnabled(deposit.bank),
            payment: asEnabled(deposit.payment),
            tw: asEnabled(deposit.tw),
            slip: asEnabled(deposit.slip),
            sort: {
              bank: deposit.sort?.bank ?? null,
              payment: deposit.sort?.payment ?? null,
              tw: deposit.sort?.tw ?? null,
              slip: deposit.sort?.slip ?? null,
            },
          },
        },
      } satisfies DepositChannelsResponse);
    }

    // Fallback: use legacy endpoint when profile doesn't include deposit config
    const fallback = await apiGet<DepositChannelsResponse>("/deposit/channels", token, lang);
    return NextResponse.json(fallback);
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "ไม่สามารถโหลดช่องทางฝากเงินได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
