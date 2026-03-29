import { NextRequest, NextResponse } from "next/server";
import { getApiToken, getLangCookie } from "@/lib/session/cookies";
import { apiPost, ApiError } from "@/lib/api/client";

export interface LoadBankAccount {
  acc_no:      string;
  acc_name:    string;
  bank_name:   string;
  bank_pic:    string;
  qr_pic:      string;
  qrcode:      boolean;
  code:        number;
  deposit_min: string;
  remark:      string;
}

export interface LoadBankResponse {
  success: boolean;
  bank?:   LoadBankAccount[];
  message?: string;
}

export async function POST(req: NextRequest) {
  const token = await getApiToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  let body: { method: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const lang = await getLangCookie();
  try {
    const data = await apiPost<LoadBankResponse>(
      "/deposit/loadbank",
      { method: body.method },
      token,
      lang,
    );
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "ไม่สามารถโหลดข้อมูลบัญชีได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
