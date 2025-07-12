"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MenuIcon } from "lucide-react";

export const NavbarMobile = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="-mr-4">
            <MenuIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent className="flex flex-col p-4 gap-2 w-48">
            <NavigationMenuLink asChild>
              <Link href="/" className="px-4 py-2 text-sm font-medium hover:underline">Home</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="/service" className="px-4 py-2 text-sm font-medium hover:underline">Service</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="/contact" className="px-4 py-2 text-sm font-medium hover:underline">Contact</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="/blogs" className="px-4 py-2 text-sm font-medium hover:underline">Blogs</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="/case-studies" className="px-4 py-2 text-sm font-medium hover:underline">Case Studies</Link>
            </NavigationMenuLink>
            <div className="flex flex-col gap-2 mt-2">
              <Button asChild variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Register</Link>
              </Button>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
