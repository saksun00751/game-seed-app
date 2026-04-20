import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiGet } from "@/lib/api/client";

const ALLOWED_QUERY_KEYS = ["page", "per_page", "q", "status", "reward_type", "mode"] as const;

export async function GET(req: NextRequest) {
  const [token, lang] = await Promise.all([getApiToken(), getLangCookie()]);
  const search = new URLSearchParams();
  for (const key of ALLOWED_QUERY_KEYS) {
    const value = req.nextUrl.searchParams.get(key);
    if (value && value.trim()) {
      search.set(key, value.trim());
    }
  }
  const query = search.toString();
  const path = `/reward/history${query ? `?${query}` : ""}`;

  try {
    const data = await apiGet(path, token ?? undefined, lang);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
