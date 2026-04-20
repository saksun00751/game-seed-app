import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiPost, ApiError } from "@/lib/api/client";

type ClaimSource = "bonus" | "cashback" | "faststart" | "ic";

interface WalletClaimRequest {
  source?: ClaimSource | string;
}

interface WalletClaimResponse {
  success?: boolean;
  message?: string;
}

function isClaimSource(value: unknown): value is ClaimSource {
  return value === "bonus" || value === "cashback" || value === "faststart" || value === "ic";
}

export async function POST(req: NextRequest) {
  const token = await getApiToken();
  if (!token) {
    return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  let body: WalletClaimRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  if (!isClaimSource(body.source)) {
    return NextResponse.json({ success: false, message: "source ไม่ถูกต้อง" }, { status: 400 });
  }

  const lang = await getLangCookie();
  try {
    const res = await apiPost<WalletClaimResponse>(
      "/wallet/claim",
      { source: body.source },
      token,
      lang,
    );
    return NextResponse.json(res);
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "ไม่สามารถรับโบนัสได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
