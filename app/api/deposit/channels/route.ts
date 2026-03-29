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

export async function GET() {
  const token = await getApiToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const lang = await getLangCookie();
  try {
    const data = await apiGet<DepositChannelsResponse>("/deposit/channels", token, lang);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "ไม่สามารถโหลดช่องทางฝากเงินได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
