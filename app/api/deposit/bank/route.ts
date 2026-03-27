import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false }, { status: 401 });

  return NextResponse.json(
    { success: false, message: "ระบบฝากเงินกำลังย้ายไป API" },
    { status: 503 },
  );
}
