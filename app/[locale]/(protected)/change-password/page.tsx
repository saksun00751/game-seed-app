import type { Metadata } from "next";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";

export const metadata: Metadata = { title: "เปลี่ยนรหัสผ่าน — Lotto" };

export default async function ChangePasswordPage() {
  return (
    <div className="min-h-screen bg-ap-bg pb-20 sm:pb-8">
      <ChangePasswordModal hasPassword />
    </div>
  );
}
