import { NextResponse } from "next/server";
import { getTheme } from "@/lib/api/theme";

export async function GET() {
  const theme = await getTheme();
  return NextResponse.json(theme);
}
