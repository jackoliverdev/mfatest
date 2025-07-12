import dynamic from "next/dynamic";
import LegalHero from "@/components/website/legal/legal-hero";

const LegalTabs = dynamic(() => import("@/components/website/legal/legal-tabs"), { ssr: false });

export default function LegalPage() {
  return (
    <>
      <LegalHero />
      <LegalTabs />
    </>
  );
}
