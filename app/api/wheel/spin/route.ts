import { NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiPost } from "@/lib/api/client";

interface SpinResponse {
  success: boolean;
  diamond?: number;
  message?: string;
  format?: {
    title?:   string;
    msg?:     string;
    img?:     string;
    point?:   number;
    diamond?: number;
  };
}

export async function POST() {
  try {
    const [apiToken, lang] = await Promise.all([getApiToken(), getLangCookie()]);

    const res = await apiPost<SpinResponse>("/wheel/spin", {}, apiToken ?? undefined, lang);

    const fmt = res.format ?? {};

    return NextResponse.json({
      point:   fmt.point,
      diamond: fmt.diamond ?? res.diamond,
      title:   fmt.title,
      msg:     fmt.msg,
      img:     fmt.img,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 400 },
    );
  }
}
