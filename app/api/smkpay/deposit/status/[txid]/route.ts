import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiGet, ApiError } from "@/lib/api/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txid: string }> },
) {
  void req;
  const token = await getApiToken();
  if (!token) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { txid } = await params;
  const id = txid.trim();
  if (!id) {
    return NextResponse.json({ success: false, message: "ไม่พบ txid" }, { status: 400 });
  }

  const lang = await getLangCookie();
  try {
    const data = await apiGet<Record<string, unknown>>(
      `/smkpay/deposit/status/${encodeURIComponent(id)}`,
      token,
      lang,
    );
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.payload && typeof e.payload === "object") {
        return NextResponse.json(e.payload, { status: e.status || 400 });
      }
      return NextResponse.json({ success: false, message: e.message }, { status: e.status || 400 });
    }
    return NextResponse.json({ success: false, message: "ไม่สามารถตรวจสอบสถานะฝากเงินได้" }, { status: 500 });
  }
}
