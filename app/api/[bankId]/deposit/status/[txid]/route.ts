import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiGet, ApiError } from "@/lib/api/client";

function normalizeBankId(bankId: string): string | null {
  const id = bankId.trim();
  return /^[A-Za-z0-9_-]+$/.test(id) ? id : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bankId: string; txid: string }> },
) {
  void req;
  const token = await getApiToken();
  if (!token) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { bankId, txid } = await params;
  const id = normalizeBankId(bankId);
  const transactionId = txid.trim();
  if (!id) return NextResponse.json({ success: false, message: "ไม่พบ bank_id" }, { status: 400 });
  if (!transactionId) return NextResponse.json({ success: false, message: "ไม่พบ txid" }, { status: 400 });

  const lang = await getLangCookie();
  try {
    const data = await apiGet<Record<string, unknown>>(
      `/${id}/deposit/status/${encodeURIComponent(transactionId)}`,
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
