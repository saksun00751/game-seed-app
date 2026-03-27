import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiPost } from "@/lib/api/client";

interface LoginResponse {
  success: boolean;
  data?:   { url?: string; provider?: string; code?: string };
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { id, game } = await req.json() as { id: string; game: string };

    const [apiToken, lang] = await Promise.all([getApiToken(), getLangCookie()]);

    const res = await apiPost<LoginResponse>(
      "/games/login",
      { id, game },
      apiToken ?? undefined,
      lang,
    );

    const url = res.data?.url;

    if (!url) {
      return NextResponse.json({ error: "ไม่พบ URL สำหรับเข้าเกม" }, { status: 400 });
    }

    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 400 },
    );
  }
}
