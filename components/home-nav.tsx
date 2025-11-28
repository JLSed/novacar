"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconLogout, IconUserCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useAuth from "@/hooks/useAuth";

export function HomeNav() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const userName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "User";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/novacar_logo.svg"
            width={80}
            height={80}
            alt="NovaCar Logo"
            className="cursor-pointer"
            onClick={() => router.push("/home")}
          />
        </div>

        {/* Center Navigation */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl mx-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/home")}
            className="hidden md:flex"
          >
            Browse Cars
          </Button>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cars..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <IconUserCircle className="h-5 w-5" />
              <span className="hidden sm:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <IconLogout className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
