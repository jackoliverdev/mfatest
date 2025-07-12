import Link from "next/link";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuContent, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

export const NavBar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container px-6 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <img src="/logo.svg" alt="Example Ltd Logo" className="w-5 h-5 text-gray-500" />
            </div>
            <span className="font-semibold text-lg">Example Ltd</span>
          </Link>
        </div>
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/" className="px-4 py-2 text-sm font-medium hover:underline">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/service" className="px-4 py-2 text-sm font-medium hover:underline">Service</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/contact" className="px-4 py-2 text-sm font-medium hover:underline">Contact</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-4 py-2 text-sm font-medium">Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[150px] gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/blogs" className="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm">
                        Blogs
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/case-studies" className="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm">
                        Case Studies
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Register</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};