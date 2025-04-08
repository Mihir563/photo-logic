"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast, Toaster } from "sonner";
import NotificationCenter from "./notification";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [user, setUser] = useState<{
    email: string;
    avatar_url: string;
  } | null>(null);
  const router = useRouter();
  
  const handleAuth = () => {
    router.push("/auth");
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      router.push("/auth");
      toast.success("Logged Out Successfully")
    }
  };


useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      // User logged in
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!profileError) {
        setUser(profileData);
        setName(profileData.name);
        setIsLoggedIn(true);
      }
    } else {
      // User logged out
      setUser(null);
      setName("");
      setIsLoggedIn(false);
    }
  });

  return () => {
    subscription.unsubscribe(); // Clean up
  };
}, []);


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl ml-2">
            <svg
              width="200"
              height="80"
              viewBox="0 0 300 80"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="30" fill="#1E3A8A" />
              <text
                x="40"
                y="47"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                fontSize="28"
                fill="#ffffff"
                fontWeight="bold"
              >
                PL
              </text>
              <text
                x="90"
                y="50"
                fontFamily="Helvetica, Arial, sans-serif"
                fontSize="32"
                fill="#1E3A8A"
                fontWeight="bold"
              >
                PhotoLogic
              </text>
            </svg>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Discover</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                        href={"/"}
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Featured Photographers
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Discover our top-rated photographers for your next
                            project
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <Link href="/categories/wedding" legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Wedding
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Capture your special day with our wedding
                            photographers
                          </p>
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link href="/categories/portrait" legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Portrait
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Professional portrait photographers for individuals
                            and families
                          </p>
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/categories/commercial"
                        legacyBehavior
                        passHref
                      >
                        <NavigationMenuLink
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Commercial
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Elevate your brand with our commercial photographers
                          </p>
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/how-it-works" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    )}
                  >
                    How It Works
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/pricing" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    )}
                  >
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <Button
              onClick={() => router.push("/search")}
              variant="ghost"
              size="icon"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
          <div className=" md:flex">
           <NotificationCenter/>
          </div>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/bookings">Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/messages">Messages</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" onClick={() => handleAuth()}>
                Log In
              </Button>
              <Button onClick={() => handleAuth()}>Sign Up</Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-4">
                <Link href="/" className="font-bold text-xl px-2">
                  <svg
                    width="200"
                    height="80"
                    viewBox="0 0 300 80"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="40" cy="40" r="30" fill="#1E3A8A" />
                    <text
                      x="40"
                      y="47"
                      textAnchor="middle"
                      fontFamily="Arial, sans-serif"
                      fontSize="28"
                      fill="#ffffff"
                      fontWeight="bold"
                    >
                      PL
                    </text>
                  </svg>
                </Link>

                <div className="grid gap-2">
                  <Link
                    href="#discover"
                    className="flex py-2 px-2 hover:bg-gray-300 rounded-xl"
                  >
                    Discover
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="flex py-2 px-2 hover:bg-gray-300 rounded-xl"
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex py-2 px-2 hover:bg-gray-300 rounded-xl"
                  >
                    Pricing
                  </Link>
                </div>

                {isLoggedIn ? (
                  <div className="grid gap-2 mt-4">
                    <Link
                      href="/dashboard"
                      className="flex py-2 px-2 hover:bg-gray-300 rounded-xl"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="flex py-2 px-2 hover:bg-gray-300 rounded-xl"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/bookings"
                      className="flex py-2 px-2 hover:bg-gray-300 rounded-xl"
                    >
                      Bookings
                    </Link>
                    <Link
                      href="/dashboard/messages"
                      className="flex py-2 px-2 hover:bg-gray-300 rounded-xl"
                    >
                      Messages
                    </Link>
                    <Button
                      variant="ghost"
                      className="justify-start px-2"
                      onClick={() => handleLogout()}
                    >
                      Log Out
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2 mt-4">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleAuth()}
                    >
                      Sign Up
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAuth()}
                    >
                      Log In
                    </Button>
                  </div>
                )}
              </div>
              <Toaster/>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
