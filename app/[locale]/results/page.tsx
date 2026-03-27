import type { Metadata } from "next";
import Navbar from "@/components/layout/NavbarServer";
import ResultsPage from "@/components/results/ResultsPage";
import { requireAuth } from "@/lib/session/auth";

export const metadata: Metadata = { title: "ลิ้งค์ดูผล — Lotto" };

export default async function ResultsRoute() {
  const user = await requireAuth();
  const phone = user.phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");

  return (
    <div className="min-h-screen bg-ap-bg pb-20 sm:pb-8">
      <Navbar />
      <ResultsPage />
    </div>
  );
}
