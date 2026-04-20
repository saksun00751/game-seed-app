import type { Metadata } from "next";
import RewardPage from "@/components/reward/RewardPage";

export const metadata: Metadata = { title: "รางวัล — Lotto" };

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RewardRoute({ params }: Props) {
  const { locale } = await params;
  return <RewardPage locale={locale} />;
}
