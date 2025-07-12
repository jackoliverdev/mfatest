"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Settings, LogOut } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { useFirebaseApp } from "reactfire";

const AppSidebar = () => {
  const pathname = usePathname();
  const app = useFirebaseApp();
  const auth = getAuth(app);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // You might want to redirect the user to the login page after sign-out.
      // This can be handled in a parent component or with a router push.
      window.location.href = '/'; // Simple redirect
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navItems = [
    {
      href: "/app",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/app/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-gray-100 dark:bg-gray-900/50 p-6 flex flex-col">
      <div className="flex-grow">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <img src="/logo.svg" alt="Example Ltd Logo" className="w-5 h-5 text-gray-500" />
          </div>
          <span className="font-semibold text-lg">Example Ltd</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                  : "text-gray-500 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-800/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-gray-500 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-800/50 w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar; 