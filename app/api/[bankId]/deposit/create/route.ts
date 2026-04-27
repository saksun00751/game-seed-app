import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiPost, ApiError } from "@/lib/api/client";

function normalizeBankId(bankId: string): string | null {
  const id = bankId.trim();
  return /^[A-Za-z0-9_-]+$/.test(id) ? id : null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bankId: string }> },
) {
  const token = await getApiToken();
  if (!token) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { bankId } = await params;
  const id = normalizeBankId(bankId);
  if (!id) return NextResponse.json({ success: false, message: "ไม่พบ bank_id" }, { status: 400 });

  let payload: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const lang = await getLangCookie();

  try {
    const data = await apiPost<Record<string, unknown>>(
      `/${id}/deposit/create`,
      payload,
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
    return NextResponse.json({ success: false, message: "ไม่สามารถสร้างรายการฝากเงินได้" }, { status: 500 });
  }
}
