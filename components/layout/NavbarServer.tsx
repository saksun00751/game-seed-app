import Navbar from "./Navbar";
import { getSiteMeta, getLogoUrl } from "@/lib/api/site";

export default async function NavbarServer() {
  const meta    = await getSiteMeta();
  const logoUrl = meta ? getLogoUrl(meta.logo) : "/logo.png";
  return <Navbar logoUrl={logoUrl} balance={0} diamond={0} userName="สมาชิก" userPhone="" />;
}
