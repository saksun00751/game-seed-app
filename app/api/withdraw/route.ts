import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiPost, ApiError } from "@/lib/api/client";

interface WithdrawResponse {
  success: boolean;
  message?: string;
}

export async function POST(req: NextRequest) {
  const token = await getApiToken();
  if (!token) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  let body: { amount: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const { amount } = body;
  if (!amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ success: false, message: "จำนวนเงินไม่ถูกต้อง" }, { status: 400 });
  }

  const lang = await getLangCookie();

  try {
    const res = await apiPost<WithdrawResponse>(
      "/wallet/withdraw",
      { amount: String(amount) },
      token,
      lang,
    );
    return NextResponse.json(res);
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
