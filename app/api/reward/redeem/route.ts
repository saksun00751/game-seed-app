import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiPost, ApiError } from "@/lib/api/client";

interface RewardRedeemRequest {
  reward_id?: number | string;
}

interface RewardRedeemResponse {
  success?: boolean;
  message?: string;
  point?: number;
  mode?: string;
  redemption_status?: string;
  format?: {
    title?: string;
    msg?: string;
    img?: string;
  };
  redemption_id?: number;
}

function parseRewardId(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return 0;
}

export async function POST(req: NextRequest) {
  const token = await getApiToken();
  if (!token) {
    return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  let body: RewardRedeemRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const rewardId = parseRewardId(body.reward_id);
  if (rewardId <= 0) {
    return NextResponse.json({ success: false, message: "ไม่พบ reward_id" }, { status: 400 });
  }

  const lang = await getLangCookie();
  try {
    const res = await apiPost<RewardRedeemResponse>(
      "/reward/redeem",
      { reward_id: rewardId },
      token,
      lang,
    );
    return NextResponse.json(res);
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "ไม่สามารถแลกรางวัลได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
