"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserPlus, Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/resources", label: "Resources" },
  { href: "/mentors", label: "Mentors" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-offWhite-300 bg-offWhite-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-white stroke-2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight text-navy hidden sm:block">
            [Platform Name]
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-navy bg-navy/8"
                    : "text-navy/60 hover:text-navy hover:bg-navy/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/signup"
            className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Get Involved
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md hover:bg-navy/5 text-navy"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-offWhite-300 bg-offWhite-50 px-4 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-navy bg-navy/8"
                    : "text-navy/60 hover:text-navy hover:bg-navy/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Get Involved
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
