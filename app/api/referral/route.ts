import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false }, { status: 401 });

  // DB flow removed: return placeholder response until referral API is ready.
  return NextResponse.json({
    success: true,
    data: {
      referralCode: "LT" + user.id.slice(0, 6).toUpperCase(),
      referredCount: 0,
      totalEarned: 0,
      referrals: [],
    },
  });
}
