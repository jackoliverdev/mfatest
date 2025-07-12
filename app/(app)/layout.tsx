import AppSidebar from "@/components/app/shared/sidebar";
import { FC, ReactNode } from "react";

const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout; 