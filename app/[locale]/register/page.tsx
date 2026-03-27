import type { Metadata } from "next";
import RegisterPageClient from "@/components/auth/RegisterPageClient";
import { apiGet } from "@/lib/api/client";
import type { BankOption } from "@/components/auth/RegisterForm";
import { getSiteMeta, getLogoUrl } from "@/lib/api/site";

export const metadata: Metadata = { title: "สมัครสมาชิก — Lotto" };

interface Props {
  params?: Promise<{ locale: string }>;
  searchParams?: Promise<{ ref?: string }>;
}

interface ApiBankItem {
  code:      number;
  name_th:   string;
  shortcode: string;
  image:     string;
  image_url: string;
}

interface BanksResponse {
  success?: boolean;
  data?: { banks?: ApiBankItem[] };
}

export default async function RegisterPage({ searchParams }: Props) {
  const params     = await searchParams;
  const defaultRef = (params?.ref ?? "").toUpperCase();

  let banks: BankOption[] = [];
  try {
    const res = await apiGet<BanksResponse>("/auth/register/banks");
    banks = (res.data?.banks ?? []).map((b) => ({
      code:      b.code,
      name_th:   b.name_th,
      shortcode: b.shortcode,
      image:     b.image_url || b.image,
    }));
  } catch {}

  const meta    = await getSiteMeta();
  const logoUrl = meta ? getLogoUrl(meta.logo) : "/logo.png";

  return (
    <main className="min-h-screen bg-ap-bg flex flex-col items-center justify-center p-5">

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-ap-green/[0.04] blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-ap-blue/[0.03] blur-3xl" />
      </div>

      <RegisterPageClient defaultRef={defaultRef} banks={banks} logoUrl={logoUrl} />
    </main>
  );
}
