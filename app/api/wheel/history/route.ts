import { NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiGet } from "@/lib/api/client";

interface HistoryResponse {
  success: boolean;
  data?: {
    history?: Array<{
      date: string;
      data: Array<{ credit: string; time: string }>;
    }>;
  };
  message?: string;
}

export async function GET() {
  try {
    const [apiToken, lang] = await Promise.all([getApiToken(), getLangCookie()]);
    const res = await apiGet<HistoryResponse>("/wheel/history", apiToken ?? undefined, lang);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 400 },
    );
  }
}
