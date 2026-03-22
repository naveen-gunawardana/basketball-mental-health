"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserPlus, Menu, X, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/advice", label: "Advice" },
  { href: "/mentors", label: "Mentors" },
  { href: "/dashboard", label: "Locker Room" },
];

const authedNavItems = [
  { href: "/", label: "Home" },
  { href: "/advice", label: "Advice" },
  { href: "/dashboard", label: "Locker Room" },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const matchIdRef = useRef<string | null>(null);

  function markRead() {
    if (!matchIdRef.current) return;
    localStorage.setItem(`lastReadAt:${matchIdRef.current}`, new Date().toISOString());
    setUnreadCount(0);
  }

  async function fetchAvatar(userId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("avatar_url").eq("id", userId).single();
    setAvatarUrl(data?.avatar_url ?? null);
  }

  async function fetchUnread(userId: string) {
    const supabase = createClient();
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .or(`mentor_id.eq.${userId},player_id.eq.${userId}`)
      .eq("status", "active")
      .maybeSingle();
    if (!match) return;

    matchIdRef.current = match.id;

    // If already on dashboard, mark as read immediately
    if (window.location.pathname.startsWith("/dashboard")) {
      markRead();
      return;
    }

    const lastRead = localStorage.getItem(`lastReadAt:${match.id}`) ?? new Date(0).toISOString();
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("match_id", match.id)
      .neq("sender_id", userId)
      .gt("created_at", lastRead);
    setUnreadCount(count ?? 0);

    const channel = supabase
      .channel(`nav-unread:${match.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `match_id=eq.${match.id}`,
      }, (payload) => {
        if (payload.new.sender_id !== userId) {
          setUnreadCount((n) => n + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  useEffect(() => {
    const supabase = createClient();
    let cleanupUnread: (() => void) | undefined;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchAvatar(data.user.id);
        fetchUnread(data.user.id).then((fn) => { cleanupUnread = fn; });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAvatar(session.user.id);
        fetchUnread(session.user.id).then((fn) => { cleanupUnread = fn; });
      } else {
        setAvatarUrl(null);
        setUnreadCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
      cleanupUnread?.();
    };
  }, []);

  // Mark as read whenever user is on the dashboard
  useEffect(() => {
    if (pathname.startsWith("/dashboard")) {
      markRead();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navItems = user ? authedNavItems : publicNavItems;
  const displayName = user?.user_metadata?.name ?? user?.email ?? "";

  return (
    <nav className="sticky top-0 z-50 border-b border-offWhite-300 bg-offWhite-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight text-navy">
            Mentality Sports
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const showBadge = item.href === "/dashboard" && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (item.href === "/dashboard") markRead(); }}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-navy bg-navy/8"
                    : "text-navy/60 hover:text-navy hover:bg-navy/5"
                )}
              >
                {item.label}
                {showBadge && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white text-xs font-semibold hover:bg-navy/80 transition-colors overflow-hidden"
                title="Your profile"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </Link>
            </div>
          ) : (
            <Link
              href="/signup"
              className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Sign Up
            </Link>
          )}
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
            const showBadge = item.href === "/dashboard" && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { setMobileOpen(false); if (item.href === "/dashboard") setUnreadCount(0); }}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-navy bg-navy/8"
                    : "text-navy/60 hover:text-navy hover:bg-navy/5"
                )}
              >
                {item.label}
                {showBadge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2">
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-navy/20 px-4 py-2.5 text-sm font-medium text-navy hover:bg-navy/5"
              >
                My Profile
              </Link>
            ) : (
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
