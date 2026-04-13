import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiGet, ApiError } from "@/lib/api/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  void req;
  const token = await getApiToken();
  if (!token) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { requestId } = await params;
  const id = requestId.trim();
  if (!id) {
    return NextResponse.json({ success: false, message: "ไม่พบ request_id" }, { status: 400 });
  }

  const lang = await getLangCookie();
  try {
    const data = await apiGet<Record<string, unknown>>(
      `/smkpay/qrcode/${encodeURIComponent(id)}`,
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
    return NextResponse.json({ success: false, message: "ไม่สามารถโหลด QR Code ได้" }, { status: 500 });
  }
}
