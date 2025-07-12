import { Footer } from "@/components/navbar/footer";
import { NavBar } from "@/components/navbar/navbar";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in">
      <NavBar />
      <div className="flex flex-col grow">{children}</div>
      <Footer />
    </div>
  );
}
