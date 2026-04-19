import { NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiGet, ApiError } from "@/lib/api/client";
import type { NavbarConfigResponse } from "@/lib/api/navbar";

export async function GET() {
  const apiToken = await getApiToken();
  const lang     = await getLangCookie();
  try {
    const data = await apiGet<NavbarConfigResponse>(
      "/lotto/navbar-config",
      apiToken ?? undefined,
      lang,
    );
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : "ไม่สามารถดึงข้อมูล navbar config ได้";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
