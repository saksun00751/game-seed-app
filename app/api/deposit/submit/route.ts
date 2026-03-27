import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile }         from "fs/promises";
import path                         from "path";
import { getCurrentUser }           from "@/lib/session/auth";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "slips");

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const amountRaw   = formData.get("amount")      as string | null;
  const method      = formData.get("method")      as string | null;
  const accountCode = parseInt((formData.get("accountCode") as string) ?? "0", 10);
  const bankShortcode = (formData.get("bankShortcode") as string) ?? "";
  const slip        = formData.get("slip")        as File | null;

  const amount = parseFloat(amountRaw ?? "0");
  if (!amount || amount < 1) {
    return NextResponse.json({ success: false, message: "จำนวนเงินไม่ถูกต้อง" }, { status: 400 });
  }
  if (!accountCode) {
    return NextResponse.json({ success: false, message: "ไม่ระบุบัญชีรับเงิน" }, { status: 400 });
  }

  // ── Save slip file ───────────────────────────────────────────────────────────
  let slipFilename = "";
  if (slip && slip.size > 0) {
    const ext      = slip.name.split(".").pop()?.toLowerCase() ?? "jpg";
    slipFilename   = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes    = await slip.arrayBuffer();

    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(path.join(UPLOAD_DIR, slipFilename), Buffer.from(bytes));
    } catch (e) {
      console.error("[deposit/submit] file save error:", e);
      slipFilename = "";
    }
  }

  const detail = JSON.stringify({
    method,
    slip:    slipFilename || null,
    submittedAt: new Date().toISOString(),
  });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "0.0.0.0";
  void accountCode;
  void bankShortcode;
  void amount;
  void detail;
  void ip;
  return NextResponse.json(
    { success: false, message: "ระบบฝากเงินกำลังย้ายไป API" },
    { status: 503 },
  );
}
